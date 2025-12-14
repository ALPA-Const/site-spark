import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SSRF protection: validate URL is a public internet address
function isValidPublicUrl(urlString: string): { valid: boolean; error?: string } {
  try {
    const url = new URL(urlString);
    
    // Only allow HTTP/HTTPS protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: 'Only HTTP/HTTPS protocols allowed' };
    }
    
    const hostname = url.hostname.toLowerCase();
    
    // Block localhost variations
    if (['localhost', '127.0.0.1', '::1', '0.0.0.0', '[::1]'].includes(hostname)) {
      return { valid: false, error: 'Localhost access not allowed' };
    }
    
    // Block private IP ranges
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = hostname.match(ipv4Regex);
    if (ipMatch) {
      const octets = ipMatch.slice(1).map(Number);
      
      // Validate octet ranges
      if (octets.some(o => o > 255)) {
        return { valid: false, error: 'Invalid IP address' };
      }
      
      // Check private/reserved ranges
      if (
        octets[0] === 10 || // 10.0.0.0/8
        (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) || // 172.16.0.0/12
        (octets[0] === 192 && octets[1] === 168) || // 192.168.0.0/16
        (octets[0] === 169 && octets[1] === 254) || // Link-local / AWS metadata
        octets[0] === 127 || // Loopback
        octets[0] === 0 || // Current network
        (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127) || // Carrier-grade NAT
        (octets[0] === 198 && octets[1] >= 18 && octets[1] <= 19) // Benchmark testing
      ) {
        return { valid: false, error: 'Private IP addresses not allowed' };
      }
    }
    
    // Block cloud metadata endpoints
    const blockedHosts = [
      'metadata.google.internal',
      'metadata.goog',
      'instance-data',
      'metadata.azure.com',
      'metadata.azure.internal',
      '169.254.169.254',
      'fd00:ec2::254',
    ];
    if (blockedHosts.some(blocked => hostname.includes(blocked))) {
      return { valid: false, error: 'Metadata endpoints not allowed' };
    }
    
    // Block .local, .internal, .localhost TLDs
    if (hostname.endsWith('.local') || hostname.endsWith('.internal') || hostname.endsWith('.localhost')) {
      return { valid: false, error: 'Internal domain names not allowed' };
    }
    
    return { valid: true };
  } catch (e) {
    return { valid: false, error: 'Invalid URL format' };
  }
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

    // Validate URL against SSRF attacks
    const validation = isValidPublicUrl(formattedUrl);
    if (!validation.valid) {
      console.error('URL validation failed:', validation.error);
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
