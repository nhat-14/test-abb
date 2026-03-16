// Global variables
let abbreviationsData = [];
let filteredData = [];
let editingIndex = -1; // Track which item is being edited

// GitHub configuration
const GITHUB_OWNER = 'nhat-14';
const GITHUB_REPO = 'test-abb';

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

`;
}

function buildIssueTitle(abbreviation, isEdit) {
    return `${isEdit ? '[UPDATE]' : '[NEW]'} ${abbreviation}`;
}

function buildIssueBody(item, originalAbbreviation) {
    return `**略語:**

${item.abbreviation}

**元の略語 (編集時のみ):**

${originalAbbreviation}

**意味 (日本語):**

${item.meaningJa}

**意味 (English):**

${item.meaningEn}

---
このIssueを作成すると、GitHub Actions が自動で Pull Request を作成します。`;
}

function buildIssueUrl(item, originalAbbreviation, isEdit) {
    const issueUrl = new URL(`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues/new`);
    issueUrl.searchParams.set('template', 'new-abbreviation.md');
    issueUrl.searchParams.set('labels', 'enhancement');
    issueUrl.searchParams.set('title', buildIssueTitle(item.abbreviation, isEdit));
    issueUrl.searchParams.set('body', buildIssueBody(item, originalAbbreviation));
    return issueUrl.toString();
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
    let originalAbbreviation = '';

    if (editingIndex >= 0) {
        const existingItem = filteredData[editingIndex];
        category = existingItem.category || '';
        originalAbbreviation = existingItem.abbreviation || '';
    }

    if (!abbr || (!meaningJa && !meaningEn)) {
        alert('略語は必須です。意味は日本語または英語のどちらかを入力してください。');
        return;
    }

    const issueItem = {
        abbreviation: abbr,
        meaningJa,
        meaningEn,
        category
    };

    const issueUrl = buildIssueUrl(issueItem, originalAbbreviation, editingIndex >= 0);
    window.open(issueUrl, '_blank', 'noopener');
    closeModal();
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
