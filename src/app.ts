import { GDPTask, GDPValDataset, FileExtension, AppState } from './types.js';

// Global state
const state: AppState = {
  allTasks: [],
  filteredTasks: [],
  currentIndex: 0,
  sectors: new Set<string>(),
  occupations: new Set<string>(),
};

// DOM elements
const sectorFilter = document.getElementById('sectorFilter') as HTMLSelectElement;
const occupationFilter = document.getElementById('occupationFilter') as HTMLSelectElement;
const prevBtn = document.getElementById('prevBtn') as HTMLButtonElement;
const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement;
const randomBtn = document.getElementById('randomBtn') as HTMLButtonElement;
const currentTaskNum = document.getElementById('currentTaskNum') as HTMLElement;
const taskCounter = document.getElementById('taskCounter') as HTMLElement;
const sectorEl = document.getElementById('sector') as HTMLElement;
const occupationEl = document.getElementById('occupation') as HTMLElement;
const taskIdEl = document.getElementById('taskId') as HTMLElement;
const promptEl = document.getElementById('prompt') as HTMLElement;
const fileListEl = document.getElementById('fileList') as HTMLElement;
const referenceFilesSection = document.getElementById('referenceFilesSection') as HTMLElement;

/**
 * Load the GDP Val dataset from JSON file
 */
async function loadData(): Promise<void> {
  try {
    const response = await fetch('gdpval_data.json');
    const data: GDPValDataset = await response.json();
    state.allTasks = data.tasks;
    state.filteredTasks = [...state.allTasks];

    // Extract unique sectors and occupations
    state.allTasks.forEach((task: GDPTask) => {
      state.sectors.add(task.sector);
      state.occupations.add(task.occupation);
    });

    // Populate filters
    populateFilters();

    // Display first task
    displayTask(0);
    updateNavigation();
  } catch (error) {
    console.error('Error loading data:', error);
    promptEl.textContent = 'Error loading tasks. Please make sure gdpval_data.json is in the same directory.';
  }
}

/**
 * Populate the sector and occupation filter dropdowns
 */
function populateFilters(): void {
  // Populate sector filter
  const sortedSectors = Array.from(state.sectors).sort();
  sortedSectors.forEach((sector: string) => {
    const option = document.createElement('option');
    option.value = sector;
    option.textContent = sector;
    sectorFilter.appendChild(option);
  });

  // Populate occupation filter
  const sortedOccupations = Array.from(state.occupations).sort();
  sortedOccupations.forEach((occupation: string) => {
    const option = document.createElement('option');
    option.value = occupation;
    option.textContent = occupation;
    occupationFilter.appendChild(option);
  });
}

/**
 * Display a task at the specified index
 */
function displayTask(index: number): void {
  if (index < 0 || index >= state.filteredTasks.length) return;

  const task: GDPTask = state.filteredTasks[index];
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

    task.reference_file_urls.forEach((url: string) => {
      const fileName = url.split('/').pop() || 'unknown';
      const fileExt = fileName.split('.').pop()?.toUpperCase() as FileExtension;

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
  } else {
    referenceFilesSection.style.display = 'none';
  }

  // Update counter
  const actualIndex = state.allTasks.findIndex((t: GDPTask) => t.task_id === task.task_id);
  currentTaskNum.textContent = (actualIndex + 1).toString();
  taskCounter.textContent = `Task ${state.currentIndex + 1} of ${state.filteredTasks.length}`;

  updateNavigation();
}

/**
 * Get emoji icon for file extension
 */
function getFileIcon(ext: FileExtension | undefined): string {
  if (!ext) return '📎';

  const icons: Record<FileExtension, string> = {
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
function updateNavigation(): void {
  prevBtn.disabled = state.currentIndex === 0;
  nextBtn.disabled = state.currentIndex === state.filteredTasks.length - 1;
}

/**
 * Apply sector and occupation filters
 */
function applyFilters(): void {
  const selectedSector = sectorFilter.value;
  const selectedOccupation = occupationFilter.value;

  state.filteredTasks = state.allTasks.filter((task: GDPTask) => {
    const sectorMatch = !selectedSector || task.sector === selectedSector;
    const occupationMatch = !selectedOccupation || task.occupation === selectedOccupation;
    return sectorMatch && occupationMatch;
  });

  state.currentIndex = 0;
  if (state.filteredTasks.length > 0) {
    displayTask(0);
  } else {
    promptEl.textContent = 'No tasks match the selected filters.';
    referenceFilesSection.style.display = 'none';
  }
}

/**
 * Display a random task from filtered tasks
 */
function getRandomTask(): void {
  if (state.filteredTasks.length === 0) return;
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
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft' && state.currentIndex > 0) {
    displayTask(state.currentIndex - 1);
  } else if (e.key === 'ArrowRight' && state.currentIndex < state.filteredTasks.length - 1) {
    displayTask(state.currentIndex + 1);
  } else if (e.key === 'r' || e.key === 'R') {
    getRandomTask();
  }
});

// Initialize
loadData();
