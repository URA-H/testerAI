# Contributing

testerAI への貢献を検討いただきありがとうございます。

## 開発の流れ

```sh
pnpm install
pnpm dev generate ./examples/sample-spec.docx -c config.example.yaml -o /tmp/out.xlsx
pnpm vitest        # テスト
pnpm biome check . # Lint + Format チェック
pnpm tsc --noEmit  # 型チェック
pnpm build         # ビルド
```

CIで上記すべてを実行しています。push前にローカルで通ることを確認してください。

## 4つの設計上の約束

このプロジェクトは README で 4 つの約束を明示しており、それらは可能な限り**コードで担保**しています。
PR 時には次を意識してください:

1. **ローカル動作**: LLM API 以外への通信を追加しない
2. **設計書フォーマット直読み**: コピペ前提のUIに後退させない
3. **テンプレカスタマイズ**: 出力に影響する選択肢は `config.yaml` で変更可能にする
4. **観点記述列**: テストケースから `viewpoint` 列を消さない (config loader が拒否します)

これらを変更する PR は、約束自体の再設計として議論しましょう。

## コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/) に緩く従います:

- `feat:` 新機能
- `fix:` バグ修正
- `chore:` 雑事 (ビルド、依存更新等)
- `test:` テスト追加・修正
- `docs:` ドキュメント
- `refactor:` 機能変更を伴わない整理

## Issue

バグ報告は再現手順 (使用した設計書の概要、config.yaml、出力) を含めてください。
機能要望は「どのユーザーがどんな場面で困っているか」を1段落で書いていただけると判断が早まります。

## License

PR を送ることで、コードを MIT License で提供することに同意したものとみなします。
