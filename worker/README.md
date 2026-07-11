# EIDOLON oracle proxy (Cloudflare Worker)

让 EIDOLON 接上真实的 Claude 对话。API key 存在 Worker secret 里,前端永远看不到。
不部署也没关系——前端会自动退回内置的分幕神谕池,作品离线完整可跑。

## 部署(约 3 分钟)

```sh
cd worker
npx wrangler login                       # 首次:浏览器授权 Cloudflare 账号
npx wrangler secret put ANTHROPIC_API_KEY   # 粘贴你的 Anthropic API key
npx wrangler deploy                      # 输出形如 https://eidolon-oracle.<你的子域>.workers.dev
```

## 接到前端

把部署输出的 URL 填进 `js/oracle.js` 顶部:

```js
export const config = {
  endpoint: "https://eidolon-oracle.<你的子域>.workers.dev"
};
```

推送到 GitHub 后,Pages 上的版本即接入真实对话。

## 说明

- 允许的来源(CORS)在 `index.js` 顶部 `ALLOWED` 数组里,换域名记得加。
- 人格与分幕指令(`PERSONA` / `ACT_NOTES`)也在 `index.js` 里,可直接改中文。
- 模型:`claude-sonnet-5`,每次回复上限 300 tokens,历史只保留最近 16 条。
