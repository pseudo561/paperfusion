# PaperFusion - 再デプロイ用プロンプト

新しいタスクで以下のプロンプトをコピー＆ペーストして使用してください。

---

## 📋 再デプロイ用プロンプト

```
GitHubリポジトリ https://github.com/pseudo561/paperfusion をクローンして、
PaperFusionアプリケーションを再デプロイしてください。

【重要な設定】
- アプリタイトル: "PaperFusion"
- アプリロゴ: "/logo.png" (リポジトリに含まれています)

【環境変数の設定】
以下の環境変数を設定してからビルドしてください:
- VITE_APP_TITLE="PaperFusion"
- VITE_APP_LOGO="/logo.png"

【手順】
1. リポジトリをクローン: gh repo clone pseudo561/paperfusion
2. ディレクトリに移動: cd paperfusion
3. 依存関係をインストール: pnpm install
4. 環境変数を設定（exportコマンドまたは.envファイル）
5. データベースをセットアップ: pnpm db:push
6. ビルド: pnpm build
7. サーバー起動: pnpm start
8. ポート3000を公開

【確認事項】
- アプリタイトルが「PaperFusion」になっているか
- ロゴが青紫の稲妻デザイン（「P」入り）になっているか
- 全機能が正常に動作しているか

【プロジェクト情報】
- 100% Manus AIで生成されたプロジェクト
- 多言語対応（日本語、英語、中国語）
- 論文検索・管理・AI推薦・研究提案生成機能を実装済み
```

---

## 🎯 短縮版プロンプト（簡潔版）

```
https://github.com/pseudo561/paperfusion をクローンして、
環境変数 VITE_APP_TITLE="PaperFusion" と VITE_APP_LOGO="/logo.png" を設定してから
ビルド・デプロイしてください。
```

---

## 📝 詳細版プロンプト（推奨）

```
PaperFusionアプリケーションの再デプロイをお願いします。

【背景】
前のタスクで開発した論文発見・推薦アプリケーションです。
環境変数の問題で、アプリタイトルとロゴが正しく設定できなかったため、
新しいタスクで再デプロイします。

【GitHubリポジトリ】
https://github.com/pseudo561/paperfusion

【必須の環境変数設定】
ビルド前に以下を設定してください:
```bash
export VITE_APP_TITLE="PaperFusion"
export VITE_APP_LOGO="/logo.png"
```

または、.envファイルを作成:
```
VITE_APP_TITLE=PaperFusion
VITE_APP_LOGO=/logo.png
```

【デプロイ手順】
1. リポジトリをクローン
2. pnpm install
3. 環境変数を設定（上記）
4. pnpm db:push（データベースセットアップ）
5. pnpm build（環境変数が設定された状態でビルド）
6. pnpm start
7. ポート3000を公開

【確認ポイント】
- ブラウザのタイトルバーが「PaperFusion」になっているか
- 左上のロゴが青紫グラデーションの稲妻（「P」入り）になっているか
- 多言語切り替え（日本語/英語/中国語）が機能するか
- 論文検索、AIタグ生成、研究提案生成が動作するか

【プロジェクトの特徴】
- 100% Manus AIで生成
- arXiv + Semantic Scholar統合
- AI推薦システム（Gemini 2.5 Flash使用）
- 研究提案生成（複数論文の融合）
- 多言語対応（日本語、英語、中国語）

【参考ドキュメント】
リポジトリ内の以下を参照:
- README.md - プロジェクト概要
- DEPLOYMENT.md - デプロイガイド
- BUILT_WITH_MANUS.md - AI生成の証明

よろしくお願いします。
```

---

## 💡 使い方

1. 新しいタスクを開始
2. 上記のプロンプトのいずれかをコピー
3. Manusのチャット欄にペースト
4. 送信

**推奨**: 「詳細版プロンプト」を使用すると、AIエージェントが全体像を理解しやすくなります。

---

## ⚠️ 重要な注意事項

### 環境変数の設定タイミング

環境変数は**ビルド前**に設定する必要があります。ビルド後に設定しても反映されません。

### .envファイルの作成方法

```bash
cat > .env << 'EOF'
VITE_APP_TITLE=PaperFusion
VITE_APP_LOGO=/logo.png
EOF
```

### ビルド前の確認

```bash
# 環境変数が設定されているか確認
env | grep VITE_APP

# 期待される出力:
# VITE_APP_TITLE=PaperFusion
# VITE_APP_LOGO=/logo.png
```

---

## 🔧 トラブルシューティング用プロンプト

もし再デプロイで問題が発生した場合:

```
PaperFusionの再デプロイで問題が発生しました。

【問題】
（ここに問題の詳細を記載）

【確認したこと】
- 環境変数の設定状況: env | grep VITE_APP
- ビルドログ: pnpm build の出力
- サーバーログ: pnpm start の出力

【参考情報】
- GitHubリポジトリ: https://github.com/pseudo561/paperfusion
- DEPLOYMENT.md を確認済み

トラブルシューティングをお願いします。
```

---

**このファイルを保存して、次回のタスクで使用してください！** 📝

