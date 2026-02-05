// Serverless function to commit to GitHub
// Deploy this to Vercel or Netlify

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { content, message } = req.body;
        
        if (!content || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // GitHub configuration - use environment variables
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const GITHUB_OWNER = process.env.GITHUB_OWNER || 'nhat-14';
        const GITHUB_REPO = process.env.GITHUB_REPO || 'test-abb';
        const FILE_PATH = 'data/abbreviations.md';
        const BRANCH = 'main';
        
        if (!GITHUB_TOKEN) {
            return res.status(500).json({ error: 'GitHub token not configured' });
        }
        
        // Get current file SHA
        const getResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
            {
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Abbreviation-Dictionary'
                }
            }
        );
        
        if (!getResponse.ok) {
            const errorData = await getResponse.json();
            return res.status(getResponse.status).json({ 
                error: 'Failed to get current file',
                details: errorData.message 
            });
        }
        
        const fileData = await getResponse.json();
        const sha = fileData.sha;
        
        // Update file
        const updateResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Abbreviation-Dictionary'
                },
                body: JSON.stringify({
                    message: message,
                    content: Buffer.from(content, 'utf-8').toString('base64'),
                    sha: sha,
                    branch: BRANCH
                })
            }
        );
        
        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            return res.status(updateResponse.status).json({ 
                error: 'Failed to commit',
                details: errorData.message 
            });
        }
        
        const result = await updateResponse.json();
        
        return res.status(200).json({
            success: true,
            commit: result.commit,
            message: 'Successfully committed to GitHub'
        });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}
