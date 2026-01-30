// Global variables
let abbreviationsData = [];
let filteredData = [];
let currentLang = 'ja';
let editingIndex = -1;

// Translations
const translations = {
    ja: {
        headerTitle: '略語辞典 (Abbreviation Dictionary)',
        headerSubtitle: '組織内略語検索システム',
        searchPlaceholder: '略語または意味を検索... (例: API, HTTP, など)',
        clearTitle: 'クリア',
        loading: '読込中...',
        total: '全体',
        results: '検索結果',
        items: '件',
        addNew: '➕ 新しい略語を追加',
        thAbbr: '略語',
        thMeaningJa: '意味 (日本語)',
        thMeaningEn: 'English Meaning',
        thCategory: 'カテゴリ',
        noResults: '検索結果が見つかりませんでした',
        footer1: '💡 新しい略語を追加するには、<a href="CONTRIBUTING.md" target="_blank">CONTRIBUTING.md</a>を参照してください',
        footer2: 'または <a href="https://github.com/YOUR_ORG/me-ryakushou/issues/new" target="_blank">GitHub Issue</a> を作成してください',
        modalTitle: '新しい略語を追加',
        modalInfo: 'この情報はCSV形式でコピーできます。GitHub Issues または Pull Request で提出してください。',
        labelAbbr: '略語 *',
        labelMeaningJa: '意味 (日本語) *',
        labelMeaningEn: '意味 (English)',
        labelCategory: 'カテゴリ',
        btnCopy: '📋 CSV形式でコピー',
        btnCancel: 'キャンセル',
        copySuccess: '✅ コピーしました! GitHub Issueまたはプルリクエストで提出してください。',
        errorMsg: 'エラー:',
        requiredFields: '略語と日本語の意味は必須です',
        copyFailed: 'コピーに失敗しました:'
    },
    en: {
        headerTitle: 'Abbreviation Dictionary',
        headerSubtitle: 'Organization Abbreviation Search System',
        searchPlaceholder: 'Search abbreviations or meanings... (e.g., API, HTTP)',
        clearTitle: 'Clear',
        loading: 'Loading...',
        total: 'Total',
        results: 'Results',
        items: 'items',
        addNew: '➕ Add New Abbreviation',
        thAbbr: 'Abbreviation',
        thMeaningJa: 'Meaning (Japanese)',
        thMeaningEn: 'English Meaning',
        thCategory: 'Category',
        noResults: 'No results found',
        footer1: '💡 To add new abbreviations, please refer to <a href="CONTRIBUTING.md" target="_blank">CONTRIBUTING.md</a>',
        footer2: 'Or create a <a href="https://github.com/YOUR_ORG/me-ryakushou/issues/new" target="_blank">GitHub Issue</a>',
        modalTitle: 'Add New Abbreviation',
        modalInfo: 'This information can be copied in CSV format. Submit via GitHub Issues or Pull Request.',
        labelAbbr: 'Abbreviation *',
        labelMeaningJa: 'Meaning (Japanese) *',
        labelMeaningEn: 'Meaning (English)',
        labelCategory: 'Category',
        btnCopy: '📋 Copy as CSV',
        btnCancel: 'Cancel',
        copySuccess: '✅ Copied! Please submit via GitHub Issue or Pull Request.',
        errorMsg: 'Error:',
        requiredFields: 'Abbreviation and Japanese meaning are required',
        copyFailed: 'Failed to copy:'
    }
};

// Switch language
function switchLanguage(lang) {
    currentLang = lang;
    
    const langJaBtn = document.getElementById('langJa');
    const langEnBtn = document.getElementById('langEn');
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');
    
    // Update active button
    langJaBtn.classList.toggle('active', lang === 'ja');
    langEnBtn.classList.toggle('active', lang === 'en');
    
    // Update all text elements
    const t = translations[lang];
    
    document.getElementById('headerTitle').textContent = t.headerTitle;
    document.getElementById('headerSubtitle').textContent = t.headerSubtitle;
    searchInput.placeholder = t.searchPlaceholder;
    clearBtn.title = t.clearTitle;
    
    // Update all elements with data-text-key
    document.querySelectorAll('[data-text-key]').forEach(elem => {
        const key = elem.getAttribute('data-text-key');
        if (t[key]) {
            if (key.includes('footer')) {
                elem.innerHTML = t[key];
            } else {
                elem.textContent = t[key];
            }
        }
    });
    
    // Update stats
    updateStats();
}

// Load CSV data
async function loadCSV() {
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    
    try {
        const response = await fetch('data/abbreviations.csv');
        if (!response.ok) {
            throw new Error('CSV file not found');
        }
        
        const csvText = await response.text();
        parseCSV(csvText);
        
        loading.style.display = 'none';
        renderTable(abbreviationsData);
        updateStats();
        
    } catch (error) {
        loading.style.display = 'none';
        errorDiv.textContent = `${translations[currentLang].errorMsg} ${error.message}`;
        errorDiv.style.display = 'block';
    }
}

// Parse CSV text
function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    abbreviationsData = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const values = parseCSVLine(line);
            if (values.length >= 2) {
                abbreviationsData.push({
                    abbreviation: values[0] || '',
                    meaningJa: values[1] || '',
                    meaningEn: values[2] || '',
                    category: values[3] || ''
                });
            }
        }
    }
    
    filteredData = [...abbreviationsData];
}

// Parse CSV line (handles quotes and commas within fields)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    const tableBody = document.getElementById('tableBody');
    const noResults = document.getElementById('noResults');
    
    }
    
    result.push(current.trim());
    return result;
}

