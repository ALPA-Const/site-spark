import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation types and functions
interface GenerateOptions {
  landingPageOnly?: boolean;
  multiPage?: boolean;
  mobileFirst?: boolean;
  darkMode?: boolean;
}

interface CrawlData {
  url?: string;
  title?: string;
  description?: string;
  markdown?: string;
  extractedDesign?: {
    colors?: string[];
    fonts?: string[];
    sections?: string[];
  };
  screenshot?: string;
}

function validateOptions(options: unknown): GenerateOptions {
  const defaults: GenerateOptions = {
    landingPageOnly: true,
    multiPage: false,
    mobileFirst: true,
    darkMode: false,
  };

  if (!options || typeof options !== 'object') {
    return defaults;
  }

  const validated: GenerateOptions = { ...defaults };
  const opts = options as Record<string, unknown>;

  if ('landingPageOnly' in opts && typeof opts.landingPageOnly === 'boolean') {
    validated.landingPageOnly = opts.landingPageOnly;
  }
  if ('multiPage' in opts && typeof opts.multiPage === 'boolean') {
    validated.multiPage = opts.multiPage;
  }
  if ('mobileFirst' in opts && typeof opts.mobileFirst === 'boolean') {
    validated.mobileFirst = opts.mobileFirst;
  }
  if ('darkMode' in opts && typeof opts.darkMode === 'boolean') {
    validated.darkMode = opts.darkMode;
  }

  return validated;
}

