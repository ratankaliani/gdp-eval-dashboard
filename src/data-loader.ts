import { DatasetItem, HuggingFaceResponse } from './types.js';

const API_BASE = 'https://datasets-server.huggingface.co';
const ROWS_PER_REQUEST = 100;

interface DatasetInfo {
  config: string;
  split: string;
}

/**
 * Get the best config and split for a dataset
 */
async function getDatasetInfo(datasetId: string): Promise<DatasetInfo> {
  const url = new URL(`${API_BASE}/info`);
  url.searchParams.set('dataset', datasetId);

  const response = await fetch(url.toString());

  if (!response.ok) {
    // Fallback to defaults
    return { config: 'default', split: 'train' };
  }

  const data = await response.json();
  const configs = Object.keys(data.dataset_info || {});

  // Prefer 'default', then 'all', then first available
  let config = 'default';
  if (configs.includes('default')) {
    config = 'default';
  } else if (configs.includes('all')) {
    config = 'all';
  } else if (configs.length > 0) {
    config = configs[0];
  }

  // Get splits for the chosen config
  const configInfo = data.dataset_info?.[config];
  const splits = Object.keys(configInfo?.splits || {});

  // Prefer 'train', then 'test', then 'validation', then first available
  let split = 'train';
  if (splits.includes('train')) {
    split = 'train';
  } else if (splits.includes('test')) {
    split = 'test';
  } else if (splits.includes('validation')) {
    split = 'validation';
  } else if (splits.length > 0) {
    split = splits[0];
  }

  return { config, split };
}

/**
 * Fetch all rows from a HuggingFace dataset
 */
export async function fetchDataset(
  datasetId: string,
  onProgress?: (loaded: number, total: number) => void
): Promise<DatasetItem[]> {
  // First, determine the best config and split
  const { config, split } = await getDatasetInfo(datasetId);

  const allItems: DatasetItem[] = [];
  let offset = 0;
  let totalRows = 0;

  // First request to get total count
  const firstBatch = await fetchBatch(datasetId, offset, config, split);
  totalRows = firstBatch.num_rows_total;
  allItems.push(...firstBatch.rows.map(r => r.row));
  offset += firstBatch.rows.length;

  if (onProgress) {
    onProgress(allItems.length, totalRows);
  }

  // Fetch remaining batches
  while (offset < totalRows) {
    const batch = await fetchBatch(datasetId, offset, config, split);
    allItems.push(...batch.rows.map(r => r.row));
    offset += batch.rows.length;

    if (onProgress) {
      onProgress(allItems.length, totalRows);
    }
  }

  return allItems;
}

/**
 * Fetch a single batch of rows with retry logic
 */
async function fetchBatch(
  datasetId: string,
  offset: number,
  config: string,
  split: string,
  retries: number = 3
): Promise<HuggingFaceResponse> {
  const url = new URL(`${API_BASE}/rows`);
  url.searchParams.set('dataset', datasetId);
  url.searchParams.set('config', config);
  url.searchParams.set('split', split);
  url.searchParams.set('offset', offset.toString());
  url.searchParams.set('length', ROWS_PER_REQUEST.toString());

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        if (response.status === 429 && attempt < retries - 1) {
          // Rate limited - wait and retry
          await sleep(1000 * (attempt + 1));
          continue;
        }
        const errorText = await response.text();
        throw new Error(`Failed to fetch dataset: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (attempt < retries - 1) {
        await sleep(500 * (attempt + 1));
        continue;
      }
      throw error;
    }
  }

  throw new Error('Failed to fetch after retries');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get a sample item from the dataset (first row)
 */
export async function fetchSampleItem(datasetId: string): Promise<DatasetItem | null> {
  try {
    const { config, split } = await getDatasetInfo(datasetId);
    const batch = await fetchBatch(datasetId, 0, config, split);
    return batch.rows[0]?.row || null;
  } catch {
    return null;
  }
}
