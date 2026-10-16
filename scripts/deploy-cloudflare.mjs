#!/usr/bin/env node
/**
 * 直接调用 Cloudflare Pages 直传 API 部署 dist 目录。
 *
 * 为什么需要它：`npx wrangler pages deploy` 在本机网络下会因为 api.cloudflare.com 的
 * IPv6 记录不可达而报 `fetch failed / UND_ERR_CONNECT_TIMEOUT`。
 * 本脚本强制只使用 IPv4 解析并带重试，因此在这类网络环境下更稳定，
 * 也可以直接放进 CI 使用。
 *
 * 用法：
 *   node scripts/deploy-cloudflare.mjs                       # 默认部署 dist → personal-website
 *   node scripts/deploy-cloudflare.mjs --project my-site --branch main --dir dist
 *
 * 凭据来源（按顺序尝试）：
 *   1. 环境变量 CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID（推荐，长期可用）
 *   2. wrangler 的 OAuth 配置（先执行一次 `npx wrangler login`，Token 约 1 小时过期）
 */

import crypto from 'node:crypto'
import dns from 'node:dns'
import fs from 'node:fs'
import https from 'node:https'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const API_HOST = 'api.cloudflare.com'
const CRLF = '\r\n'

/* ---------- 参数 ---------- */

const argv = process.argv.slice(2)
const arg = (name, fallback) => {
  const index = argv.indexOf(`--${name}`)
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback
}

const projectName = arg('project', 'personal-website')
const branch = arg('branch', 'main')
const distDir = path.resolve(arg('dir', 'dist'))

/* ---------- 凭据 ---------- */

function readWranglerConfig() {
  const candidates = [
    path.join(process.env.APPDATA ?? '', 'xdg.config', '.wrangler', 'config', 'default.toml'),
    path.join(os.homedir(), '.config', '.wrangler', 'config', 'default.toml'),
    path.join(os.homedir(), '.wrangler', 'config', 'default.toml'),
  ]
  for (const file of candidates) {
    try {
      if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8')
    } catch {
      /* 继续尝试下一个路径 */
    }
  }
  return null
}

function resolveCredentials() {
  if (process.env.CLOUDFLARE_API_TOKEN) {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    if (!accountId) {
      fail('设置了 CLOUDFLARE_API_TOKEN，但缺少 CLOUDFLARE_ACCOUNT_ID 环境变量。')
    }
    return { token: process.env.CLOUDFLARE_API_TOKEN, accountId, source: '环境变量 API Token' }
  }

  const toml = readWranglerConfig()
  const token = toml && /oauth_token\s*=\s*"([^"]+)"/.exec(toml)?.[1]
  if (!token) {
    fail(
      '没有找到 Cloudflare 凭据。请任选一种方式：\n' +
        '  a) npx wrangler login（然后重跑本脚本）\n' +
        '  b) 设置 CLOUDFLARE_API_TOKEN 与 CLOUDFLARE_ACCOUNT_ID 环境变量',
    )
  }
  const expiry = toml && /expiration_time\s*=\s*"([^"]+)"/.exec(toml)?.[1]
  if (expiry && new Date(expiry).getTime() < Date.now()) {
    fail(`wrangler 的 OAuth Token 已于 ${expiry} 过期，请重新执行 npx wrangler login，或改用 API Token。`)
  }
  // OAuth 登录态对应的账号 ID 由接口查询得到
  return { token, accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? null, source: 'wrangler OAuth 登录' }
}

function fail(message) {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

/* ---------- HTTP（强制 IPv4 + 重试） ---------- */

// 强制只解析 IPv4。注意必须原样透传调用方给的 options（尤其是 all）：
// Node 20+ 默认开启 autoSelectFamily（Happy Eyeballs），此时会以 all: true 调用 lookup
// 并期望得到地址数组；若强行改成 all: false 返回裸字符串，会报 ERR_INVALID_IP_ADDRESS。
const ipv4Lookup = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, family: 4 }, callback)
}

function request({ method, path: urlPath, token, body, contentType, timeout = 180000 }) {
  return new Promise((resolve, reject) => {
    const headers = { Host: API_HOST, Authorization: `Bearer ${token}` }
    if (contentType) headers['Content-Type'] = contentType
    if (body) headers['Content-Length'] = Buffer.byteLength(body)

    const req = https.request(
      {
        host: API_HOST,
        port: 443,
        method,
        path: urlPath,
        headers,
        lookup: ipv4Lookup,
        timeout,
      },
      (res) => {
        const chunks = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8')
          let json = null
          try {
            json = JSON.parse(text)
          } catch {
            /* 非 JSON 响应，保留原文 */
          }
          resolve({ status: res.statusCode, json, text })
        })
      },
    )

    req.on('timeout', () => req.destroy(new Error('请求超时')))
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

async function requestWithRetry(options, attempts = 4) {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await request(options)
    } catch (error) {
      lastError = error
      const code = error.code ?? error.cause?.code ?? ''
      console.log(`  · 第 ${attempt}/${attempts} 次请求失败（${code || error.message}），重试中…`)
      await new Promise((resolve) => setTimeout(resolve, 800 * attempt))
    }
  }
  throw lastError
}

