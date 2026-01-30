// Global variables
let abbreviationsData = [];
let filteredData = [];

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
    
    filteredData = [...abbreviationsData];
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

// Render table
function renderTable(data) {
    if (data.length === 0) {
        tableBody.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    tableBody.innerHTML = data.map(item => `
        <tr>
            <td>${escapeHtml(item.abbreviation)}</td>
            <td>${escapeHtml(item.meaningJa)}</td>
            <td>${escapeHtml(item.meaningEn)}</td>
            <td>${item.category ? `<span class="category-badge">${escapeHtml(item.category)}</span>` : ''}</td>
        </tr>
    `).join('');
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

// Modal functions
function openModal() {
    modal.style.display = 'block';
    copySuccess.style.display = 'none';
    document.getElementById('addForm').reset();
}

function closeModal() {
    modal.style.display = 'none';
}

function copyFormData() {
    const abbr = document.getElementById('abbr').value.trim();
    const meaningJa = document.getElementById('meaningJa').value.trim();
    const meaningEn = document.getElementById('meaningEn').value.trim();
    const category = document.getElementById('category').value.trim();
    
    if (!abbr || !meaningJa) {
        alert('略語と日本語の意味は必須です');
        return;
    }
    
    const csvLine = [abbr, meaningJa, meaningEn, category]
        .map(field => `"${field.replace(/"/g, '""')}"`)
        .join(',');
    
    navigator.clipboard.writeText(csvLine).then(() => {
        copySuccess.style.display = 'block';
        setTimeout(() => {
            copySuccess.style.display = 'none';
        }, 3000);
    }).catch(err => {
        alert('コピーに失敗しました: ' + err);
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
    copyBtn = document.getElementById('copyBtn');
    cancelBtn = document.getElementById('cancelBtn');
    copySuccess = document.getElementById('copySuccess');
    
    // Set up event listeners
    searchInput.addEventListener('input', filterData);
    clearBtn.addEventListener('click', clearSearch);
    addNewBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    copyBtn.addEventListener('click', copyFormData);
    
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
