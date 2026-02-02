# AEP-01 全体準拠レビュー計画

## 概要
プロジェクト「Simple Tools」の全ファイルを対象に、**Antigravity・Engineering・Protocol-01 (AEP-01)** への完全準拠を確認・修正する。
前回のフェーズで基盤は作成したが、全ツールへの適用と詳細なコードレベルの監査が必要である。

## 監査項目 (Audit Checklist)

### 1. セキュリティ・バイ・デザイン (Security)
- [ ] **XSS対策**: `innerHTML` の使用箇所を全検索し、`textContent` または安全なDOM操作に置き換える。
- [ ] **依存関係**: 外部スクリプト読み込み (CDN等) の正当性とSRI (Subresource Integrity) の検討（今回は静的サイトなのでCDN依存の最小化を確認）。

### 2. 堅牢性と保守性 (Robustness & Maintainability)
- [ ] **ロジック分離**: HTML内にインラインで記述されたJSがないか確認。
- [ ] **モジュール化**: `assets/js` 直書きのロジックで、テストが必要な複雑なものを `assets/js/modules/` へ抽出検討（優先度高のものから）。
- [ ] **エラーハンドリング**: `try-catch` が適切か、ユーザーへのフィードバック（Toaster等）が機能しているか。

### 3. ドキュメントと整合性 (Documentation)
- [ ] `Spec.md` のツール一覧と実際のディレクトリ構成の完全一致確認。
- [ ] 各ツールの `index.html` のメタデータ（Title, Description）の整合性。

## 実行計画 (Phase 1: 完了)
1. `docs/Task.md` に具体的な作業ステップを定義。
2. `grep` 等を使用し、危険なパターン (`innerHTML`, `eval`, 等) を検出。
3. 検出された問題点を順次修正。
4. 修正に伴うリファクタリング（モジュール化）を実施。

## Phase 2: Factory Mass Production (量産フェーズ)
`docs/Strategy.md` に基づき、新規ツールを **Classic Factory Model** (Vanilla JS + style.css) で量産する。
AIコスト削減と保守性向上のため、複雑なフレームワークは使用しない。

### ツール実装キュー (Completed Batch 1)
1. **UUID Generator** (`uuid-generator`) - [x] Done
2. **HTML Entity Encoder** (`html-entity`) - [x] Done
3. **JWT Debugger** (`jwt-debugger`) - [x] Done
4. **SQL Formatter** (`sql-formatter`) - [x] Done
5. **Unix Timestamp Converter** (`epoch-converter`) - [x] Done
6. **Password Generator** (`password-generator`) - [x] Done (Refactored)
7. **Base64 Converter** (`base64-converter`) - [x] Done (Refactored)
8. **CSS Minifier** (`css-minifier`) - [x] Done
9. **JSON to Go Struct** (`json-to-go`) - [x] Done
10. **Unit Converter** (`unit-converter`) - [x] Done
11. **Text Diff** (`text-diff`) - [x] Done
12. **Meta Tag Generator** (`meta-generator`) - [x] Done
13. **QRCode Generator** (`qr-generator`) - [x] Done (Refactored)
14. **Markdown Preview** (`markdown-preview`) - [x] Done
15. **Regex Tester** (`regex-tester`) - [x] Done

### 技術標準 (Classic Factory Model)
- **CSS**: `assets/css/style.css` のクラスを活用 (`.tool-container`, `.action-btn` 等)。
- **JS**: Native ES Modules. UI操作は `document.getElementById` 等の標準APIで行う。
- **Test**: `node:test` for logic modules.

## Phase 3: Deployment & Maintenance
自動デプロイ設定済み（GitHub Pagesなど）。
以下の点を確認する：
- [ ] 全ツールのリンクチェック
- [ ] OGP設定とSEOメタデータの確認
- [ ] GA4計測確認
