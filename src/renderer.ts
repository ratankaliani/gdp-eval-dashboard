import { DatasetConfig, DatasetItem, AppState, FileExtension } from './types.js';

/**
 * Render the page header with title and description
 */
export function renderHeader(config: DatasetConfig): void {
  const titleEl = document.getElementById('title');
  const subtitleEl = document.getElementById('subtitle');

  if (titleEl) titleEl.textContent = config.name;
  if (subtitleEl) subtitleEl.textContent = config.description;

  // Update page title
  document.title = config.name;
}

/**
 * Render stats cards based on config
 */
export function renderStats(config: DatasetConfig, items: DatasetItem[]): void {
  const container = document.getElementById('stats-container');
  if (!container) return;

  container.innerHTML = '';

  for (const stat of config.stats) {
    let value: number;

    if (stat.type === 'count') {
      value = items.length;
    } else if (stat.type === 'unique' && stat.field) {
      const uniqueValues = new Set(items.map(item => String(item[stat.field!] || '')));
      value = uniqueValues.size;
    } else {
      continue;
    }

    const card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = `
      <div class="stat-number">${value}</div>
      <div class="stat-label">${stat.label}</div>
    `;
    container.appendChild(card);
  }
}

/**
 * Render filter dropdowns based on config
 */
export function renderFilters(
  config: DatasetConfig,
  items: DatasetItem[],
  onFilterChange: (field: string, value: string) => void
): void {
  const container = document.getElementById('filters-container');
  if (!container) return;

  container.innerHTML = '';

  for (const filter of config.filterFields) {
    // Get unique values for this field
    const values = new Set<string>();
    items.forEach(item => {
      const val = item[filter.field];
      if (val !== null && val !== undefined) {
        values.add(String(val));
      }
    });

    const sortedValues = Array.from(values).sort();

    const group = document.createElement('div');
    group.className = 'filter-group';

    const label = document.createElement('label');
    label.setAttribute('for', `filter-${filter.field}`);
    label.textContent = `Filter by ${filter.label}:`;

    const select = document.createElement('select');
    select.id = `filter-${filter.field}`;
    select.innerHTML = `<option value="">All ${filter.label}s</option>`;

    sortedValues.forEach(val => {
      const option = document.createElement('option');
      option.value = val;
      option.textContent = val;
      select.appendChild(option);
    });

    select.addEventListener('change', () => {
      onFilterChange(filter.field, select.value);
    });

    group.appendChild(label);
    group.appendChild(select);
    container.appendChild(group);
  }

  // Add random button
  const randomBtn = document.createElement('button');
  randomBtn.id = 'randomBtn';
  randomBtn.className = 'btn-secondary';
  randomBtn.textContent = 'Random';
  container.appendChild(randomBtn);
}

/**
 * Render metadata fields for an item
 */
export function renderMetadata(config: DatasetConfig, item: DatasetItem): void {
  const container = document.getElementById('metadata-container');
  if (!container) return;

  container.innerHTML = '';

  for (const field of config.metadataFields) {
    const value = item[field.field];
    if (value === null || value === undefined) continue;

    const metaItem = document.createElement('div');
    metaItem.className = 'meta-item';

    const labelEl = document.createElement('span');
    labelEl.className = 'meta-label';
    labelEl.textContent = field.label + ':';

    const valueEl = document.createElement('span');
    valueEl.className = 'meta-value';
    if (field.monospace) {
      valueEl.classList.add('monospace');
    }
    valueEl.textContent = String(value);

    metaItem.appendChild(labelEl);
    metaItem.appendChild(valueEl);
    container.appendChild(metaItem);
  }
}

/**
 * Render the main content field
 */
export function renderContent(config: DatasetConfig, item: DatasetItem): void {
  const promptEl = document.getElementById('prompt');
  if (!promptEl) return;

  const content = item[config.contentField];
  promptEl.textContent = content !== null && content !== undefined ? String(content) : 'No content';
}

/**
 * Render file attachments
 */
export function renderFiles(config: DatasetConfig, item: DatasetItem): void {
  const section = document.getElementById('referenceFilesSection');
  const container = document.getElementById('fileList');

  if (!section || !container) return;

  if (!config.fileUrlField) {
    section.style.display = 'none';
    return;
  }

  const fileUrls = item[config.fileUrlField];
  if (!fileUrls || !Array.isArray(fileUrls) || fileUrls.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  container.innerHTML = '';

  for (const url of fileUrls) {
    if (typeof url !== 'string') continue;

    const fileName = decodeURIComponent(url.split('/').pop() || 'unknown');
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
    link.rel = 'noopener noreferrer';
    link.textContent = fileName;

    fileItem.appendChild(icon);
    fileItem.appendChild(link);
    container.appendChild(fileItem);
  }
}

/**
 * Get emoji icon for file extension
 */
function getFileIcon(ext: FileExtension | undefined): string {
  if (!ext) return '📎';

  const icons: Record<string, string> = {
    'PDF': '📄',
    'XLSX': '📊',
    'XLS': '📊',
    'DOCX': '📝',
    'DOC': '📝',
    'PPTX': '📽️',
    'PPT': '📽️',
    'TXT': '📃',
    'CSV': '📈',
    'JSON': '📋',
    'PNG': '🖼️',
    'JPG': '🖼️',
    'JPEG': '🖼️',
  };
  return icons[ext] || '📎';
}

/**
 * Update navigation state
 */
export function updateNavigation(state: AppState): void {
  const prevBtn = document.getElementById('prevBtn') as HTMLButtonElement;
  const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement;
  const counter = document.getElementById('taskCounter');

  if (prevBtn) prevBtn.disabled = state.currentIndex === 0;
  if (nextBtn) nextBtn.disabled = state.currentIndex === state.filteredItems.length - 1;

  if (counter) {
    counter.textContent = `Item ${state.currentIndex + 1} of ${state.filteredItems.length}`;
  }
}

/**
 * Show loading state
 */
export function showLoading(message: string = 'Loading...'): void {
  const promptEl = document.getElementById('prompt');
  if (promptEl) {
    promptEl.textContent = message;
  }
}

/**
 * Show error state
 */
export function showError(message: string): void {
  const promptEl = document.getElementById('prompt');
  if (promptEl) {
    promptEl.textContent = `Error: ${message}`;
    promptEl.style.color = '#dc2626';
  }
}
