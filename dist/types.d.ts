/**
 * Represents a single task in the GDP Val dataset
 */
export interface GDPTask {
    task_id: string;
    sector: string;
    occupation: string;
    prompt: string;
    reference_files: string[];
    reference_file_urls: string[];
    reference_file_hf_uris: string[];
}
/**
 * The complete GDP Val dataset structure
 */
export interface GDPValDataset {
    total: number;
    tasks: GDPTask[];
}
/**
 * File type icons mapping
 */
export type FileExtension = 'PDF' | 'XLSX' | 'XLS' | 'DOCX' | 'DOC' | 'PPTX' | 'PPT' | 'TXT' | 'CSV';
/**
 * Application state interface
 */
export interface AppState {
    allTasks: GDPTask[];
    filteredTasks: GDPTask[];
    currentIndex: number;
    sectors: Set<string>;
    occupations: Set<string>;
}
//# sourceMappingURL=types.d.ts.map