/* ---------- 收集 dist 文件 ---------- */

function collectFiles(root) {
  if (!fs.existsSync(root)) fail(`找不到构建目录：${root}，请先执行 npm run build`)
  const files = []
  const walk = (dir, prefix) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      const urlPath = `${prefix}/${entry.name}`
      if (entry.isDirectory()) walk(full, urlPath)
      else files.push({ urlPath, file: full })
    }
  }
  walk(root, '')
  if (files.length === 0) fail(`${root} 是空目录，请先执行 npm run build`)
  return files
}

function gitInfo() {
  try {
    const hash = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
    const message = execFileSync('git', ['log', '-1', '--pretty=%s'], { encoding: 'utf8' }).trim()
    return { hash, message }
  } catch {
    return { hash: null, message: null }
  }
}

/* ---------- 主流程 ---------- */

async function main() {
  const { token, accountId: configuredAccountId, source } = resolveCredentials()

  let accountId = configuredAccountId
  if (!accountId) {
    console.log('→ 查询 Cloudflare 账号…')
    const res = await requestWithRetry({ method: 'GET', path: '/client/v4/accounts', token })
    accountId = res.json?.result?.[0]?.id
    if (!accountId) fail(`无法获取账号 ID：${res.text.slice(0, 300)}`)
  }

  const creds = { token, source, accountId }
  console.log(`→ 凭据来源：${creds.source}`)
  console.log(`→ 账号 ID：${accountId}`)
  console.log(`→ 目标项目：${projectName}（分支 ${branch}）`)

  // 1. 读取文件并计算哈希
  const raw = collectFiles(distDir)
  const files = raw.map((item) => {
    const buffer = fs.readFileSync(item.file)
    return {
      ...item,
      buffer,
      hash: crypto.createHash('sha256').update(buffer).digest('hex'),
    }
  })
  const manifest = {}
  for (const file of files) manifest[file.urlPath] = file.hash
  const totalBytes = files.reduce((sum, file) => sum + file.buffer.length, 0)
  console.log(`→ 待上传 ${files.length} 个文件，共 ${(totalBytes / 1024).toFixed(1)} KB`)

  // 2. 组装 multipart/form-data
  const boundary = `----pagesUpload${crypto.randomBytes(12).toString('hex')}`
  const chunks = []
  const pushText = (text) => chunks.push(Buffer.from(text, 'utf8'))
  const pushField = (name, value) => {
    pushText(`--${boundary}${CRLF}`)
    pushText(`Content-Disposition: form-data; name="${name}"${CRLF}${CRLF}`)
    pushText(`${value}${CRLF}`)
  }

  const { hash: commitHash, message: commitMessage } = gitInfo()
  pushField('branch', branch)
  if (commitHash) pushField('commit_hash', commitHash)
  if (commitMessage) pushField('commit_message', commitMessage)
  pushField('manifest', JSON.stringify(manifest))
  for (const file of files) {
    pushText(`--${boundary}${CRLF}`)
    pushText(`Content-Disposition: form-data; name="${file.hash}"; filename="${file.hash}"${CRLF}`)
    pushText(`Content-Type: application/octet-stream${CRLF}${CRLF}`)
    chunks.push(file.buffer)
    pushText(CRLF)
  }
  pushText(`--${boundary}--${CRLF}`)
  const body = Buffer.concat(chunks)

  // 3. 发起部署
  console.log('→ 上传中…')
  const res = await requestWithRetry({
    method: 'POST',
    path: `/client/v4/accounts/${accountId}/pages/projects/${projectName}/deployments`,
    token,
    body,
    contentType: `multipart/form-data; boundary=${boundary}`,
  })

  if (!res.json?.success) {
    fail(`部署失败（HTTP ${res.status}）：${res.text.slice(0, 600)}`)
  }

  const deployment = res.json.result
  const stage = deployment.latest_stage
  console.log('\n✓ 部署成功')
  console.log(`  部署 ID  : ${deployment.id}`)
  console.log(`  部署地址 : ${deployment.url}`)
  console.log(`  环境     : ${deployment.environment}`)
  if (stage) console.log(`  构建状态 : ${stage.name} / ${stage.status}`)

  // 4. 打印项目正式域名
  const projectRes = await requestWithRetry({
    method: 'GET',
    path: `/client/v4/accounts/${accountId}/pages/projects/${projectName}`,
    token,
  })
  const domains = projectRes.json?.result?.domains ?? []
  if (domains.length > 0) {
    console.log('  正式域名 :')
    for (const domain of domains) console.log(`             https://${domain}`)
  }
  console.log('')
}

main().catch((error) => {
  console.error(`\n✗ 部署失败：${error.message}`)
  console.error('  提示：这是网络层错误。脚本已强制 IPv4，若仍失败请重试，或改用带 CLOUDFLARE_API_TOKEN 的方式。\n')
  process.exit(1)
})
