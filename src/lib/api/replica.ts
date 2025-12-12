import { supabase } from '@/integrations/supabase/client';

export interface CrawlResult {
  success: boolean;
  error?: string;
  data?: {
    url: string;
    title: string;
    description: string;
    markdown: string;
    html: string;
    screenshot: string | null;
    links: string[];
    extractedDesign: {
      colors: string[];
      fonts: string[];
      sections: string[];
    };
    metadata: Record<string, any>;
  };
}

export interface GenerateOptions {
  landingPageOnly?: boolean;
  multiPage?: boolean;
  mobileFirst?: boolean;
  darkMode?: boolean;
}

export interface GenerateResult {
  success: boolean;
  error?: string;
  data?: {
    pageCode: string;
    designTokens: {
      colors: Record<string, string>;
      fonts: Record<string, string>;
    };
    sections: string[];
    originalUrl: string;
    originalTitle: string;
    screenshot: string | null;
  };
}

export const replicaApi = {
  async crawlWebsite(url: string): Promise<CrawlResult> {
    console.log('Crawling website:', url);
    
    const { data, error } = await supabase.functions.invoke('crawl-website', {
      body: { url },
    });

    if (error) {
      console.error('Crawl error:', error);
      return { success: false, error: error.message };
    }

    return data;
  },

  async generateWebsite(crawlData: CrawlResult['data'], options: GenerateOptions): Promise<GenerateResult> {
    console.log('Generating website with options:', options);
    
    const { data, error } = await supabase.functions.invoke('generate-website', {
      body: { crawlData, options },
    });

    if (error) {
      console.error('Generate error:', error);
      return { success: false, error: error.message };
    }

    return data;
  },

  generateExportZip(generatedData: GenerateResult['data']): string {
    // Create a downloadable React project structure
    const projectFiles = {
      'package.json': JSON.stringify({
        name: 'generated-site',
        version: '1.0.0',
        private: true,
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
        },
        dependencies: {
          react: '^18.3.1',
          'react-dom': '^18.3.1',
        },
        devDependencies: {
          '@vitejs/plugin-react': '^4.0.0',
          autoprefixer: '^10.4.14',
          postcss: '^8.4.24',
          tailwindcss: '^3.3.2',
          vite: '^4.4.0',
        },
      }, null, 2),
      'src/App.tsx': generatedData?.pageCode || '// Generated code will appear here',
      'tailwind.config.js': `module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: ${JSON.stringify(generatedData?.designTokens?.colors || {}, null, 8)},
      fontFamily: ${JSON.stringify(generatedData?.designTokens?.fonts || {}, null, 8)},
    },
  },
  plugins: [],
}`,
      'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Generated Site</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
      'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
      'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;`,
    };

    // Return as formatted string for display (in real app, would use JSZip)
    return JSON.stringify(projectFiles, null, 2);
  },
};
