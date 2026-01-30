# 貢献ガイド (Contributing Guide)

略語辞典への貢献ありがとうございます! 🎉

## 新しい略語の追加方法

### オプション1: GitHub Issue (推奨・簡単)

1. [新しい Issue を作成](https://github.com/YOUR_ORG/me-ryakushou/issues/new)
2. Issue タイトル: `新しい略語: [略語名]`
3. 以下のテンプレートを使用:

```markdown
## 追加する略語

- **略語**: API
- **日本語の意味**: アプリケーション・プログラミング・インターフェース
- **英語の意味**: Application Programming Interface
- **カテゴリ**: IT (IT, ビジネス, 技術, その他)

## 追加理由 (任意)

この略語は社内でよく使用されるため
```

4. Issue を提出 → レビュー後にマージされます

### オプション2: Pull Request (上級者向け)

1. リポジトリをフォークまたはクローン:

```bash
git clone https://github.com/YOUR_ORG/me-ryakushou.git
cd me-ryakushou
```

2. 新しいブランチを作成:

```bash
git checkout -b add-abbreviation-API
```

3. `data/abbreviations.csv` を編集:

```csv
略語,意味(日本語),意味(English),カテゴリ
API,アプリケーション・プログラミング・インターフェース,Application Programming Interface,IT
```

**重要な注意事項:**
- CSVファイルの最後に追加
- カンマを含む場合はダブルクォートで囲む: `"例えば、これ"`
- ダブルクォートを含む場合はエスケープ: `"彼女は""こんにちは""と言った"`
- 改行は含めない
- 空行は追加しない

4. コミット & プッシュ:

```bash
git add data/abbreviations.csv
git commit -m "Add abbreviation: API"
git push origin add-abbreviation-API
```

5. Pull Request を作成

### オプション3: Web アプリから (最も簡単)

1. アプリを開く: https://YOUR_ORG.github.io/me-ryakushou/
2. 「➕ 新しい略語を追加」ボタンをクリック
3. フォームに入力:
   - 略語: `API`
   - 日本語の意味: `アプリケーション・プログラミング・インターフェース`
   - 英語の意味: `Application Programming Interface`
   - カテゴリ: `IT`
4. 「📋 CSV形式でコピー」をクリック
5. [新しい Issue](https://github.com/YOUR_ORG/me-ryakushou/issues/new) を作成してペースト

## CSV フォーマット詳細

### 基本フォーマット

```csv
略語,意味(日本語),意味(English),カテゴリ
```

### 例

```csv
API,アプリケーション・プログラミング・インターフェース,Application Programming Interface,IT
ASAP,できるだけ早く,As Soon As Possible,ビジネス
AI,人工知能,Artificial Intelligence,技術
```

### 特殊文字の扱い

| ケース | 処理方法 | 例 |
|--------|----------|-----|
| カンマを含む | ダブルクォートで囲む | `"例えば、これ"` |
| ダブルクォートを含む | `""` でエスケープ | `"彼は""はい""と答えた"` |
| 改行 | 避ける | N/A |

## カテゴリ一覧

推奨カテゴリ:

- **IT**: 情報技術関連 (API, HTTP, CSS, etc.)
- **ビジネス**: ビジネス用語 (ASAP, FYI, KPI, etc.)
- **技術**: 技術・科学用語 (AI, ML, IoT, etc.)
- **医療**: 医療用語
- **金融**: 金融・会計用語
- **その他**: 上記に該当しない場合

新しいカテゴリの提案も歓迎します!

## レビュープロセス

1. Issue または PR が提出される
2. 管理者がレビュー (1-3営業日)
3. 必要に応じて修正依頼
4. 承認後、`data/abbreviations.csv` にマージ
5. 自動的に GitHub Pages にデプロイ

## 品質基準

### 良い例 ✅

```csv
API,アプリケーション・プログラミング・インターフェース,Application Programming Interface,IT
```

- 明確で正確な意味
- 適切なカテゴリ
- フォーマットに準拠

### 悪い例 ❌

```csv
API,なんかプログラムのやつ,,
```

- 意味が不明確
- カテゴリ未指定
- 英語の意味が空

## コードの変更

HTML/CSS/JavaScript の改善も歓迎します:

1. 新しいブランチを作成
2. 変更を加える
3. ローカルでテスト:
   ```bash
   python -m http.server 8000
   ```
4. Pull Request を作成
5. 変更内容と理由を説明

## 報告すべき問題

以下の問題を発見した場合は Issue を作成してください:

- バグ・エラー
- 不正確な略語の意味
- 重複エントリ
- UI/UXの改善提案
- パフォーマンスの問題

## 行動規範

- 敬意を持って対応する
- 建設的なフィードバックを提供する
- 組織のポリシーに従う
- 機密情報を含めない

## 質問・サポート

不明点がある場合:

1. [既存の Issues](https://github.com/YOUR_ORG/me-ryakushou/issues) を確認
2. 新しい Issue を作成 (質問ラベルを付ける)
3. または社内のチャットで質問

## 謝辞

貢献者の皆様、ありがとうございます! 🙏

貢献者リストは [GitHub Contributors](https://github.com/YOUR_ORG/me-ryakushou/graphs/contributors) で確認できます。
