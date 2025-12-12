import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      console.error('No URL provided');
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Crawling URL:', formattedUrl);

    // Scrape the website with multiple formats
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown', 'html', 'links', 'screenshot'],
        onlyMainContent: false,
        waitFor: 3000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Crawl successful, extracting design data...');

    // Extract design-related information from HTML
    const htmlContent = data.data?.html || '';
    const metadata = data.data?.metadata || {};
    
    // Extract colors from inline styles and CSS
    const colorPatterns = [
      /#[0-9A-Fa-f]{6}\b/g,
      /#[0-9A-Fa-f]{3}\b/g,
      /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi,
      /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/gi,
    ];
    
    const colorsSet = new Set<string>();
    colorPatterns.forEach(pattern => {
      const matches = htmlContent.match(pattern) || [];
      matches.forEach((color: string) => colorsSet.add(color.toLowerCase()));
    });
    
    // Extract font families
    const fontPattern = /font-family:\s*([^;"}]+)/gi;
    const fontsSet = new Set<string>();
    let fontMatch;
    while ((fontMatch = fontPattern.exec(htmlContent)) !== null) {
      const fontFamily = fontMatch[1].split(',')[0].trim().replace(/['"]/g, '');
      if (fontFamily && fontFamily.length < 50) {
        fontsSet.add(fontFamily);
      }
    }

    // Detect sections based on common patterns
    const sections: string[] = [];
    const sectionPatterns = [
      { pattern: /<nav|<header/gi, name: 'Navigation' },
      { pattern: /hero|banner|jumbotron/gi, name: 'Hero' },
      { pattern: /feature|benefit/gi, name: 'Features' },
      { pattern: /testimonial|review|quote/gi, name: 'Testimonials' },
      { pattern: /pricing|plan/gi, name: 'Pricing' },
      { pattern: /faq|question/gi, name: 'FAQ' },
      { pattern: /cta|call-to-action|signup/gi, name: 'CTA' },
      { pattern: /<footer/gi, name: 'Footer' },
      { pattern: /about|team/gi, name: 'About' },
      { pattern: /contact/gi, name: 'Contact' },
      { pattern: /gallery|portfolio/gi, name: 'Gallery' },
    ];

    sectionPatterns.forEach(({ pattern, name }) => {
      if (pattern.test(htmlContent) && !sections.includes(name)) {
        sections.push(name);
      }
    });

    // Take top colors (max 8)
    const colors = Array.from(colorsSet).slice(0, 8);
    const fonts = Array.from(fontsSet).slice(0, 4);

    const result = {
      success: true,
      data: {
        url: formattedUrl,
        title: metadata.title || 'Untitled',
        description: metadata.description || '',
        markdown: data.data?.markdown || '',
        html: htmlContent.substring(0, 50000), // Limit HTML size
        screenshot: data.data?.screenshot || null,
        links: (data.data?.links || []).slice(0, 20),
        extractedDesign: {
          colors,
          fonts: fonts.length > 0 ? fonts : ['Inter', 'System UI'],
          sections: sections.length > 0 ? sections : ['Hero', 'Features', 'CTA', 'Footer'],
        },
        metadata,
      },
    };

    console.log('Extracted design:', result.data.extractedDesign);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error crawling website:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to crawl website';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
