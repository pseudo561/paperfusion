# PaperFusion - 別タスクでの再デプロイ手順

## 概要

このドキュメントは、新しいタスクでPaperFusionを正しい名前とロゴで再デプロイするための手順です。

---

## 問題点

現在のタスクでは、環境変数`VITE_APP_TITLE`と`VITE_APP_LOGO`がシステムレベルで「Paper Discovery」に設定されており、一時的な変更（`export`コマンド）では永続的に変更できませんでした。

---

## 新しいタスクでの手順

### ステップ1: 新しいタスクを開始

Manusで新しいタスクを開始します。

### ステップ2: GitHubリポジトリをクローン

```bash
cd /home/ubuntu
gh repo clone pseudo561/paperfusion
cd paperfusion
```

### ステップ3: 依存関係をインストール

```bash
pnpm install
```

### ステップ4: 環境変数を設定

**重要**: ビルド前に環境変数を設定する必要があります。

```bash
export VITE_APP_TITLE="PaperFusion"
export VITE_APP_LOGO="/logo.png"
```

または、`.env`ファイルを作成（推奨）:

```bash
cat > .env << 'EOF'
# App Configuration
VITE_APP_TITLE=PaperFusion
VITE_APP_LOGO=/logo.png

# These are automatically provided by Manus
# DATABASE_URL=<provided by Manus>
# BUILT_IN_FORGE_API_KEY=<provided by Manus>
# BUILT_IN_FORGE_API_URL=<provided by Manus>
# JWT_SECRET=<provided by Manus>
EOF
```

### ステップ5: データベースをセットアップ

```bash
pnpm db:push
```

### ステップ6: ビルド

```bash
pnpm build
```

### ステップ7: サーバーを起動

```bash
pnpm start
```

### ステップ8: ポートを公開

Manusの`expose`ツールを使用してポート3000を公開します。

---

## 確認事項

デプロイ後、以下を確認してください:

- [ ] アプリタイトルが「PaperFusion」になっている
- [ ] ロゴが青紫の稲妻デザインになっている
- [ ] 全機能が正常に動作している
- [ ] 多言語切り替えが機能している

---

## トラブルシューティング

### タイトルが「Paper Discovery」のまま

環境変数がビルド時に正しく設定されていません。以下を確認:

1. `.env`ファイルが存在するか
2. 環境変数が正しく設定されているか（`env | grep VITE_APP`で確認）
3. ビルド前に環境変数を設定したか

### ロゴが表示されない

`public/logo.png`が存在するか確認してください。GitHubリポジトリには既に含まれています。

---

## リポジトリ情報

- **GitHub**: https://github.com/pseudo561/paperfusion
- **ロゴファイル**: `public/logo.png`（リポジトリに含まれています）
- **ドキュメント**: README.md, DEPLOYMENT.md, BUILT_WITH_MANUS.md

---

## 注意事項

- Manusの組み込みAPI（`BUILT_IN_FORGE_API_KEY`など）は自動的に提供されるため、設定不要です
- データベースURLも自動的に提供されます
- `.env`ファイルには、`VITE_APP_TITLE`と`VITE_APP_LOGO`のみを設定してください

---

**新しいタスクでの成功をお祈りします！** 🚀

