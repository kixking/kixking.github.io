# Task: Log & Code Anonymizer (log-scrubber) 実装

## 概要

機密情報（IP, Email, API Key等）を含むログやコードを安全にAIに共有するために、ブラウザ上でクライアントサイドで完結する匿名化ツールを作成する。

## 修正方針 (Strategy)

> 正規表現を用いたクライアントサイド置換を行う。外部サーバーへの送信は一切行わない。
> 利便性を高めるため、置換マップを保持し、同一セッション内であれば元の値を確認できるようにするが、永続化はしない（セキュリティリスク軽減）。

## チェックリスト

- [ ] **ロジック実装** (`assets/js/modules/anonymizer.js`)
  - [ ] `Context` クラス: 置換マップの管理
  - [ ] `Anonymizer` クラス: 正規表現検出と置換実行
  - [ ] 単体テスト (`tests/anonymizer.test.js`)
- [ ] **UI実装** (`log-scrubber/index.html`)
  - [ ] 2ペインレイアウト (Input / Output)
  - [ ] オプション選択 (Mask IPs, Mask Emails, etc.)
  - [ ] クリップボードコピー
- [ ] **ドキュメント更新**
  - [ ] `Spec.md` 更新
  - [ ] `index.html` リンク追加

---

# Task: 数独自動生成ツール (Sudoku Generator) 実装

## 概要

`sudoku-generator` を新規作成する。
ブラウザ上で数独（ナンプレ）の問題を無限に自動生成し、画面上で遊んだり、印刷して楽しむことができるツール。
添付画像のようなクリーンな9x9グリッドデザインを目指す。

## 仕様

- **ロジック** (`assets/js/modules/sudoku-logic.js`)
  - バックトラッキング法による完全盤面の生成。
  - 難易度（Easy, Medium, Hard, Expert）に応じた穴あけ処理（一意解保証）。
  - ソルバー機能（答え合わせ用）。
- **UI** (`sudoku-generator/index.html`)
  - 9x9のインタラクティブなグリッド。
  - ユーザーが数字を入力可能。
  - 難易度選択ボタン。
  - 「答えを表示」トグル。
  - **印刷最適化**: 印刷プレビュー時にインク節約かつ綺麗に見えるスタイル。
- **デザイン**
  - 3x3のブロック区切りを太線で強調。
  - 選択中のセル、同じ数字のハイライト機能（あれば便利）。

## チェックリスト

- [x] **ロジック実装** (`assets/js/modules/sudoku-logic.js`)
  - [x] `generateSolvedGrid()`: 完成盤面生成
  - [x] `solveSudoku()`: 解法/一意性チェック
  - [x] `removeCells()`: 難易度調整
- [x] **UI実装** (`sudoku-generator/index.html`)
  - [x] グリッドレイアウト (CSS Grid)
  - [x] 入力I/F (キーボード & 仮想テンキー)
  - [x] コントロールパネル
- [x] **ドキュメント更新**
  - [x] `Spec.md` 更新
  - [x] `index.html` リンク追加
