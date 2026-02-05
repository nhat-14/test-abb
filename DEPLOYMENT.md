# Deployment Instructions

## Deploy to Vercel (Recommended)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Create GitHub Personal Access Token
1. Go to: https://github.com/settings/tokens/new
2. Name: "Abbreviation Dictionary Backend"
3. Select scope: ✅ **repo** (all repo permissions)
4. Click "Generate token"
5. Copy the token

### 3. Deploy to Vercel
```bash
vercel
```

Follow the prompts:
- Set up and deploy: Y
- Which scope: (your account)
- Link to existing project: N
- Project name: test-abb
- Directory: ./
- Override settings: N

### 4. Set Environment Variable
```bash
vercel env add GITHUB_TOKEN
```

Paste your GitHub token when prompted.

Select environments:
- [x] Production
- [x] Preview
- [x] Development

### 5. Redeploy
```bash
vercel --prod
```

### 6. Access Your App
Your app will be at: `https://your-project.vercel.app`

## Alternative: Deploy to Netlify

### 1. Install Netlify CLI
```bash
npm install -g netlify-cli
```

### 2. Deploy
```bash
netlify deploy --prod
```

### 3. Set Environment Variables
Go to: Netlify Dashboard → Site Settings → Build & Deploy → Environment
Add: `GITHUB_TOKEN` = your token

## After Deployment

Your users can now:
1. Visit the deployed URL
2. Click "➕ 新しい略語を追加"
3. Fill the form
4. Click save
5. **Changes automatically commit to GitHub!**

No token setup needed for users! 🎉
