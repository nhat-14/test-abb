# GitHub-Only Setup (No External Services Needed!)

## ✅ Complete Setup - Everything in GitHub

### 1. Enable GitHub Pages

1. Go to: https://github.com/nhat-14/test-abb/settings/pages
2. Source: **main** branch
3. Folder: **/ (root)**
4. Click **Save**

Your site will be live at: **https://nhat-14.github.io/test-abb/**

### 2. Enable GitHub Actions

1. Go to: https://github.com/nhat-14/test-abb/settings/actions
2. Make sure "Allow all actions and reusable workflows" is selected
3. Click **Save**

### 3. Users Create Personal Token (One-Time)

Each user who wants to add/edit abbreviations needs to:

1. **Create token:** https://github.com/settings/tokens/new
   - Token name: `Abbreviation Dictionary`
   - Expiration: Choose your preference
   - Select scopes:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
   - Click "Generate token"
   - **Copy the token** (you won't see it again!)

2. **In the app:**
   - Visit: https://nhat-14.github.io/test-abb/
   - Click "🔑 GitHubトークン設定"
   - Paste your token
   - Click OK

### 4. Add New Words (Fully Automated!)

1. Click "➕ 新しい略語を追加"
2. Fill in the form
3. Click "💾 保存してコピー"
4. ✨ GitHub Actions automatically commits!
5. Page reloads in 10 seconds with new word

## How It Works

1. User saves → Frontend triggers GitHub Actions workflow
2. GitHub Actions uses built-in `GITHUB_TOKEN` to commit
3. Changes appear in repository
4. GitHub Pages auto-updates

## Security

- User tokens stored only in browser localStorage
- GitHub Actions uses secure, built-in authentication
- No external servers needed
- Everything stays within GitHub

## Troubleshooting

**Token not working?**
- Make sure you selected both `repo` and `workflow` scopes
- Try deleting and re-entering the token

**Actions not running?**
- Check: https://github.com/nhat-14/test-abb/actions
- Verify Actions are enabled in repository settings

**Changes not appearing?**
- Wait 10-15 seconds for Actions to complete
- Check the Actions tab for workflow status
- GitHub Pages may take 1-2 minutes to update
