# HuggingFace Dataset Explorer

A configurable TypeScript web application to explore and visualize any HuggingFace dataset with a clean, OpenAI-inspired interface.

## Inspiration

This project was inspired by ["Are you smarter than an LLM?"](https://d.erenrich.net/are-you-smarter-than-an-llm/index.html) - an interactive way to explore AI benchmark questions.

## Motivation

While building a visualizer for the [OpenAI GDP Val benchmark](https://huggingface.co/datasets/openai/gdpval), I realized that the ability to nicely visualize HuggingFace datasets is a blocker towards quick understanding of evals. The default HuggingFace dataset viewer shows raw tables - useful for data scientists, but not for quickly grasping what an eval actually tests.

This tool provides a **task-focused exploration experience** where you can:
- View one example at a time with full context
- Filter by dataset-specific dimensions
- Navigate with keyboard shortcuts
- Access reference files directly

## Features

- **Browse any HuggingFace dataset** with live API fetching
- **Configuration-driven** - define which fields to display, filter, and highlight
- **Filter by any field** in the dataset
- **Navigate** between items using Previous/Next buttons or arrow keys
- **Random item** selection for exploration (press 'R')
- **Reference file links** when datasets include attachments
- **Responsive design** with clean, minimalist styling
- **Type-safe** TypeScript implementation

## Quick Start

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Serve locally
npx serve .

# Open in browser with a dataset
# http://localhost:3000?dataset=openai/gdpval
```

## Usage

### Basic: URL Parameter

The simplest way to explore a dataset is via URL parameter:

```
http://localhost:3000?dataset=openai/gdpval
```

The explorer will auto-detect fields and create a basic view.

### Advanced: Custom Config

For better control, create a config file in `configs/`:

```json
{
  "dataset": "openai/gdpval",
  "name": "GDP Val Task Explorer",
  "description": "Explore OpenAI's GDP Val Benchmark - 220 Professional Tasks",
  "idField": "task_id",
  "contentField": "prompt",
  "metadataFields": [
    { "field": "sector", "label": "Sector" },
    { "field": "occupation", "label": "Occupation" },
    { "field": "task_id", "label": "Task ID", "monospace": true }
  ],
  "filterFields": [
    { "field": "sector", "label": "Sector" },
    { "field": "occupation", "label": "Occupation" }
  ],
  "fileUrlField": "reference_file_urls",
  "stats": [
    { "label": "Total Items", "type": "count" },
    { "field": "sector", "label": "Sectors", "type": "unique" },
    { "field": "occupation", "label": "Occupations", "type": "unique" }
  ]
}
```

Then load it:
```
http://localhost:3000?config=gdpval
```

## Navigation

- **Previous/Next buttons**: Navigate through items sequentially
- **Arrow keys**: Use left/right arrows to move between items
- **Random button**: Jump to a random item (or press 'R')
- **Filters**: Select values to narrow down the dataset
- **Counter**: Shows your current position

## Project Structure

```
dataset-explorer/
├── src/
│   ├── app.ts            # Main orchestration
│   ├── types.ts          # TypeScript interfaces
│   ├── config.ts         # Configuration loading
│   ├── data-loader.ts    # HuggingFace API integration
│   └── renderer.ts       # Dynamic UI rendering
├── configs/
│   └── gdpval.json       # Example: GDP Val config
├── dist/                 # Compiled JavaScript
├── index.html            # HTML template
├── style.css             # OpenAI-inspired styling
├── tsconfig.json
└── package.json
```

## Configuration Schema

```typescript
interface DatasetConfig {
  dataset: string;           // HuggingFace dataset ID
  name: string;              // Display title
  description: string;       // Subtitle
  idField: string;           // Unique identifier field
  contentField: string;      // Main content to display
  metadataFields: Array<{    // Fields shown as metadata
    field: string;
    label: string;
    monospace?: boolean;
  }>;
  filterFields: Array<{      // Filterable dimensions
    field: string;
    label: string;
  }>;
  fileUrlField?: string;     // Field containing file URLs
  stats: Array<{             // Statistics to compute
    label: string;
    type: "count" | "unique";
    field?: string;
  }>;
}
```

## Scripts

- `npm run build` - Compile TypeScript
- `npm run watch` - Watch mode for development
- `npm run clean` - Remove compiled files

## Supported Datasets

Any public HuggingFace dataset works. Examples:
- `openai/gdpval` - Professional task benchmark
- `tatsu-lab/alpaca` - Instruction following
- `gsm8k` - Math reasoning
- `squad` - Reading comprehension

## License

MIT. Dataset licensing varies - check individual HuggingFace dataset pages.
