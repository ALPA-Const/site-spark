import { motion } from "framer-motion";
import { Globe, Zap, Code, Palette, ArrowRight, Sparkles, Layers, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import AnalysisProgress from "@/components/AnalysisProgress";
import FeatureCard from "@/components/FeatureCard";
import GeneratedPreview from "@/components/GeneratedPreview";

const Index = () => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    
    // Simulate analysis process
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 4000);
  };

  const handleReset = () => {
    setUrl("");
    setIsAnalyzing(false);
    setAnalysisComplete(false);
  };

  const features = [
    {
      icon: Globe,
      title: "Smart Crawling",
      description: "Intelligent DOM analysis extracts layout, typography, and color systems automatically.",
    },
    {
      icon: Palette,
      title: "Design Extraction",
      description: "AI-powered extraction of design tokens, component patterns, and visual hierarchy.",
    },
    {
      icon: Layers,
      title: "Component Detection",
      description: "Identifies heroes, CTAs, feature grids, testimonials, and more section types.",
    },
    {
      icon: Code,
      title: "Clean Code Output",
      description: "Generates production-ready React/Next.js with Tailwind CSS architecture.",
    },
    {
      icon: Sparkles,
      title: "AI Interpretation",
      description: "LLM transforms raw data into semantic components with placeholder content.",
    },
    {
      icon: Download,
      title: "Instant Export",
      description: "Download complete project files ready for deployment or further customization.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ReplicaGen</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Button variant="ghost" size="sm">How it Works</Button>
            <Button variant="ghost" size="sm">Pricing</Button>
            <Button variant="outline" size="sm">Sign In</Button>
          </motion.div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="px-6 pt-20 pb-32">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">AI-Powered Website Replication</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Paste a URL.
                <br />
                <span className="text-gradient">Get a Similar Website.</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                Analyze any website's design, extract its patterns, and generate a structurally similar, 
                production-ready site in seconds. No copying—just intelligent replication.
              </p>
            </motion.div>

            {/* URL Input Form */}
            {!analysisComplete && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                onSubmit={handleSubmit}
                className="max-w-2xl mx-auto"
              >
                <div className="relative">
                  <div className="glass-strong rounded-2xl p-2 flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="pl-12 h-14 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
                        disabled={isAnalyzing}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      size="xl" 
                      variant="hero"
                      disabled={!url || isAnalyzing}
                      className="shrink-0"
                    >
                      {isAnalyzing ? (
                        <>Analyzing...</>
                      ) : (
                        <>
                          Generate <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Options */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                  {["Landing Page Only", "Multi-page", "Mobile-first", "Dark Mode"].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-border bg-input accent-primary" />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{option}</span>
                    </label>
                  ))}
                </div>
              </motion.form>
            )}

            {/* Analysis Progress */}
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-12"
              >
                <AnalysisProgress url={url} />
              </motion.div>
            )}

            {/* Generated Preview */}
            {analysisComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <GeneratedPreview url={url} onReset={handleReset} />
              </motion.div>
            )}
          </div>
        </section>

        {/* Features Section */}
        {!isAnalyzing && !analysisComplete && (
          <section className="px-6 py-24 border-t border-border/50">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold mb-4">How It Works</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Our AI engine crawls, analyzes, and reconstructs websites with intelligent abstraction—
                  never copying, always creating.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <FeatureCard {...feature} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        {!isAnalyzing && !analysisComplete && (
          <section className="px-6 py-24">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass-strong rounded-3xl p-12 text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
                <div className="relative z-10">
                  <h2 className="text-4xl font-bold mb-4">Ready to replicate?</h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                    Transform any website into your own custom-built foundation. 
                    Start creating in seconds.
                  </p>
                  <Button variant="hero" size="xl">
                    Try It Free <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">ReplicaGen</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 ReplicaGen. Inspired by, not copied from.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
