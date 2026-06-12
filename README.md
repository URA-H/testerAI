# testerAI

[![CI](https://github.com/URA-H/testerAI/actions/workflows/ci.yml/badge.svg)](https://github.com/URA-H/testerAI/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org)

公共系SIerの詳細設計書 (Word) から、テストケース一覧 (Excel) を生成するローカル CLI。
ChatGPT直貼り付けの摩擦と、外部SaaSの社内セキュリティ問題、その両方を回避する設計。

## できること

- `.docx` の機能仕様書 1 ファイルを入力に、`.xlsx` のテストケース一覧を出力
- 同値分割・境界値分析・異常系の観点ごとにケースを生成
- 出力Excelの列構成・命名規則を `config.yaml` で案件別にカスタマイズ
- LLM API への通信のみ。設計書本体・生成結果はローカル外に出さない

## 設計上の約束 (この4つは初版から実装に含まれます)

1. **ローカル動作** — LLM API 以外への通信はゼロ。ファイルもログもユーザーのマシン内のみ。
2. **設計書フォーマット直読み** — `.docx` を直接読み込み、コピペ不要。
3. **テンプレカスタマイズ** — `config.yaml` で出力列、観点リスト、命名規則をプロジェクト毎に変更可能。
4. **観点記述列** — 各テストケースに「なぜこのケースか」(同値分割 / 境界値 / 異常系 等) を必ず付与。

## 想定ユーザー

- 公共系SIer のテスト担当エンジニア / PM / QAリーダー
- 詳細設計書からテストケースを書き起こす工程の負荷を下げたい人
- 外部SaaS NG の社内ルール下で AI を使いたい人

## 使い方 (MVP)

```sh
# 1. インストール
pnpm install
pnpm build

# 2. API キー設定
cp .env.example .env
# .env の ANTHROPIC_API_KEY を埋める

# 3. 設定ファイル準備
cp config.example.yaml config.yaml
# 案件のテンプレに合わせて列・観点・命名規則を編集

# 4. 実行
pnpm dev generate ./path/to/spec.docx -c config.yaml -o testcases.xlsx
```

## 設定ファイルでカスタマイズできるもの

`config.yaml`:

- `output_columns`: 出力Excelの列構成 (順序・ヘッダ名)
- `viewpoints`: LLM が考慮するテスト観点のリスト
- `naming.id_prefix` / `naming.id_digits`: テストケースIDの体裁
- `generation.max_cases_per_feature`: 1機能あたりのケース上限
- `generation.model`: 使用する LLM モデル

## アーキテクチャ

```
src/
├── cli.ts              commander エントリポイント
├── parser/docx.ts      .docx → Markdown (mammoth)
├── generator/claude.ts Markdown + config → TestCase[] (Anthropic Claude)
├── formatter/xlsx.ts   TestCase[] + config → .xlsx (exceljs)
└── config/load.ts      yaml ロード + バリデーション
```

責務を 4 つに分割しており、各層は単独で差し替え可能 (例: parser を別実装に置換、formatter を CSV 出力に追加対応、等)。

## ロードマップ

- v0.1 (本リリース): Word 仕様書 → Excel テストケース (本ドキュメントの内容)
- v0.2: テーブル定義書 (Excel入力) からデータパターン生成
- v0.3: 画面遷移図からの画面遷移テスト生成
- v0.4: 複数ファイル同時入力、案件横断のケース整合チェック
- v1.0: 出力テンプレの社内テンプレ吸収機能 (既存Excelの列を読んで自動コピー)

## ライセンス

MIT
