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
- `DATABASE_URL`: Render PostgreSQLのExternal Database URL

Render Blueprintは `render.yaml` に用意済みです。APIキーは `sync: false` なので、Gitには保存されません。

## 施設データをPostgreSQLに入れる

DBは既存DBの中に `iryou_map` スキーマを作って分離します。ローカルで作業する場合は、以下のファイルに `DATABASE_URL` を1行だけ入れてください。

```txt
/Users/banmako/Documents/医療マップ/.secrets/database_url.txt
```

投入:

```bash
npm run db:import
```

確認:

```bash
npm run db:check
```

Render上では `/api/search` がDBから上位候補だけを返します。GitHub Pagesでは従来通り `data/facilities.json` を使います。
