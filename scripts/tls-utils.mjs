/**
 * Shared TLS options for fetch scripts (corporate proxies / broken local CA store).
 */
import https from 'node:https'

const truthyEnv = (v) => ['1', 'true', 'yes'].includes(String(v ?? '').toLowerCase())

/** CLI --insecure or FETCH_ASSETS_INSECURE=1 */
export function wantsInsecureTls() {
  return process.argv.includes('--insecure') || truthyEnv(process.env.FETCH_ASSETS_INSECURE)
}

export function createHttpsAgent() {
  return wantsInsecureTls() ? new https.Agent({ rejectUnauthorized: false }) : undefined
}

export function tlsDownloadHint(originalMessage) {
  return `${originalMessage}

If you see UNABLE_TO_GET_ISSUER_CERT_LOCALLY (corporate SSL or missing CA on Windows):
  npm run fetch:bgm:insecure
  npm run fetch:models:insecure
Or: set FETCH_ASSETS_INSECURE=1 for one command (PowerShell: $env:FETCH_ASSETS_INSECURE='1'; npm run fetch:models)
Last resort for npm itself: npm config set cafile "C:\\path\\to\\company-root.pem"
Or (insecure): npm config set strict-ssl false`
}