// Render table
function renderTable(data) {
    const tableBody = document.getElementById('tableBody');
    const noResults = document.getElementById('noResults');
    
    if (data.length === 0) {
        tableBody.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    tableBody.innerHTML = data.map((item, index) => `
        <tr>
            <td>${escapeHtml(item.abbreviation)}</td>
            <td>${escapeHtml(item.meaningJa)}</td>
            <td>${escapeHtml(item.meaningEn)}</td>
            <td>${item.category ? `<span class="category-badge">${escapeHtml(item.category)}</span>` : ''}</td>
            <td class="edit-cell">
                <button class="btn-edit" data-index="${index}" title="編集">編集</button>
            </td>
        </tr>
    `).join('');
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            editAbbreviation(index);
        });
    });
}
const t = translations[currentLang];
    totalCount.textContent = `${t.total}: ${abbreviationsData.length}${t.items}`;
    
    if (filteredData.length !== abbreviationsData.length) {
        filteredCount.textContent = `${t.results}: ${filteredData.length}${t.items}
    div.textContent = text;
    return div.innerHTML;
}
Input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');
    const search
// Search/Filter functionality
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
    updateStats();
    
    // Show/hide clear button
    clearBtotalCount = document.getElementById('totalCount');
    const filteredCount = document.getElementById('filteredCount');
    const tn.classList.toggle('visible', searchTerm !== '');
}

// Update statistics
function updateStats() {
    const t = translations[currentLang];
    totalCount.textContent = `${t.total}: ${abbreviationsData.length}${t.items}`;
    
    if (filteredData.length !== abbreviationsData.length) {
        filteredCount.textContent = `${t.results}: ${filteredData.length}${t.items}`;
        filteredCount.style.display = 'inline';
    } else {
        filteredCount.style.display = 'none';
    }
}const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    filterData();
}

// Modal functions
function openModal() {
    editingIndex = -1;
    const modal = document.getElementById('addModal');
    const copySuccess = document.getElementById('copySuccess');
    modal.style.display = 'block';
    copySuccess.style.display = 'none';
    document.getElementById('addForm').reset();
    updateModalTitle();
}

function editAbbreviation(index) {
    editingIndex = index;
    const item = filteredData[index];
    const modal = document.getElementById('addModal');
    const copySuccess = document.getElementById('copySuccess');
    
    document.getElementById('abbr').value = item.abbreviation;
    document.getElementById('meaningJa').value = item.meaningJa;
    document.getElementById('meaningEn').value = item.meaningEn;
    document.getElementById('category').value = item.category;
    
    modal.style.display = 'block';
    copySuccess.style.display = 'none';
    updateModalTitle();
}

function updateModalTitle() {
    const modalTitle = document.querySelector('#addModal h2');
    if (editingIndex >= 0) {
        modalTitle.textContent = currentLang === 'ja' ? '略語を編集' : 'Edit Abbreviation';
    } else {
        modalTitle.textContent = currentLang === 'ja' ? '新しい略語を追加' : 'Add New Abbreviation';
    }
}

function closeModalFunc() {
    const modal = document.getElementById('addModal');
    modal.style.display = 'none';
}

function copyFormData() {
    const copySuccess = document.getElementById('copySuccess');
    const abbr = document.getElementById('abbr').value.trim();
    const meaningJa = document.getElementById('meaningJa').value.trim();
    const meaningEn = document.getElementById('meaningEn').value.trim();
    const category = document.getElementById('category').value.trim();
    
    const t = translations[currentLang];
    
    if (!abbr || !meaningJa) {
        alert(t.requiredFields);
        return;
    }
    
    // Create CSV format
    const csvLine = [abbr, meaningJa, meaningEn, category]
        .map(field => `"${field.replace(/"/g, '""')}"`)
        .join(',');
    
    // Copy to clipboard
    navigator.clipboard.writeText(csvLine).then(() => {
        copySuccess.textContent = editingIndex >= 0
            ? (currentLang === 'ja' ? '✅ コピーしました! 編集内容を提出してください。' : '✅ Copied! Please submit the edit.')
            : (currentLang === 'ja' ? '✅ コピーしました! GitHub Issueまたはプルリクエストで提出してください。' : '✅ Copied! Please submit via GitHub Issue or Pull Request.');
        copySuccess.style.display = 'block';
        setTimeout(() => {
            copySuccess.style.display = 'none';
        }, 3000);
    }).catch(err => {
        alert(t.copyFailed + ' ' + err);
    });
}

// Event Listeners and Initialization
function initializeApp() {
    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');
    const addNewBtn = document.getElementById('addNewBtn');
    const modal = document.getElementById('addModal');
    const closeModal = document.querySelector('.close');
    const copyBtn = document.getElementById('copyBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const langJaBtn = document.getElementById('langJa');
    const langEnBtn = document.getElementById('langEn');

    if (!searchInput || !addNewBtn || !langJaBtn) {
        console.error('Required DOM elements not found!');
        return;
    }

    searchInput.addEventListener('input', filterData);
    clearBtn.addEventListener('click', clearSearch);
    addNewBtn.addEventListener('click', openModal);
    langJaBtn.addEventListener('click', () => switchLanguage('ja'));
    langEnBtn.addEventListener('click', () => switchLanguage('en'));
    closeModal.addEventListener('click', closeModalFunc);
    cancelBtn.addEventListener('click', closeModalFunc);
    copyBtn.addEventListener('click', copyFormData);

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModalFunc();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape to close modal
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModalFunc();
        }
        
        // Focus search with Ctrl+F or Cmd+F
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
        }
    });

    // Initialize - Load CSV data
    console.log('Initializing app, loading CSV...');
    loadCSV();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM already loaded
    initializeApp();
}
