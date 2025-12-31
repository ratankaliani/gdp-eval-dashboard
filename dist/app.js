// Global state
const state = {
    allTasks: [],
    filteredTasks: [],
    currentIndex: 0,
    sectors: new Set(),
    occupations: new Set(),
};
// DOM elements
const sectorFilter = document.getElementById('sectorFilter');
const occupationFilter = document.getElementById('occupationFilter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const randomBtn = document.getElementById('randomBtn');
const currentTaskNum = document.getElementById('currentTaskNum');
const taskCounter = document.getElementById('taskCounter');
const sectorEl = document.getElementById('sector');
const occupationEl = document.getElementById('occupation');
const taskIdEl = document.getElementById('taskId');
const promptEl = document.getElementById('prompt');
const fileListEl = document.getElementById('fileList');
const referenceFilesSection = document.getElementById('referenceFilesSection');
/**
 * Load the GDP Val dataset from JSON file
 */
async function loadData() {
    try {
        const response = await fetch('gdpval_data.json');
        const data = await response.json();
        state.allTasks = data.tasks;
        state.filteredTasks = [...state.allTasks];
        // Extract unique sectors and occupations
        state.allTasks.forEach((task) => {
            state.sectors.add(task.sector);
            state.occupations.add(task.occupation);
        });
        // Populate filters
        populateFilters();
        // Display first task
        displayTask(0);
        updateNavigation();
    }
    catch (error) {
        console.error('Error loading data:', error);
        promptEl.textContent = 'Error loading tasks. Please make sure gdpval_data.json is in the same directory.';
    }
}
/**
 * Populate the sector and occupation filter dropdowns
 */
function populateFilters() {
    // Populate sector filter
    const sortedSectors = Array.from(state.sectors).sort();
    sortedSectors.forEach((sector) => {
        const option = document.createElement('option');
        option.value = sector;
        option.textContent = sector;
        sectorFilter.appendChild(option);
    });
    // Populate occupation filter
    const sortedOccupations = Array.from(state.occupations).sort();
    sortedOccupations.forEach((occupation) => {
        const option = document.createElement('option');
        option.value = occupation;
        option.textContent = occupation;
        occupationFilter.appendChild(option);
    });
}
/**
 * Display a task at the specified index
 */
function displayTask(index) {
    if (index < 0 || index >= state.filteredTasks.length)
        return;
    const task = state.filteredTasks[index];
    state.currentIndex = index;
    // Update metadata
    sectorEl.textContent = task.sector;
    occupationEl.textContent = task.occupation;
    taskIdEl.textContent = task.task_id;
    // Update prompt
    promptEl.textContent = task.prompt;
    // Update reference files
    if (task.reference_file_urls && task.reference_file_urls.length > 0) {
        referenceFilesSection.style.display = 'block';
        fileListEl.innerHTML = '';
        task.reference_file_urls.forEach((url) => {
            const fileName = url.split('/').pop() || 'unknown';
            const fileExt = fileName.split('.').pop()?.toUpperCase();
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            const icon = document.createElement('span');
            icon.className = 'file-icon';
            icon.textContent = getFileIcon(fileExt);
            const link = document.createElement('a');
            link.className = 'file-link';
            link.href = url;
            link.target = '_blank';
            link.textContent = fileName;
            fileItem.appendChild(icon);
            fileItem.appendChild(link);
            fileListEl.appendChild(fileItem);
        });
    }
    else {
        referenceFilesSection.style.display = 'none';
    }
    // Update counter
    const actualIndex = state.allTasks.findIndex((t) => t.task_id === task.task_id);
    currentTaskNum.textContent = (actualIndex + 1).toString();
    taskCounter.textContent = `Task ${state.currentIndex + 1} of ${state.filteredTasks.length}`;
    updateNavigation();
}
/**
 * Get emoji icon for file extension
 */
function getFileIcon(ext) {
    if (!ext)
        return '📎';
    const icons = {
        'PDF': '📄',
        'XLSX': '📊',
        'XLS': '📊',
        'DOCX': '📝',
        'DOC': '📝',
        'PPTX': '📽️',
        'PPT': '📽️',
        'TXT': '📃',
        'CSV': '📈',
    };
    return icons[ext] || '📎';
}
/**
 * Update navigation button states
 */
function updateNavigation() {
    prevBtn.disabled = state.currentIndex === 0;
    nextBtn.disabled = state.currentIndex === state.filteredTasks.length - 1;
}
/**
 * Apply sector and occupation filters
 */
function applyFilters() {
    const selectedSector = sectorFilter.value;
    const selectedOccupation = occupationFilter.value;
    state.filteredTasks = state.allTasks.filter((task) => {
        const sectorMatch = !selectedSector || task.sector === selectedSector;
        const occupationMatch = !selectedOccupation || task.occupation === selectedOccupation;
        return sectorMatch && occupationMatch;
    });
    state.currentIndex = 0;
    if (state.filteredTasks.length > 0) {
        displayTask(0);
    }
    else {
        promptEl.textContent = 'No tasks match the selected filters.';
        referenceFilesSection.style.display = 'none';
    }
}
/**
 * Display a random task from filtered tasks
 */
function getRandomTask() {
    if (state.filteredTasks.length === 0)
        return;
    const randomIndex = Math.floor(Math.random() * state.filteredTasks.length);
    displayTask(randomIndex);
}
// Event listeners
prevBtn.addEventListener('click', () => {
    if (state.currentIndex > 0) {
        displayTask(state.currentIndex - 1);
    }
});
nextBtn.addEventListener('click', () => {
    if (state.currentIndex < state.filteredTasks.length - 1) {
        displayTask(state.currentIndex + 1);
    }
});
randomBtn.addEventListener('click', getRandomTask);
sectorFilter.addEventListener('change', applyFilters);
occupationFilter.addEventListener('change', applyFilters);
// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && state.currentIndex > 0) {
        displayTask(state.currentIndex - 1);
    }
    else if (e.key === 'ArrowRight' && state.currentIndex < state.filteredTasks.length - 1) {
        displayTask(state.currentIndex + 1);
    }
    else if (e.key === 'r' || e.key === 'R') {
        getRandomTask();
    }
});
// Initialize
loadData();
export {};
//# sourceMappingURL=app.js.map