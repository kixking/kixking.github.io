# Simple Tools 仕様書 (Spec.md)

## プロジェクト概要

ブラウザ完結型の軽量Webツールプラットフォーム (AEP-01準拠)。
「ミニマムサービス・ファクトリー」構想に基づき、大量のニッチツールを効率的に生産・管理する。
詳細は [Strategy.md](./Strategy.md) を参照。

## 技術スタック (Classic Factory Model)

- **Frontend**: HTML5, Vanilla CSS3 (Existing `style.css`), Vanilla JS (ES Modules)
- **Testing**: Node.js Native Test Runner (for logic modules)
- **Architecture**:
  - `assets/js/modules/`: テスト可能な純粋関数ロジック
  - `assets/js/<tool>.js` or `inline module`: UI操作
  - `tests/`: 単体テスト

## ディレクトリ構成

- `/`: ルート。ポータルページ、about、privacy
- `/assets/`: 共通アセット。CSS, JS, Images
- `/[tool-name]/`: 各ツールのエントリポイント (index.html)
- `/docs/`: AEP-01 プロトコルに基づくドキュメント
- `/tests/`: ロジックモジュールのテストコード

## 提供ツール一覧と仕様概要

| ツール名           | ディレクトリ         | 主要機能                                                 | 処理場所     | 状態                       |
| :----------------- | :------------------- | :------------------------------------------------------- | :----------- | :------------------------- |
| 文字数カウンター   | `moji-counter`       | リアルタイム文字数、行数、単語数カウント                 | クライアント | ✅ モジュール化済          |
| URLエンコーダー    | `url-encoder`        | URLエンコード・デコード                                  | クライアント | ✅ モジュール化済          |
| URLエンコーダー    | `url-encoder`        | URLエンコード・デコード                                  | クライアント | ✅ モジュール化済          |
| JSONフォーマッター | `json-formatter`     | JSON整形・バリデーション・修復                           | クライアント | ✅ モジュール化済          |
| Base64変換         | `base64-converter`   | テキスト・バイナリのBase64相互変換                       | クライアント | ✅ Factory Model (Classic) |
| CSV to RAG         | `csv-to-rag`         | CSVからLLM用Markdownへの変換                             | クライアント |                            |
| JSON to Go Struct  | `json-to-go`         | JSONからGo構造体生成                                     | クライアント | ✅ Factory Model (Classic) |
| ハッシュ生成       | `hash-generator`     | SHA-256/512, HMAC生成                                    | クライアント | ✅ 安全化 (No innerHTML)   |
| UUID生成           | `uuid-generator`     | v4 UUID生成 (Bulk/Option)                                | クライアント | ✅ Factory Model (Classic) |
| HTMLエンティティ   | `html-entity`        | 特殊文字のエスケープ・変換                               | クライアント | ✅ Factory Model (Classic) |
| JWTデバッガー      | `jwt-debugger`       | ヘッダー・ペイロードのデコード確認                       | クライアント | ✅ Factory Model (Classic) |
| SQL整形            | `sql-formatter`      | SQL文のインデント・キーワード大文字化                    | クライアント | ✅ Factory Model (Classic) |
| パスワード生成器   | `password-generator` | ランダムパスワード生成 (Web Crypto API)                  | クライアント | ✅ Factory Model (Classic) |
| CSS Minifier       | `css-minifier`       | CSSの圧縮・軽量化                                        | クライアント | ✅ Factory Model (Classic) |
| PDFテキスト抽出    | `pdf-extractor`      | PDFからテキスト抽出                                      | クライアント |                            |
| MIDI解析           | `midi-analyzer`      | MIDI構造のパース・表示                                   | クライアント | ✅ 安全化 (No innerHTML)   |
| Unix時間変換       | `epoch-converter`    | Unix Time 相互変換                                       | クライアント | ✅ Factory Model (Classic) |
| 日本祝日カレンダー | `jp-calendar`        | 祝日計算・表示                                           | クライアント | ✅ 安全化 (No innerHTML)   |
| 単位変換           | `unit-converter`     | 距離、データ容量、px/rem変換                             | クライアント | ✅ Factory Model (Classic) |
| テキスト比較       | `text-diff`          | 2つのテキストの行比較 (Diff)                             | クライアント | ✅ Factory Model (Classic) |
| Metaタグ生成       | `meta-generator`     | SEO/OGP/Twitter Cardタグ生成                             | クライアント | ✅ Factory Model (Classic) |
| QRコード生成       | `qr-generator`       | カスタムQRコード生成 (PNGDL)                             | クライアント | ✅ Factory Model (Classic) |
| Markdownプレビュー | `markdown-preview`   | リアルタイムMarkdown変換・表示                           | クライアント | ✅ Factory Model (Classic) |
| 正規表現チェッカー | `regex-tester`       | JS正規表現のテスト・ハイライト                           | クライアント | ✅ Factory Model (Classic) |
| 数独自動生成       | `sudoku-generator`   | ナンプレ無限生成・印刷・ヒント・正誤判定・アニメーション | クライアント | ✅ Factory Model (Classic) |
| 同時ビューアー     | `multi-view`         | 複数サイト同時表示 (iframe)                              | クライアント | ✅ 安全化 (No innerHTML)   |
| クライアント情報   | `client-info`        | UA, IP情報等の表示                                       | クライアント | ✅ 安全化 (No innerHTML)   |
| 絵文字生成         | `emoji-generator`    | カスタム絵文字画像生成                                   | クライアント |                            |
| QRコード生成       | `qr-generator`       | QRコード画像生成                                         | クライアント | ✅ 安全化 (No innerHTML)   |
| QRコードリーダー   | `qr-scanner`         | QRコード読み取り (Camera API)                            | クライアント |                            |
| カラーピッカー     | `color-picker`       | 色選択・変換                                             | クライアント | ✅ 安全化 (No innerHTML)   |
| 画像リサイズ       | `image-resizer`      | ブラウザ内画像加工                                       | クライアント |                            |
| ログ匿名化         | `log-scrubber`       | IP/Email等の機密情報マスク                               | クライアント | ✅ Factory Model (Classic) |

## コーディング規約 (Standard)

1. **ロジックの分離**: 各ツールのコアロジックは `assets/js/modules/` 配下に独立したモジュールとして定義すること。
2. **ESモジュールの使用**: `type="module"` を使用し、テスト可能な構造を維持すること。
3. **セキュリティ**:
   - `innerHTML` の使用を避け、`textContent` や `createElement` を使用すること。
   - ユーザー入力は必ずサニタイズまたは安全なAPI（Web Crypto等）で処理すること。
4. **テスト**: 重要なロジックには `tests/` 配下に単体テストを作成すること。

## 運用ルール (AEP-01 抜粋)

- 変更時は `docs/Plan.md` を更新。
- 実行前に `docs/Task.md` を作成。
- 完了後に `docs/Spec.md` を更新。
- 可能な限り標準ライブラリを使用し、外部依存を最小化する。
