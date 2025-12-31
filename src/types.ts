/**
 * Generic dataset item - represents any row from a HuggingFace dataset
 */
export type DatasetItem = Record<string, unknown>;

/**
 * Metadata field configuration
 */
export interface MetadataField {
  field: string;
  label: string;
  monospace?: boolean;
}

/**
 * Filter field configuration
 */
export interface FilterField {
  field: string;
  label: string;
}

/**
 * Stat configuration
 */
export interface StatConfig {
  label: string;
  type: 'count' | 'unique';
  field?: string;
}

/**
 * Dataset configuration - defines how to display a HuggingFace dataset
 */
export interface DatasetConfig {
  // Dataset identity
  dataset: string;
  name: string;
  description: string;

  // Field mappings
  idField: string;
  contentField: string;

  // Display configuration
  metadataFields: MetadataField[];
  filterFields: FilterField[];
  fileUrlField?: string;
  stats: StatConfig[];
}

/**
 * Application state
 */
export interface AppState {
  config: DatasetConfig | null;
  allItems: DatasetItem[];
  filteredItems: DatasetItem[];
  currentIndex: number;
  filterValues: Map<string, Set<string>>;
  activeFilters: Map<string, string>;
  isLoading: boolean;
  error: string | null;
}

/**
 * HuggingFace API response structure
 */
export interface HuggingFaceResponse {
  features: Array<{
    feature_idx: number;
    name: string;
    type: { dtype: string; _type: string };
  }>;
  rows: Array<{
    row_idx: number;
    row: DatasetItem;
    truncated_cells: string[];
  }>;
  num_rows_total: number;
  num_rows_per_page: number;
  partial: boolean;
}

/**
 * File extension type for icon mapping
 */
export type FileExtension = 'PDF' | 'XLSX' | 'XLS' | 'DOCX' | 'DOC' | 'PPTX' | 'PPT' | 'TXT' | 'CSV' | 'JSON' | 'PNG' | 'JPG' | 'JPEG';
