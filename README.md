# PaperFusion - 論文融合・研究提案アプリケーション

学術論文を融合させて新しい研究アイデアを生み出すWebアプリケーションです。arXivとSemantic Scholar APIを統合し、AIを活用して複数の論文から革新的な研究提案を生成します。

## 主な機能

### 論文検索
arXivとSemantic Scholar APIを統合した強力な論文検索機能を提供します。キーワードやカテゴリーで論文を検索し、詳細情報を即座に確認できます。

### お気に入り管理
興味のある論文をお気に入りに保存し、カスタムタグで整理できます。AIによる自動タグ生成機能により、論文の分類が簡単になります。

### AI推薦システム
お気に入りに追加した論文や評価に基づいて、AIが関連する論文を自動的に推薦します。Semantic Scholar APIを活用し、引用関係や研究分野の類似性を考慮した高精度な推薦を実現しています。

### 関連論文検索
各論文について、その論文を引用している論文（被引用論文）と、その論文が引用している論文（参考文献）を簡単に検索できます。arXiv IDとSemantic Scholar IDの両方に対応しています。

### 研究提案生成
複数の論文を選択すると、AIが研究テーマの提案を生成します。選択した論文の内容を分析し、新しい研究の方向性を提示します。

### PDFビューアー
論文のPDFをアプリ内で直接閲覧できます。外部サイトに移動することなく、論文の内容を確認できます。

## 技術スタック

### フロントエンド
- **React 19.1.1** - UIライブラリ
- **TypeScript 5.9.3** - 型安全な開発
- **Vite 7.1.9** - 高速ビルドツール
- **TailwindCSS 4.1.14** - ユーティリティファーストCSS
- **tRPC 11.6.0** - 型安全なAPI通信
- **Wouter 3.3.5** - 軽量ルーティング
- **Radix UI** - アクセシブルなUIコンポーネント
- **Tanstack Query** - サーバー状態管理

### バックエンド
- **Node.js + Express** - サーバーフレームワーク
- **tRPC Server** - 型安全なAPIエンドポイント
- **Drizzle ORM 0.44.5** - 型安全なデータベースORM
- **MySQL2** - データベースドライバ

### 外部API統合
- **arXiv API** - 論文検索とメタデータ取得
- **Semantic Scholar API** - 論文推薦、引用情報、関連論文検索
- **OpenAI API** - AIタグ生成、研究提案生成

### 認証・セキュリティ
- **JWT（jose 6.1.0）** - トークンベース認証
- セッションベース認証
- セキュアなCookie管理

## セットアップ

### 前提条件
- Node.js 18以上
- pnpm 10以上
- MySQL 8.0以上

### インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd paper-discovery

# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集して必要な値を設定
```

### 環境変数

以下の環境変数を`.env`ファイルに設定してください:

```env
# アプリケーション設定
VITE_APP_TITLE="PaperFusion"
VITE_APP_LOGO="<logo-url>"

# 認証設定
OAUTH_SERVER_URL=<oauth-server-url>
JWT_SECRET=<secure-random-string>

# データベース
DATABASE_URL=mysql://user:password@localhost:3306/paper_discovery

# OpenAI API（AI機能に必須）
OPENAI_API_KEY=sk-...

# サーバー設定
PORT=3000

# アナリティクス（オプション）
VITE_ANALYTICS_ENDPOINT=<analytics-endpoint>
VITE_ANALYTICS_WEBSITE_ID=<website-id>
```

### データベースのセットアップ

```bash
# マイグレーションの実行
pnpm db:push
```

### 開発サーバーの起動

```bash
# 開発モードで起動
pnpm dev
```

アプリケーションは http://localhost:3000 で起動します。

## ビルドとデプロイ

### 本番ビルド

```bash
# 本番用ビルド
pnpm build

# ビルドされたアプリケーションを起動
pnpm start
```

### デプロイ前のチェック

- [ ] 環境変数が正しく設定されている
- [ ] データベースマイグレーションが完了している
- [ ] OpenAI APIキーが設定されている
- [ ] JWT_SECRETが本番用の安全な値に設定されている
- [ ] ビルドが成功する（`pnpm build`）

## プロジェクト構造

```
paper-discovery/
├── client/                 # フロントエンドコード
│   └── src/
│       ├── pages/         # ページコンポーネント
│       ├── components/    # 再利用可能なコンポーネント
│       └── lib/           # ユーティリティ関数
├── server/                # バックエンドコード
│   ├── _core/            # コアサーバー機能
│   ├── db/               # データベース関連
│   ├── services/         # 外部API統合
│   └── routers.ts        # tRPCルーター定義
├── drizzle/              # データベーススキーマ
│   └── schema.ts         # テーブル定義
└── dist/                 # ビルド出力（本番用）
```

## データベーススキーマ

### papers
論文のメタデータを保存します。

- `id` - 論文ID（arXiv IDまたはSemantic Scholar ID）
- `title` - 論文タイトル
- `authors` - 著者リスト（JSON）
- `abstract` - 要約
- `categories` - カテゴリー（JSON）
- `publishedDate` - 公開日
- `pdfUrl` - PDF URL
- `citationsCount` - 引用数

### favorites
ユーザーのお気に入り論文を管理します。

- `id` - お気に入りID
- `userId` - ユーザーID
- `paperId` - 論文ID
- `tags` - タグリスト（JSON）
- `createdAt` - 作成日時

### userRatings
ユーザーの論文評価を保存します。

- `id` - 評価ID
- `userId` - ユーザーID
- `paperId` - 論文ID
- `rating` - 評価（-1: 低評価, 0: 中立, 1: 高評価）

### history
ユーザーの閲覧履歴を記録します。

- `id` - 履歴ID
- `userId` - ユーザーID
- `paperId` - 論文ID
- `category` - カテゴリー
- `viewedAt` - 閲覧日時

### researchProposals
AIが生成した研究提案を保存します。

- `id` - 提案ID
- `userId` - ユーザーID
- `title` - 提案タイトル
- `content` - 提案内容
- `paperIds` - 関連論文ID（JSON）
- `createdAt` - 作成日時

## API統合

### arXiv API
arXivの公開APIを使用して論文を検索します。カテゴリーフィルタリングとキーワード検索をサポートしています。

### Semantic Scholar API
Semantic Scholar APIを使用して以下の機能を提供します:

- 論文検索と詳細情報取得
- 引用情報の取得（被引用論文・参考文献）
- 論文推薦（類似論文の発見）
- arXiv IDからSemantic Scholar IDへの変換

### OpenAI API
OpenAI APIを使用してAI機能を実装しています:

- 論文タイトルと要約からの自動タグ生成
- 複数論文からの研究提案生成

## 開発

### コードフォーマット

```bash
pnpm format
```

### 型チェック

```bash
pnpm check
```

### テスト

```bash
pnpm test
```

## トラブルシューティング

### データベース接続エラー
- `DATABASE_URL`が正しく設定されているか確認してください
- MySQLサーバーが起動しているか確認してください
- データベースが作成されているか確認してください

### AI機能が動作しない
- `OPENAI_API_KEY`が正しく設定されているか確認してください
- APIキーに十分なクレジットがあるか確認してください

### 論文検索が動作しない
- インターネット接続を確認してください
- arXiv APIとSemantic Scholar APIが利用可能か確認してください

### 関連論文が表示されない
- 論文がSemantic Scholarに登録されているか確認してください
- arXiv IDの論文の場合、Semantic Scholarでインデックスされるまで時間がかかる場合があります

## ライセンス

MIT License

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## サポート

問題が発生した場合は、GitHubのissueを作成してください。

