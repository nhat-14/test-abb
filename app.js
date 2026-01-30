// Global variables
let abbreviationsData = [];
let filteredData = [];
let editingIndex = -1; // Track which item is being editedlet githubToken = localStorage.getItem('github_token') || ''; // Store token in browser
// DOM Elements - will be initialized on page load
let searchInput, clearBtn, tableBody, totalCount, filteredCount;
let loading, errorDiv, noResults, addNewBtn, modal;
let closeModalBtn, copyBtn, cancelBtn, copySuccess;

// Load CSV data
async function loadCSV() {
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
        errorDiv.textContent = `エラー: ${error.message}`;
        errorDiv.style.display = 'block';
    }
}

// Parse CSV text
function parseCSV(text) {
    const lines = text.split('\n');
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
    
    console.log('Parsed data:', abbreviationsData.length, 'items');
    console.log('Sample item:', abbreviationsData[0]);
    
    filteredData = [...abbreviationsData];
    populateCategoryDropdown();
}

// Populate category dropdown with unique categories
function populateCategoryDropdown() {
    const categorySelect = document.getElementById('categorySelect');
    
    if (!categorySelect) {
        console.error('categorySelect element not found');
        return;
    }
    
    console.log('Total abbreviations:', abbreviationsData.length);
    console.log('All categories:', abbreviationsData.map(item => item.category));
    
    // Get unique categories
    const categories = [...new Set(abbreviationsData.map(item => item.category).filter(cat => cat))];
    categories.sort();
    
    console.log('Found categories:', categories);
    
    // Clear existing options
    categorySelect.innerHTML = '<option value="">-- カテゴリを選択 --</option>';
    
    // Add existing categories
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
        console.log('Added category option:', category);
    });
    
    // Add "Other" option
    const otherOption = document.createElement('option');
    otherOption.value = '__other__';
    otherOption.textContent = '🆕 新しいカテゴリを追加';
    categorySelect.appendChild(otherOption);
    
    console.log('Dropdown populated with', categorySelect.options.length, 'options');
}

// Parse CSV line (handles quotes and commas)
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
    }
    
    result.push(current.trim());
    return result;
}

// Render table with edit buttons
function renderTable(data) {
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
                <button class="btn-edit" data-index="${index}" title="編集">✏️</button>
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
    updateStats();
    clearBtn.classList.toggle('visible', searchTerm !== '');
}

// Update statistics
function updateStats() {
    totalCount.textContent = `全体: ${abbreviationsData.length}件`;
    
    if (filteredData.length !== abbreviationsData.length) {
        filteredCount.textContent = `検索結果: ${filteredData.length}件`;
        filteredCount.style.display = 'inline';
    } else {
        filteredCount.style.display = 'none';
    }
}

// Clear search
function clearSearch() {
    searchInput.value = '';
    filterData();
}

// Edit abbreviation - pre-fill modal with existing data
function editAbbreviation(index) {
    editingIndex = index;
    const item = filteredData[index];
    
    // Pre-fill the form
    document.getElementById('abbr').value = item.abbreviation;
    document.getElementById('meaningJa').value = item.meaningJa;
    document.getElementById('meaningEn').value = item.meaningEn;
    
    // Set category dropdown
    const categorySelect = document.getElementById('categorySelect');
    const customCategoryGroup = document.getElementById('customCategoryGroup');
    
    if (item.category) {
        // Check if category exists in dropdown
        const optionExists = Array.from(categorySelect.options).some(opt => opt.value === item.category);
        if (optionExists) {
            categorySelect.value = item.category;
            customCategoryGroup.style.display = 'none';
        } else {
            // Category not in list, use custom
            categorySelect.value = '__other__';
            customCategoryGroup.style.display = 'block';
            document.getElementById('customCategory').value = item.category;
        }
    } else {
        categorySelect.value = '';
        customCategoryGroup.style.display = 'none';
    }
    
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
    document.getElementById('customCategoryGroup').style.display = 'none';
    document.getElementById('categorySelect').value = '';
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
    
    // Get category from dropdown or custom input
    const categorySelect = document.getElementById('categorySelect');
    let category = '';
    if (categorySelect.value === '__other__') {
        category = document.getElementById('customCategory').value.trim();
    } else {
        category = categorySelect.value;
    }
    
    if (!abbr || !meaningJa) {
        alert('略語と日本語の意味は必須です');
        return;
    }
    
    // Create CSV line
    const csvLine = [abbr, meaningJa, meaningEn, category]
        .map(field => `"${field.replace(/"/g, '""')}"`)
        .join(',');
    
    // Copy to clipboard
    navigator.clipboard.writeText(csvLine).then(() => {
        document.getElementById('csvOutput').innerHTML = `
            <p style="color: #10b981; font-weight: bold; font-size: 1.1em; margin-bottom: 15px;">✅ CSV形式でコピーしました！</p>
            <p style="margin-bottom: 15px;">以下のリンクからGitHubでCSVファイルを編集してください：</p>
            <a href="https://github.com/MitsubishiElectric-InnerSource/me-ryakushou/edit/main/data/abbreviations.csv" 
               target="_blank" 
               class="btn-primary" 
               style="display: inline-block; padding: 12px 24px; text-decoration: none; margin-bottom: 15px;">
                📝 GitHubでCSVを編集
            </a>
            <p style="font-size: 0.9em; color: #64748b; margin-top: 10px;">
                1. リンクをクリック<br>
                2. ファイルの最後にペースト<br>
                3. "Commit changes"をクリック
            </p>
            <details style="margin-top: 15px;">
                <summary style="cursor: pointer; color: #64748b;">コピーした内容を確認</summary>
                <code style="display: block; margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px; word-break: break-all;">${csvLine}</code>
            </details>
        `;
        document.getElementById('saveSuccess').style.display = 'block';
    }).catch(err => {
        console.error('Copy failed:', err);
        alert('クリップボードへのコピーに失敗しました');
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    searchInput = document.getElementById('searchInput');
    clearBtn = document.getElementById('clearBtn');
    tableBody = document.getElementById('tableBody');
    totalCount = document.getElementById('totalCount');
    filteredCount = document.getElementById('filteredCount');
    loading = document.getElementById('loading');
    errorDiv = document.getElementById('error');
    noResults = document.getElementById('noResults');
    addNewBtn = document.getElementById('addNewBtn');
    modal = document.getElementById('addModal');
    closeModalBtn = document.querySelector('.close');
    const saveBtn = document.getElementById('saveBtn');
    cancelBtn = document.getElementById('cancelBtn');
    
    // Set up category dropdown change listener
    const categorySelect = document.getElementById('categorySelect');
    const customCategoryGroup = document.getElementById('customCategoryGroup');
    
    categorySelect.addEventListener('change', function() {
        if (this.value === '__other__') {
            customCategoryGroup.style.display = 'block';
            document.getElementById('customCategory').focus();
        } else {
            customCategoryGroup.style.display = 'none';
            document.getElementById('customCategory').value = '';
        }
    });
    
    // Set up event listeners
    searchInput.addEventListener('input', filterData);
    clearBtn.addEventListener('click', clearSearch);
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
    
    // Load CSV data
    loadCSV();
});
