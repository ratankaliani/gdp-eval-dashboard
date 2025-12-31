# GDP Val Task Visualization Website

An interactive TypeScript web application to explore and visualize the OpenAI GDP Val benchmark dataset.

## About GDP Val

GDP Val is a dataset of 220 realistic, professional work scenarios from OpenAI. It contains complex document analysis, data processing, and report generation tasks designed to evaluate AI systems' ability to handle multi-step professional tasks.

## Features

- **Browse all 220 tasks** from the GDP Val dataset
- **Filter by sector** (9 different sectors) and **occupation** (44 different occupations)
- **Navigate** between tasks using Previous/Next buttons or arrow keys
- **Random task** selection for exploration
- **View task details** including:
  - Sector and occupation classification
  - Full task prompt with detailed requirements
  - Links to all reference files (PDFs, Excel, Word documents, etc.)
- **Responsive design** that works on desktop and mobile
- **Dark theme** for comfortable viewing
- **Type-safe** TypeScript implementation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build
```

### Running Locally

Due to ES modules and CORS, you need to serve the files with a local server:

```bash
# Using Python
python3 -m http.server 8000

# Or using npx
npx serve .
```

Then open http://localhost:8000 in your browser.

### Development

```bash
# Watch mode for TypeScript compilation
npm run watch
```

## Navigation

- **Previous/Next buttons**: Navigate through tasks sequentially
- **Arrow keys**: Use ← and → to move between tasks
- **Random button**: Jump to a random task (or press 'R')
- **Filters**: Select a specific sector or occupation to narrow down tasks
- **Task counter**: Shows your current position in the dataset

### Reference Files

Each task may include reference files (spreadsheets, PDFs, documents). Click on any file link to download it from HuggingFace.

## Dataset Information

- **Total Tasks**: 220
- **Sectors**: 9 professional sectors
- **Occupations**: 44 different job roles
- **Task Complexity**: Moderate to high
- **Output Formats**: PDF, Excel, Word, PowerPoint, email

## Project Structure

```
gdp-val-website/
├── src/
│   ├── app.ts          # Main application logic
│   └── types.ts        # TypeScript type definitions
├── dist/               # Compiled JavaScript (generated)
├── index.html          # Main HTML file
├── style.css           # Styling
├── gdpval_data.json    # GDP Val dataset (220 tasks)
├── tsconfig.json       # TypeScript configuration
├── package.json        # npm configuration
└── README.md
```

## Type Definitions

The project includes full TypeScript type definitions for the GDP Val dataset:

```typescript
interface GDPTask {
  task_id: string;
  sector: string;
  occupation: string;
  prompt: string;
  reference_files: string[];
  reference_file_urls: string[];
  reference_file_hf_uris: string[];
}
```

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch mode for development
- `npm run clean` - Remove compiled files

## Dataset Source

Data from [OpenAI GDP Val Dataset](https://huggingface.co/datasets/openai/gdpval) on HuggingFace.

## License

The GDP Val dataset is provided by OpenAI. Please refer to the [HuggingFace dataset page](https://huggingface.co/datasets/openai/gdpval) for licensing information.
