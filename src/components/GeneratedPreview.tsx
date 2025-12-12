import { motion } from "framer-motion";
import { ArrowRight, Code, Copy, Download, Eye, Palette, RefreshCw, Type, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CrawlResult, GenerateResult, replicaApi } from "@/lib/api/replica";

interface GeneratedPreviewProps {
  crawlData: CrawlResult['data'];
  generatedData: GenerateResult['data'];
  onReset: () => void;
}

const GeneratedPreview = ({ crawlData, generatedData, onReset }: GeneratedPreviewProps) => {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedData.pageCode);
      setCopied(true);
      toast({ title: "Copied!", description: "Code copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: "Error", description: "Failed to copy code", variant: "destructive" });
    }
  };

  const handleExport = () => {
    const projectData = replicaApi.generateExportZip(generatedData);
    const blob = new Blob([projectData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-site-project.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Exported!", description: "Project files downloaded" });
  };

  const extractedColors = crawlData?.extractedDesign?.colors || [];
  const extractedFonts = crawlData?.extractedDesign?.fonts || [];
  const detectedSections = generatedData?.sections || crawlData?.extractedDesign?.sections || [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-4">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium">Analysis Complete</span>
        </div>
        <h2 className="text-3xl font-bold mb-2">Your Website is Ready</h2>
        <p className="text-muted-foreground">
          Analyzed <span className="text-primary">{crawlData?.title}</span> and generated a similar structure.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar - Extracted Data */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-4"
        >
          {/* Original Site Info */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <ExternalLink className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Original Site</span>
            </div>
            <p className="text-xs text-muted-foreground truncate mb-2">{crawlData?.url}</p>
            {crawlData?.screenshot && (
              <img 
                src={crawlData.screenshot} 
                alt="Original site screenshot" 
                className="w-full h-24 object-cover rounded-lg border border-border/50"
              />
            )}
          </div>

          {/* Colors */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Extracted Colors</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {extractedColors.length > 0 ? extractedColors.map((color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-lg border border-border/50 cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              )) : (
                <span className="text-xs text-muted-foreground">No colors detected</span>
              )}
            </div>
          </div>

          {/* Fonts */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Typography</span>
            </div>
            <div className="space-y-2">
              {extractedFonts.map((font, i) => (
                <div key={i} className="text-sm text-muted-foreground px-2 py-1 bg-secondary/50 rounded">
                  {font}
                </div>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Detected Sections</span>
            </div>
            <div className="space-y-2">
              {detectedSections.map((section, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {section}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Preview Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          {/* Tabs */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "preview"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "code"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Code className="w-4 h-4" />
                Code
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onReset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                New URL
              </Button>
              {activeTab === "code" && (
                <Button variant="outline" size="sm" onClick={handleCopyCode}>
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              )}
              <Button variant="hero" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Preview Frame */}
          <div className="glass-strong rounded-2xl overflow-hidden">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-secondary rounded-md px-3 py-1.5 text-xs text-muted-foreground text-center">
                  generated-site.preview
                </div>
              </div>
            </div>

            {/* Preview Content */}
            {activeTab === "preview" ? (
              <div className="bg-background min-h-[500px] p-4 overflow-auto">
                {/* Render a visual representation of the generated structure */}
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Nav mockup */}
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: extractedColors[2] || '#1e293b' }}>
                    <div className="w-32 h-8 rounded-lg" style={{ background: `linear-gradient(135deg, ${extractedColors[0] || '#06b6d4'}, ${extractedColors[1] || '#8b5cf6'})` }} />
                    <div className="flex items-center gap-4">
                      {['Features', 'Pricing', 'About'].map((item) => (
                        <div key={item} className="px-3 py-1 text-xs text-muted-foreground">{item}</div>
                      ))}
                      <div className="px-4 py-2 rounded-lg text-xs" style={{ backgroundColor: extractedColors[0] || '#06b6d4', color: '#0f172a' }}>
                        Get Started
                      </div>
                    </div>
                  </div>

                  {/* Hero mockup */}
                  <div className="text-center py-16 space-y-4 rounded-xl" style={{ backgroundColor: extractedColors[2] || '#0f172a' }}>
                    <div className="w-96 h-12 mx-auto rounded-lg" style={{ background: `linear-gradient(135deg, ${extractedColors[0] || '#06b6d4'}40, ${extractedColors[1] || '#8b5cf6'}40)` }} />
                    <div className="w-[500px] h-6 mx-auto rounded" style={{ backgroundColor: extractedColors[3] || '#334155' }} />
                    <div className="w-80 h-4 mx-auto rounded" style={{ backgroundColor: extractedColors[3] || '#334155', opacity: 0.6 }} />
                    <div className="flex items-center justify-center gap-4 mt-8">
                      <div className="w-32 h-10 rounded-lg" style={{ background: `linear-gradient(135deg, ${extractedColors[0] || '#06b6d4'}, ${extractedColors[1] || '#8b5cf6'})` }} />
                      <div className="w-32 h-10 rounded-lg border" style={{ borderColor: extractedColors[0] || '#06b6d4' }} />
                    </div>
                  </div>

                  {/* Features mockup */}
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-6 rounded-xl space-y-3" style={{ backgroundColor: `${extractedColors[2] || '#1e293b'}80` }}>
                        <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: `${extractedColors[0] || '#06b6d4'}20` }} />
                        <div className="w-24 h-4 rounded" style={{ backgroundColor: extractedColors[3] || '#334155' }} />
                        <div className="w-full h-3 rounded" style={{ backgroundColor: extractedColors[3] || '#334155', opacity: 0.5 }} />
                        <div className="w-3/4 h-3 rounded" style={{ backgroundColor: extractedColors[3] || '#334155', opacity: 0.5 }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#1e1e1e] min-h-[500px] p-6 font-mono text-sm overflow-auto">
                <pre className="text-slate-300 whitespace-pre-wrap">
                  <code>{generatedData?.pageCode || '// No code generated'}</code>
                </pre>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GeneratedPreview;
