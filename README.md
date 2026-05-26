# 医療MAP 東海地方専門の受診先検索 試作

お客様説明用の静的デモです。

- 画面本体: `index.html`
- 説明メニュー: 画面右上の「説明メニュー」
- URL監査レポート: `reports/url_check_report.html`
- 検索除外: `robots.txt` と `X-Robots-Tag` 相当の noindex 方針

## RenderでGemini APIを動かす

GitHub PagesではAPIキーを置けないため、Render上では `server.js` が `/api/gemini-guide` を提供します。

Renderの環境変数に以下を設定してください。

- `GEMINI_API_KEY`: Google AI Studioで発行したGemini APIキー
- `GEMINI_MODEL`: `gemini-2.5-flash-lite`（低コスト優先。必要なら変更）

Render Blueprintは `render.yaml` に用意済みです。APIキーは `sync: false` なので、Gitには保存されません。
