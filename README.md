# 略語辞典 (Abbreviation Dictionary)

社内で使用される略語を検索・管理するための Web アプリケーション

## 🌟 特徴

- **検索機能**: 略語、日本語の意味、英語の意味、カテゴリで検索
- **データ表示**: 見やすいテーブル形式で表示
- **編集機能**: 既存の略語を編集可能 ✨ NEW
- **追加機能**: 新しい略語を追加 ✨ NEW
- **Markdown形式**: 読みやすく編集しやすいMarkdown形式でデータを管理 ✨ NEW
- **即座に反映**: 編集や追加がリアルタイムでアプリに反映
- **レスポンシブ**: モバイル端末でも利用可能

## 🚀 GitHub Pages へのデプロイ方法

### 1. リポジトリ設定

1. GitHubで新しいリポジトリを作成 (プライベートまたは社内リポジトリ)
2. ローカルでコードをコミット & プッシュ:

```bash
git init
git add .
git commit -m "Initial commit: Abbreviation Dictionary app"
git branch -M main
git remote add origin https://github.com/YOUR_ORG/me-ryakushou.git
git push -u origin main
```

### 2. GitHub Pages を有効化

1. リポジトリの **Settings** → **Pages** に移動
2. **Source** で `main` ブランチを選択
3. フォルダは `/ (root)` を選択
4. **Save** をクリック

数分後、アプリが以下のURLで利用可能になります:
```
https://YOUR_ORG.github.io/me-ryakushou/
```

### 3. 組織メンバーのみにアクセス制限

**プライベートリポジトリの場合:**
- GitHub Pro、Team、Enterprise プランで利用可能
- Settings → Pages → "GitHub Pages visibility" で制限可能

**代替方法:**
- リポジトリを Internal に設定 (社内のみ表示)
- または、認証が必要な別のホスティングサービスを使用

## 📝 新しい略語の追加方法

### 方法1: Web アプリから直接 (推奨) 🎯

1. アプリを開く
2. 「➕ 新しい略語を追加」ボタンをクリック
3. フォームに情報を入力
4. 「💾 保存してコピー」をクリック
5. GitHubリンクから直接編集してコミット

### 方法2: GitHub Issue を使用

1. [新しい Issue を作成](https://github.com/YOUR_ORG/me-ryakushou/issues/new)
2. 以下の情報を記載:
   ```
   略語: API
   日本語の意味: アプリケーション・プログラミング・インターフェース
   英語の意味: Application Programming Interface
   カテゴリ: IT
   ```
3. Issue を提出

### 方法3: Pull Request を使用

1. リポジトリをフォークまたはクローン
2. `data/abbreviations.md` ファイルを編集
3. 該当カテゴリに新しい略語を追加:
   ```markdown
   ### API
   - **日本語**: アプリケーション・プログラミング・インターフェース
   - **English**: Application Programming Interface
   - **カテゴリ**: IT
   ```
4. Pull Request を作成

## ✏️ 既存の略語の編集方法

1. アプリで編集したい略語の行にある「✏️」ボタンをクリック
2. フォームで情報を修正
3. 「💾 保存してコピー」をクリック
4. GitHubリンクから全内容を置き換えてコミット

## 🗂 ファイル構成

```
me-ryakushou/
├── index.html              # メインHTMLファイル
├── styles.css              # スタイルシート
├── app.js                  # JavaScript (検索・表示・編集ロジック)
├── data/
│   ├── abbreviations.md    # 略語データ (Markdown形式) ✨ NEW
│   └── abbreviations.csv   # 略語データ (旧CSV形式) - 参考用
├── README.md               # このファイル
├── CONTRIBUTING.md         # 貢献ガイド
└── .github/
    └── workflows/
        └── pages.yml       # GitHub Actions (自動デプロイ)
```

## 🛠 ローカル開発

1. リポジトリをクローン:
```bash
git clone https://github.com/YOUR_ORG/me-ryakushou.git
cd me-ryakushou
```

2. ローカルサーバーを起動:
```bash
# Python 3 を使用
python -m http.server 8000

# または Node.js の http-server
npx http-server -p 8000
```

3. ブラウザで開く:
```
http://localhost:8000
```

## 📊 CSV フォーマット

```csv
略語,意味(日本語),意味(English),カテゴリ
API,アプリケーション・プログラミング・インターフェース,Application Programming Interface,IT
```

**注意事項:**
- カンマを含む場合はダブルクォートで囲む
- ダブルクォート自体を含む場合は `""` とエスケープ
- 改行は避ける

## 🤝 貢献

詳細は [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## 📄 ライセンス

社内利用のため、適切なライセンスを設定してください。

## 🔒 セキュリティ

- このアプリは静的ファイルのみで構成
- バックエンドサーバーは不要
- データは CSV ファイルに保存
- 社内リポジトリとして管理することを推奨

## 💡 今後の拡張案

- [ ] カテゴリ別フィルタリング
- [ ] ソート機能
- [ ] お気に入り機能
- [ ] 使用頻度の記録
- [ ] GitHub Actions による自動マージ
- [ ] バージョン履歴の表示

## 📞 サポート

問題が発生した場合は、[Issues](https://github.com/YOUR_ORG/me-ryakushou/issues) で報告してください。
