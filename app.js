// Global variables
let abbreviationsData = [];
let filteredData = [];
let editingIndex = -1; // Track which item is being edited

// GitHub configuration
const GITHUB_OWNER = 'nhat-14';
const GITHUB_REPO = 'test-abb';
const FILE_PATH = 'data/abbreviations.md';
const BRANCH = 'main';

// DOM Elements - will be initialized on page load
let searchInput, tableBody;
let loading, errorDiv, noResults, addNewBtn, modal;
let closeModalBtn, cancelBtn;

// Load Markdown data
async function loadData() {
    console.log('Loading markdown data...');
    try {
        console.log('Fetching: data/abbreviations.md');
        const response = await fetch('data/abbreviations.md');
        console.log('Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error('Markdown file not found (status: ' + response.status + ')');
        }
        
        const mdText = await response.text();
        console.log('Markdown loaded, length:', mdText.length);
        parseMarkdown(mdText);
        
        loading.style.display = 'none';
        console.log('Rendering complete');
        renderTable(abbreviationsData);
        
    } catch (error) {
        console.error('Error loading data:', error);
        loading.style.display = 'none';
        errorDiv.textContent = `エラー: ${error.message}`;
        errorDiv.style.display = 'block';
    }
}

// Parse Markdown text
function parseMarkdown(text) {
    console.log('Parsing markdown, length:', text.length);
    abbreviationsData = [];
    
    // Split by ### headers (abbreviations) - using proper multiline regex
    const sections = text.split(/^### /gm).slice(1); // Skip first split (header)
    
    for (const section of sections) {
        const lines = section.trim().split('\n');
        if (lines.length === 0) continue;
        
        const abbreviation = lines[0].trim();
        let meaningJa = '';
        let meaningEn = '';
        let category = '';
        
        // Parse bullet points
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('- **日本語**:')) {
                meaningJa = line.replace('- **日本語**:', '').trim();
            } else if (line.startsWith('- **English**:')) {
                meaningEn = line.replace('- **English**:', '').trim();
            } else if (line.startsWith('- **カテゴリ**:')) {
                category = line.replace('- **カテゴリ**:', '').trim();
            }
        }
        
        if (abbreviation && (meaningJa || meaningEn)) {
            abbreviationsData.push({
                abbreviation,
                meaningJa,
                meaningEn,
                category
            });
        }
    }
    
    console.log('Parsed data:', abbreviationsData.length, 'items');
    console.log('Sample item:', abbreviationsData[0]);
    
    filteredData = [...abbreviationsData];
}

// Convert data to Markdown format
function convertToMarkdown(item) {
    return `### ${item.abbreviation}
- **日本語**: ${item.meaningJa}
- **English**: ${item.meaningEn}
- **カテゴリ**: ${item.category}

`;
}

