import { AppState } from './types.js';
import { loadConfig, generateDefaultConfig } from './config.js';
import { fetchDataset, fetchSampleItem } from './data-loader.js';
import {
  renderHeader,
  renderStats,
  renderFilters,
  renderMetadata,
  renderContent,
  renderFiles,
  updateNavigation,
  showLoading,
  showError,
} from './renderer.js';

// Global application state
const state: AppState = {
  config: null,
  allItems: [],
  filteredItems: [],
  currentIndex: 0,
  filterValues: new Map(),
  activeFilters: new Map(),
  isLoading: false,
  error: null,
};

/**
 * Initialize the application
 */
async function init(): Promise<void> {
  showLoading('Loading configuration...');

  try {
    // Load config from URL params or config file
    const { config, datasetId } = await loadConfig();

    if (!datasetId) {
      showError('No dataset specified. Add ?dataset=owner/name to the URL.');
      return;
    }

    // If no config, we need to auto-generate one
    let finalConfig = config;
    if (!finalConfig) {
      showLoading('Analyzing dataset schema...');
      const sample = await fetchSampleItem(datasetId);
      if (!sample) {
        showError('Failed to fetch dataset sample.');
        return;
      }
      finalConfig = generateDefaultConfig(datasetId, sample);
    }

    state.config = finalConfig;

    // Render initial UI
    renderHeader(finalConfig);

    // Fetch all data
    showLoading('Fetching dataset...');
    state.allItems = await fetchDataset(datasetId, (loaded, total) => {
      showLoading(`Loading... ${loaded}/${total} items`);
    });
    state.filteredItems = [...state.allItems];

    // Extract filter values
    for (const filter of finalConfig.filterFields) {
      const values = new Set<string>();
      state.allItems.forEach(item => {
        const val = item[filter.field];
        if (val !== null && val !== undefined) {
          values.add(String(val));
        }
      });
      state.filterValues.set(filter.field, values);
    }

    // Render stats and filters
    renderStats(finalConfig, state.allItems);
    renderFilters(finalConfig, state.allItems, handleFilterChange);

    // Set up event listeners
    setupEventListeners();

    // Display first item
    displayItem(0);

  } catch (error) {
    console.error('Initialization error:', error);
    showError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

/**
 * Display an item at the specified index
 */
function displayItem(index: number): void {
  if (!state.config || index < 0 || index >= state.filteredItems.length) return;

  state.currentIndex = index;
  const item = state.filteredItems[index];

  renderMetadata(state.config, item);
  renderContent(state.config, item);
  renderFiles(state.config, item);
  updateNavigation(state);
}

/**
 * Handle filter change
 */
function handleFilterChange(field: string, value: string): void {
  if (value) {
    state.activeFilters.set(field, value);
  } else {
    state.activeFilters.delete(field);
  }

  applyFilters();
}

/**
 * Apply all active filters
 */
function applyFilters(): void {
  state.filteredItems = state.allItems.filter(item => {
    for (const [field, value] of state.activeFilters) {
      if (String(item[field]) !== value) {
        return false;
      }
    }
    return true;
  });

  state.currentIndex = 0;

  if (state.filteredItems.length > 0) {
    displayItem(0);
  } else {
    const promptEl = document.getElementById('prompt');
    if (promptEl) {
      promptEl.textContent = 'No items match the selected filters.';
    }
    updateNavigation(state);
  }
}

/**
 * Navigate to previous item
 */
function prevItem(): void {
  if (state.currentIndex > 0) {
    displayItem(state.currentIndex - 1);
  }
}

/**
 * Navigate to next item
 */
function nextItem(): void {
  if (state.currentIndex < state.filteredItems.length - 1) {
    displayItem(state.currentIndex + 1);
  }
}

/**
 * Navigate to random item
 */
function randomItem(): void {
  if (state.filteredItems.length === 0) return;
  const randomIndex = Math.floor(Math.random() * state.filteredItems.length);
  displayItem(randomIndex);
}

/**
 * Set up event listeners
 */
function setupEventListeners(): void {
  // Navigation buttons
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const randomBtn = document.getElementById('randomBtn');

  if (prevBtn) prevBtn.addEventListener('click', prevItem);
  if (nextBtn) nextBtn.addEventListener('click', nextItem);
  if (randomBtn) randomBtn.addEventListener('click', randomItem);

  // Keyboard navigation
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    // Ignore if typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
        prevItem();
        break;
      case 'ArrowRight':
        nextItem();
        break;
      case 'r':
      case 'R':
        randomItem();
        break;
    }
  });
}

// Start the application
init();