function validateCrawlData(data: unknown): { valid: boolean; error?: string; data?: CrawlData } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Crawl data must be an object' };
  }

  const crawlData = data as Record<string, unknown>;

  // Validate required extractedDesign
  if (!crawlData.extractedDesign || typeof crawlData.extractedDesign !== 'object') {
    return { valid: false, error: 'Missing or invalid extractedDesign' };
  }

  const design = crawlData.extractedDesign as Record<string, unknown>;

  // Validate arrays in extractedDesign
  const colors = Array.isArray(design.colors) 
    ? design.colors.filter((c): c is string => typeof c === 'string').slice(0, 20)
    : [];
  const fonts = Array.isArray(design.fonts)
    ? design.fonts.filter((f): f is string => typeof f === 'string').slice(0, 10)
    : [];
  const sections = Array.isArray(design.sections)
    ? design.sections.filter((s): s is string => typeof s === 'string').slice(0, 20)
    : [];

  // Validate and sanitize string fields
  const title = typeof crawlData.title === 'string' 
    ? crawlData.title.substring(0, 200) 
    : 'Untitled';
  const description = typeof crawlData.description === 'string'
    ? crawlData.description.substring(0, 1000)
    : '';
  const url = typeof crawlData.url === 'string'
    ? crawlData.url.substring(0, 2048)
    : '';
  const markdown = typeof crawlData.markdown === 'string'
    ? crawlData.markdown.substring(0, 50000)
    : '';
  const screenshot = typeof crawlData.screenshot === 'string'
    ? crawlData.screenshot.substring(0, 500000) // Base64 images can be large
    : undefined;

  return {
    valid: true,
    data: {
      url,
      title,
      description,
      markdown,
      screenshot,
      extractedDesign: { colors, fonts, sections },
    },
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    // Parse and validate input
    let rawBody;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { crawlData: rawCrawlData, options: rawOptions } = rawBody;

    // Validate crawl data
    const crawlValidation = validateCrawlData(rawCrawlData);
    if (!crawlValidation.valid || !crawlValidation.data) {
      console.error('Crawl data validation failed:', crawlValidation.error);
      return new Response(
        JSON.stringify({ success: false, error: crawlValidation.error || 'Invalid crawl data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const crawlData = crawlValidation.data;
    const options = validateOptions(rawOptions);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating website from validated crawl data...');
    console.log('Design data:', crawlData.extractedDesign);
    console.log('Validated options:', options);

    const colors = crawlData.extractedDesign?.colors || [];
    const fonts = crawlData.extractedDesign?.fonts || [];
    const sections = crawlData.extractedDesign?.sections || [];
    const markdown = crawlData.markdown?.substring(0, 8000) || '';

    const systemPrompt = `You are an elite frontend architect who generates production-ready React code. You create beautiful, responsive websites inspired by analyzed designs but with ORIGINAL content.

CRITICAL RULES:
1. NEVER copy text verbatim - create semantically similar but original content
2. Use the provided color palette and typography
3. Generate clean, well-structured React/TypeScript code
4. Use Tailwind CSS for styling
5. Make it fully responsive
6. Include smooth animations and transitions
7. Follow accessibility best practices

OUTPUT FORMAT:
Return a valid JSON object with this exact structure:
{
  "pageCode": "// Full React component code here",
  "designTokens": {
    "colors": { "primary": "#...", "secondary": "#...", ... },
    "fonts": { "heading": "...", "body": "..." }
  },
  "sections": ["Hero", "Features", ...]
}`;

    const userPrompt = `Analyze this website content and generate a SIMILAR but ORIGINAL website:

**Original Website Info:**
- Title: ${crawlData.title}
- Description: ${crawlData.description}
- Detected Sections: ${sections.join(', ')}
- Color Palette: ${colors.join(', ')}
- Typography: ${fonts.join(', ')}

**Content Structure (for inspiration only - DO NOT COPY):**
${markdown.substring(0, 4000)}

**Generation Options:**
- Landing Page Only: ${options?.landingPageOnly ?? true}
- Mobile First: ${options?.mobileFirst ?? true}
- Dark Mode: ${options?.darkMode ?? false}

Generate a complete, production-ready React component that is INSPIRED by this design but with:
1. Original headline and copy (similar tone but different words)
2. The same general layout structure
3. The detected color palette (or similar complementary colors)
4. Modern animations using CSS/Tailwind
5. Semantic HTML structure
6. Responsive design

Return ONLY valid JSON with the pageCode, designTokens, and sections fields.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(
          JSON.stringify({ success: false, error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'AI generation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || '';
    
    console.log('AI response received, parsing...');

    // Try to parse JSON from the response
    let generatedData;
    try {
      // Find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Generate fallback
      generatedData = {
        pageCode: generateFallbackCode(crawlData, options),
        designTokens: {
          colors: {
            primary: colors[0] || '#06B6D4',
            secondary: colors[1] || '#8B5CF6',
            background: colors[2] || '#0F172A',
            foreground: '#F8FAFC',
          },
          fonts: {
            heading: fonts[0] || 'Inter',
            body: fonts[1] || fonts[0] || 'Inter',
          },
        },
        sections,
      };
    }

    console.log('Website generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...generatedData,
          originalUrl: crawlData.url,
          originalTitle: crawlData.title,
          screenshot: crawlData.screenshot,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating website:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate website';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateFallbackCode(crawlData: any, options: any): string {
  const { colors, fonts, sections } = crawlData.extractedDesign || {};
  const primaryColor = colors?.[0] || '#06B6D4';
  const secondaryColor = colors?.[1] || '#8B5CF6';
  const fontFamily = fonts?.[0] || 'Inter';
  const darkMode = options?.darkMode ?? false;
  const bgColor = darkMode ? '#0F172A' : '#FFFFFF';
  const textColor = darkMode ? '#F8FAFC' : '#0F172A';

  return `import React from 'react';

const GeneratedPage = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '${bgColor}', 
      color: '${textColor}',
      fontFamily: '${fontFamily}, sans-serif' 
    }}>
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-opacity-10">
        <div className="text-2xl font-bold" style={{ color: '${primaryColor}' }}>Brand</div>
        <div className="flex gap-6">
          <a href="#" className="hover:opacity-80">Features</a>
          <a href="#" className="hover:opacity-80">Pricing</a>
          <a href="#" className="hover:opacity-80">About</a>
          <button 
            className="px-4 py-2 rounded-lg font-medium"
            style={{ backgroundColor: '${primaryColor}', color: '${darkMode ? '#0F172A' : '#FFFFFF'}' }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Build Something
          <span style={{ 
            background: 'linear-gradient(135deg, ${primaryColor}, ${secondaryColor})',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}> Amazing</span>
        </h1>
        <p className="text-xl opacity-70 max-w-2xl mx-auto mb-8">
          Create beautiful, modern websites with our intuitive platform. 
          No coding required, just pure creativity.
        </p>
        <div className="flex gap-4 justify-center">
          <button 
            className="px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            style={{ 
              background: 'linear-gradient(135deg, ${primaryColor}, ${secondaryColor})',
              color: '${darkMode ? '#0F172A' : '#FFFFFF'}'
            }}
          >
            Start Free Trial
          </button>
          <button 
            className="px-8 py-4 rounded-xl text-lg font-semibold border-2 hover:bg-opacity-10 transition-all"
            style={{ borderColor: '${primaryColor}', color: '${primaryColor}' }}
          >
            Learn More
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Lightning Fast', desc: 'Optimized for speed and performance' },
              { title: 'Fully Responsive', desc: 'Looks great on any device' },
              { title: 'Easy to Use', desc: 'Intuitive drag and drop interface' },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="p-8 rounded-2xl border border-opacity-20 hover:border-opacity-40 transition-all"
                style={{ borderColor: '${primaryColor}' }}
              >
                <div 
                  className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
                  style={{ backgroundColor: '${primaryColor}20' }}
                >
                  <span style={{ color: '${primaryColor}' }}>✦</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="opacity-70">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div 
          className="max-w-4xl mx-auto rounded-3xl p-12 text-center"
          style={{ 
            background: 'linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)',
            border: '1px solid ${primaryColor}30'
          }}
        >
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl opacity-70 mb-8">Join thousands of creators building amazing websites.</p>
          <button 
            className="px-8 py-4 rounded-xl text-lg font-semibold shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, ${primaryColor}, ${secondaryColor})',
              color: '${darkMode ? '#0F172A' : '#FFFFFF'}'
            }}
          >
            Get Started Free →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-opacity-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-xl font-bold" style={{ color: '${primaryColor}' }}>Brand</div>
          <p className="opacity-50">© 2024 Brand. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default GeneratedPage;`;
}
