import { DatasetItem, HuggingFaceResponse } from './types.js';

const API_BASE = 'https://datasets-server.huggingface.co';
const ROWS_PER_REQUEST = 100;

/**
 * Fetch all rows from a HuggingFace dataset
 */
export async function fetchDataset(
  datasetId: string,
  onProgress?: (loaded: number, total: number) => void
): Promise<DatasetItem[]> {
  const allItems: DatasetItem[] = [];
  let offset = 0;
  let totalRows = 0;

  // First request to get total count
  const firstBatch = await fetchBatch(datasetId, offset);
  totalRows = firstBatch.num_rows_total;
  allItems.push(...firstBatch.rows.map(r => r.row));
  offset += firstBatch.rows.length;

  if (onProgress) {
    onProgress(allItems.length, totalRows);
  }

  // Fetch remaining batches
  while (offset < totalRows) {
    const batch = await fetchBatch(datasetId, offset);
    allItems.push(...batch.rows.map(r => r.row));
    offset += batch.rows.length;

    if (onProgress) {
      onProgress(allItems.length, totalRows);
    }
  }

  return allItems;
}

/**
 * Fetch a single batch of rows
 */
async function fetchBatch(
  datasetId: string,
  offset: number,
  config: string = 'default',
  split: string = 'train'
): Promise<HuggingFaceResponse> {
  const url = new URL(`${API_BASE}/rows`);
  url.searchParams.set('dataset', datasetId);
  url.searchParams.set('config', config);
  url.searchParams.set('split', split);
  url.searchParams.set('offset', offset.toString());
  url.searchParams.set('length', ROWS_PER_REQUEST.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch dataset: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Fetch dataset info (schema, splits, etc.)
 */
export async function fetchDatasetInfo(datasetId: string): Promise<{
  splits: string[];
  features: Record<string, { dtype: string }>;
}> {
  const url = new URL(`${API_BASE}/info`);
  url.searchParams.set('dataset', datasetId);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Failed to fetch dataset info: ${response.status}`);
  }

  const data = await response.json();

  // Extract splits and features from the response
  const defaultConfig = data.dataset_info?.default || Object.values(data.dataset_info || {})[0];

  return {
    splits: Object.keys(defaultConfig?.splits || { train: {} }),
    features: defaultConfig?.features || {},
  };
}

/**
 * Get a sample item from the dataset (first row)
 */
export async function fetchSampleItem(datasetId: string): Promise<DatasetItem | null> {
  try {
    const batch = await fetchBatch(datasetId, 0);
    return batch.rows[0]?.row || null;
  } catch {
    return null;
  }
}