// Create pull request on GitHub
async function createPullRequestToGitHub(content, commitMessage) {
    let token = localStorage.getItem('github_actions_token');
    
    if (!token) {
        token = prompt('GitHub Personal Access Token を入力してください:\n\n1. https://github.com/settings/tokens/new にアクセス\n2. スコープを選択:\n   ✅ repo (全権限)\n3. トークンを生成してコピー\n\n注: トークンはブラウザに安全に保存されます');
        if (!token) {
            throw new Error('トークンが入力されませんでした');
        }
        localStorage.setItem('github_actions_token', token);
    }

    try {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };

        const branchName = `update-abbreviations-${Date.now()}`;

        // 1) Get base branch SHA
        const baseRefResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/ref/heads/${BRANCH}`,
            { headers }
        );

        if (!baseRefResponse.ok) {
            if (baseRefResponse.status === 401) {
                localStorage.removeItem('github_actions_token');
                throw new Error('トークンが無効です。ページを再読み込みして再度入力してください。');
            }
            throw new Error(`ベースブランチ取得失敗: ${baseRefResponse.status}`);
        }

        const baseRefData = await baseRefResponse.json();
        const baseSha = baseRefData.object?.sha;

        if (!baseSha) {
            throw new Error('ベースブランチのSHA取得に失敗しました');
        }

        // 2) Create feature branch
        const createRefResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    ref: `refs/heads/${branchName}`,
                    sha: baseSha
                })
            }
        );

        if (!createRefResponse.ok) {
            throw new Error(`作業ブランチ作成失敗: ${createRefResponse.status}`);
        }

        // 3) Get target file SHA on new branch
        const fileResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${branchName}`,
            { headers }
        );

        if (!fileResponse.ok) {
            throw new Error(`対象ファイル取得失敗: ${fileResponse.status}`);
        }

        const fileData = await fileResponse.json();
        const fileSha = fileData.sha;

        // 4) Commit updated markdown to feature branch
        const updateFileResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
            {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    message: commitMessage,
                    content: btoa(unescape(encodeURIComponent(content))),
                    sha: fileSha,
                    branch: branchName
                })
            }
        );

        if (!updateFileResponse.ok) {
            throw new Error(`ファイル更新失敗: ${updateFileResponse.status}`);
        }

        // 5) Create pull request
        const prTitle = commitMessage;
        const prBody = `Web app からの更新です。\n\n- File: ${FILE_PATH}\n- Source: in-browser edit/add operation`;
        const createPrResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    title: prTitle,
                    head: branchName,
                    base: BRANCH,
                    body: prBody
                })
            }
        );

        if (!createPrResponse.ok) {
            throw new Error(`Pull Request作成失敗: ${createPrResponse.status}`);
        }

        const prData = await createPrResponse.json();

        return {
            success: true,
            prUrl: prData.html_url,
            branchName
        };
    } catch (error) {
        console.error('PR creation error:', error);
        throw error;
    }
}

// Generate full markdown content
function generateMarkdownContent() {
    let content = `# 略語データベース (Abbreviation Database)

このファイルを編集して、新しい略語を追加したり既存の略語を修正したりできます。

## データ形式

各略語は以下の形式で記述してください：

\`\`\`
### 略語名
- **日本語**: 意味（日本語）
- **English**: English Meaning
- **カテゴリ**: カテゴリ名
\`\`\`

---

`;
    
    // Group by category
    const categories = {};
    abbreviationsData.forEach(item => {
        const cat = item.category || '未分類';
        if (!categories[cat]) {
            categories[cat] = [];
        }
        categories[cat].push(item);
    });
    
    // Generate content for each category
    Object.keys(categories).sort().forEach(category => {
        content += `## ${category}\n\n`;
        categories[category].forEach(item => {
            content += convertToMarkdown(item);
        });
        content += '---\n\n';
    });
    
    return content;
}

// Render table (click any row to edit)
function renderTable(data) {
    if (data.length === 0) {
        tableBody.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';

    tableBody.innerHTML = data.map((item, index) => `
        <tr class="editable-row" data-index="${index}" title="クリックして編集">
            <td>${escapeHtml(item.abbreviation)}</td>
            <td>${escapeHtml(item.meaningJa)}</td>
            <td>${escapeHtml(item.meaningEn)}</td>
        </tr>
    `).join('');

    document.querySelectorAll('.editable-row').forEach(row => {
        row.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'), 10);
            editAbbreviation(index);
        });
    });
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Search/Filter
function filterData() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredData = [...abbreviationsData];
    } else {
        filteredData = abbreviationsData.filter(item => 
            item.abbreviation.toLowerCase().includes(searchTerm) ||
            item.meaningJa.toLowerCase().includes(searchTerm) ||
            item.meaningEn.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm)
        );
    }
    
    renderTable(filteredData);
}

// Edit abbreviation - pre-fill modal with existing data
function editAbbreviation(index) {
    editingIndex = index;
    const item = filteredData[index];
    
    // Pre-fill the form
    document.getElementById('abbr').value = item.abbreviation;
    document.getElementById('meaningJa').value = item.meaningJa;
    document.getElementById('meaningEn').value = item.meaningEn;
    
    // Update modal title
    document.querySelector('.modal-content h2').textContent = '略語を編集';
    
    // Open modal
    modal.style.display = 'block';
    document.getElementById('saveSuccess').style.display = 'none';
}

// Modal functions
function openModal() {
    editingIndex = -1; // Reset editing mode
    document.querySelector('.modal-content h2').textContent = '新しい略語を追加';
    modal.style.display = 'block';
    document.getElementById('addForm').reset();
    document.getElementById('saveSuccess').style.display = 'none';
}

