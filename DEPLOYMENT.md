# PaperFusion - デプロイガイド

このドキュメントは、PaperFusionをManusプラットフォームにデプロイする手順を説明します。

## 前提条件

- Manusアカウント
- GitHubリポジトリ: https://github.com/pseudo561/paperfusion

## Manusでのデプロイ手順

### 1. プロジェクトのインポート

1. Manusダッシュボードにアクセス
2. 「New Project」または「プロジェクトを作成」をクリック
3. 「Import from GitHub」を選択
4. リポジトリ `pseudo561/paperfusion` を選択

### 2. 環境変数の設定

Manusは以下の環境変数を**自動的に提供**します:

- `VITE_APP_ID` - アプリケーションID
- `VITE_OAUTH_PORTAL_URL` - OAuth認証URL
- `OAUTH_SERVER_URL` - OAuthサーバーURL
- `DATABASE_URL` - データベース接続URL
- `JWT_SECRET` - JWT秘密鍵
- `BUILT_IN_FORGE_API_KEY` - Manus組み込みLLM APIキー
- `BUILT_IN_FORGE_API_URL` - Manus組み込みLLM API URL

**追加設定は不要です！**

### 3. アプリ設定（オプション）

Manusのプロジェクト設定で以下を設定できます:

- **アプリタイトル**: `PaperFusion`
- **アプリロゴ**: `⚡` または任意の画像URL

### 4. ビルドとデプロイ

Manusが自動的に以下を実行します:

```bash
# 依存関係のインストール
pnpm install

# ビルド
pnpm build

# 起動
pnpm start
```

### 5. データベースのセットアップ

初回デプロイ後、データベーステーブルを作成します:

```bash
pnpm db:push
```

Manusのコンソールまたはターミナルから実行してください。

## デプロイ後の確認

### 1. 基本機能のテスト

- [ ] ログイン/ログアウトが動作する
- [ ] 論文検索が動作する（arXiv + Semantic Scholar）
- [ ] お気に入りの追加/削除が動作する
- [ ] AIタグ生成が動作する
- [ ] 推薦機能が動作する
- [ ] 研究提案生成が動作する

### 2. 多言語機能のテスト

- [ ] 言語切り替えが動作する（日本語、英語、中国語）
- [ ] UIが選択した言語で表示される
- [ ] AIタグ生成が選択した言語で動作する
- [ ] 研究提案が選択した言語で生成される

### 3. パフォーマンスの確認

- [ ] ページの読み込み速度が適切
- [ ] API呼び出しが正常に動作
- [ ] LLM APIの応答時間が適切

## トラブルシューティング

### データベース接続エラー

**症状**: 「Database not available」エラーが表示される

**解決方法**:
1. `DATABASE_URL`環境変数が正しく設定されているか確認
2. データベースマイグレーションを実行: `pnpm db:push`

### AI機能が動作しない

**症状**: タグ生成や研究提案が失敗する

**解決方法**:
1. `BUILT_IN_FORGE_API_KEY`が設定されているか確認
2. Manusの無料トークンが残っているか確認
3. エラーログを確認

### 認証エラー

**症状**: ログインできない、またはログイン後にエラーが発生

**解決方法**:
1. `OAUTH_SERVER_URL`と`JWT_SECRET`が設定されているか確認
2. ブラウザのCookieをクリア
3. 再度ログインを試行

### 論文検索が動作しない

**症状**: 検索結果が表示されない

**解決方法**:
1. インターネット接続を確認
2. arXiv APIとSemantic Scholar APIが利用可能か確認
3. サーバーログでAPIエラーを確認

## 技術仕様

### 使用API

- **arXiv API**: 論文検索とメタデータ取得
  - レート制限: なし（推奨: 1秒あたり1リクエスト）
  
- **Semantic Scholar API**: 論文推薦、引用情報
  - レート制限: 100リクエスト/5分
  
- **Manus Forge API**: AI機能（タグ生成、研究提案）
  - レート制限: Manusのプランに依存

### データベーススキーマ

主要テーブル:
- `papers` - 論文メタデータ
- `favorites` - お気に入り論文
- `userRatings` - ユーザー評価
- `history` - 閲覧履歴
- `researchProposals` - 研究提案

詳細は `drizzle/schema.ts` を参照してください。

## パフォーマンス最適化（オプション）

### 1. チャンクサイズの最適化

現在、メインJSバンドルが859KB（gzip後236KB）あります。以下の方法で最適化できます:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'trpc-vendor': ['@trpc/client', '@trpc/react-query'],
        },
      },
    },
  },
});
```

### 2. Semantic Scholar APIのキャッシング

頻繁にアクセスされる論文情報をキャッシュすることで、APIレート制限を回避できます。

### 3. 画像の最適化

PDFサムネイルやロゴ画像を最適化することで、読み込み速度を改善できます。

## セキュリティ

### 環境変数の管理

- **絶対に`.env`ファイルをGitにコミットしない**
- 本番環境では強力な`JWT_SECRET`を使用
- APIキーは環境変数で管理

### CORS設定

サーバー側で適切なCORS設定を行い、信頼できるオリジンからのみアクセスを許可してください。

### レート制限

外部API（arXiv、Semantic Scholar）のレート制限を遵守してください。

## モニタリング

### ログ

Manusのログ機能を使用して、以下を監視してください:

- APIエラー
- データベースエラー
- LLM API呼び出しの失敗

### アナリティクス

Manusのアナリティクス機能（既に設定済み）を使用して、以下を追跡できます:

- ページビュー
- ユーザーアクティビティ
- 機能の使用状況

## サポート

問題が発生した場合:

1. GitHubのissueを作成: https://github.com/pseudo561/paperfusion/issues
2. Manusのサポートに問い合わせ: https://help.manus.im

## 更新手順

アプリケーションを更新する場合:

1. ローカルで変更を加える
2. GitHubにプッシュ
3. Manusが自動的に再デプロイ

または、Manusのダッシュボードから手動で再デプロイできます。

## ライセンス

MIT License - 詳細は `LICENSE` ファイルを参照してください。

