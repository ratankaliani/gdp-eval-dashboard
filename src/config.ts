import { DatasetConfig } from './types.js';

const DEFAULT_CONFIGS: Record<string, DatasetConfig> = {
  'openai/gdpval': {
    dataset: 'openai/gdpval',
    name: 'GDP Val Task Explorer',
    description: 'Explore OpenAI\'s GDP Val Benchmark - 220 Professional Tasks',
    idField: 'task_id',
    contentField: 'prompt',
    metadataFields: [
      { field: 'sector', label: 'Sector' },
      { field: 'occupation', label: 'Occupation' },
      { field: 'task_id', label: 'Task ID', monospace: true },
    ],
    filterFields: [
      { field: 'sector', label: 'Sector' },
      { field: 'occupation', label: 'Occupation' },
    ],
    fileUrlField: 'reference_file_urls',
    stats: [
      { label: 'Total Tasks', type: 'count' },
      { field: 'sector', label: 'Sectors', type: 'unique' },
      { field: 'occupation', label: 'Occupations', type: 'unique' },
    ],
  },
};

/**
 * Get URL parameters
 */
function getUrlParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

/**
 * Generate a default config for a dataset based on its first item
 */
export function generateDefaultConfig(datasetId: string, sampleItem: Record<string, unknown>): DatasetConfig {
  const fields = Object.keys(sampleItem);

  // Try to find common field patterns
  const idField = fields.find(f => f.includes('id') || f === 'idx') || fields[0];
  const contentField = fields.find(f =>
    f.includes('prompt') ||
    f.includes('text') ||
    f.includes('question') ||
    f.includes('content') ||
    f.includes('instruction')
  ) || fields[1] || fields[0];

  // Find string fields for filtering (exclude long text fields)
  const stringFields = fields.filter(f => {
    const val = sampleItem[f];
    return typeof val === 'string' && val.length < 200 && f !== contentField;
  });

  // Use first few string fields for metadata and filters
  const metadataFields = stringFields.slice(0, 3).map(f => ({
    field: f,
    label: formatLabel(f),
    monospace: f.includes('id'),
  }));

  const filterFields = stringFields.slice(0, 2).map(f => ({
    field: f,
    label: formatLabel(f),
  }));

  // Try to find file URL field
  const fileUrlField = fields.find(f =>
    f.includes('file') && (f.includes('url') || f.includes('link'))
  );

  // Build stats
  const stats = [
    { label: 'Total Items', type: 'count' as const },
    ...filterFields.map(f => ({
      field: f.field,
      label: f.label,
      type: 'unique' as const,
    })),
  ];

  return {
    dataset: datasetId,
    name: formatLabel(datasetId.split('/').pop() || datasetId),
    description: `Exploring ${datasetId} dataset`,
    idField,
    contentField,
    metadataFields,
    filterFields,
    fileUrlField,
    stats,
  };
}

/**
 * Format a field name into a display label
 */
function formatLabel(field: string): string {
  return field
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Load configuration from URL parameters or config file
 */
export async function loadConfig(): Promise<{ config: DatasetConfig | null; datasetId: string | null }> {
  const params = getUrlParams();

  // Check for config file parameter
  const configName = params.get('config');
  if (configName) {
    try {
      const response = await fetch(`configs/${configName}.json`);
      if (response.ok) {
        const config = await response.json() as DatasetConfig;
        return { config, datasetId: config.dataset };
      }
    } catch (e) {
      console.warn(`Failed to load config file: ${configName}`, e);
    }
  }

  // Check for dataset parameter
  const datasetId = params.get('dataset');
  if (datasetId) {
    // Check if we have a built-in config for this dataset
    if (DEFAULT_CONFIGS[datasetId]) {
      return { config: DEFAULT_CONFIGS[datasetId], datasetId };
    }
    // Return null config - will be auto-generated after fetching data
    return { config: null, datasetId };
  }

  // Default to GDP Val
  return {
    config: DEFAULT_CONFIGS['openai/gdpval'],
    datasetId: 'openai/gdpval'
  };
}