function closeModal() {
    modal.style.display = 'none';
    editingIndex = -1;
    document.getElementById('saveSuccess').style.display = 'none';
}

function saveFormData() {
    const abbr = document.getElementById('abbr').value.trim();
    const meaningJa = document.getElementById('meaningJa').value.trim();
    const meaningEn = document.getElementById('meaningEn').value.trim();
    let category = '';

    // Keep category when editing because simplified form does not expose category.
    if (editingIndex >= 0) {
        const existingItem = filteredData[editingIndex];
        category = existingItem.category || '';
    }
    
    if (!abbr || (!meaningJa && !meaningEn)) {
        alert('略語は必須です。意味は日本語または英語のどちらかを入力してください。');
        return;
    }
    
    const newItem = {
        abbreviation: abbr,
        meaningJa: meaningJa,
        meaningEn: meaningEn,
        category: category
    };
    
    // Update or add to data
    if (editingIndex >= 0) {
        // Edit existing entry
        const actualIndex = abbreviationsData.indexOf(filteredData[editingIndex]);
        abbreviationsData[actualIndex] = newItem;
    } else {
        // Add new entry
        abbreviationsData.push(newItem);
    }
    
    // Regenerate markdown
    const markdownContent = generateMarkdownContent();
    
    // Update filtered data
    filteredData = [...abbreviationsData];
    renderTable(filteredData);
    
    // Show loading message
    document.getElementById('csvOutput').innerHTML = `
        <p style="color: #3b82f6; font-size: 1.1em;">⏳ Pull Request を作成中...</p>
    `;
    document.getElementById('saveSuccess').style.display = 'block';
    
    // Commit to GitHub
    const commitMessage = editingIndex >= 0 
        ? `Update abbreviation: ${abbr}`
        : `Add new abbreviation: ${abbr}`;
    
    createPullRequestToGitHub(markdownContent, commitMessage)
        .then(result => {
            document.getElementById('csvOutput').innerHTML = `
                <p style="color: #10b981; font-weight: bold; font-size: 1.1em; margin-bottom: 15px;">✅ Pull Request を作成しました！</p>
                <p style="margin-bottom: 15px;">レビューしてマージすると本番データに反映されます。</p>
                <a href="${result.prUrl}" 
                   target="_blank" 
                   class="btn-primary" 
                   style="display: inline-block; padding: 12px 24px; text-decoration: none; margin-bottom: 15px;">
                    🔍 Pull Request を開く
                </a>
                <p style="font-size: 0.9em; color: #64748b; margin-top: 10px;">
                    マージ後にページを再読み込みしてください (F5)
                </p>
            `;
            
            // Keep modal open so user can click PR link
        })
        .catch(error => {
            console.error('GitHub PR creation failed:', error);
            document.getElementById('csvOutput').innerHTML = `
                <p style="color: #ef4444; font-weight: bold; font-size: 1.1em; margin-bottom: 15px;">❌ エラーが発生しました</p>
                <p style="margin-bottom: 15px;">${error.message}</p>
                <p style="font-size: 0.9em; color: #64748b;">手動で編集するには:</p>
                <a href="https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/edit/${BRANCH}/${FILE_PATH}" 
                   target="_blank" 
                   class="btn-primary" 
                   style="display: inline-block; padding: 12px 24px; text-decoration: none; margin-top: 10px;">
                    📝 GitHubで手動編集
                </a>
            `;
            
            // Copy to clipboard as fallback
            navigator.clipboard.writeText(markdownContent).catch(() => {});
        });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    searchInput = document.getElementById('searchInput');
    tableBody = document.getElementById('tableBody');
    loading = document.getElementById('loading');
    errorDiv = document.getElementById('error');
    noResults = document.getElementById('noResults');
    addNewBtn = document.getElementById('addNewBtn');
    modal = document.getElementById('addModal');
    closeModalBtn = document.querySelector('.close');
    const saveBtn = document.getElementById('saveBtn');
    cancelBtn = document.getElementById('cancelBtn');
    
    // Set up event listeners
    searchInput.addEventListener('input', filterData);
    addNewBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    saveBtn.addEventListener('click', saveFormData);
    cancelBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
        }
    });
    
    // Load data
    console.log('Calling loadData()...');
    loadData();
});
