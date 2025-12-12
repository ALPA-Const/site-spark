import { motion } from "framer-motion";
import { ArrowRight, Code, Download, Eye, Palette, RefreshCw, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface GeneratedPreviewProps {
  url: string;
  onReset: () => void;
}

const GeneratedPreview = ({ url, onReset }: GeneratedPreviewProps) => {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  const extractedData = {
    colors: ["#06B6D4", "#8B5CF6", "#0F172A", "#1E293B", "#F8FAFC"],
    fonts: ["Inter", "Space Grotesk"],
    sections: ["Hero", "Features", "Testimonials", "CTA", "Footer"],
  };

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
          We've analyzed and recreated a similar structure. Review, edit, and export.
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
          {/* Colors */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Colors</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {extractedData.colors.map((color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-lg border border-border/50 cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Fonts */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Typography</span>
            </div>
            <div className="space-y-2">
              {extractedData.fonts.map((font, i) => (
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
              <span className="text-sm font-medium">Sections</span>
            </div>
            <div className="space-y-2">
              {extractedData.sections.map((section, i) => (
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
              <Button variant="hero" size="sm">
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
              <div className="bg-[#0f172a] min-h-[500px] p-8">
                {/* Mock Generated Site Preview */}
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Nav */}
                  <div className="flex items-center justify-between">
                    <div className="w-32 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg" />
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-4 bg-slate-700 rounded" />
                      <div className="w-16 h-4 bg-slate-700 rounded" />
                      <div className="w-20 h-8 bg-cyan-500 rounded-lg" />
                    </div>
                  </div>

                  {/* Hero */}
                  <div className="text-center py-16 space-y-4">
                    <div className="w-64 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg mx-auto" />
                    <div className="w-96 h-6 bg-slate-700 rounded mx-auto" />
                    <div className="w-80 h-4 bg-slate-800 rounded mx-auto" />
                    <div className="flex items-center justify-center gap-4 mt-6">
                      <div className="w-32 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg" />
                      <div className="w-32 h-10 border border-slate-600 rounded-lg" />
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-slate-800/50 rounded-xl p-6 space-y-3">
                        <div className="w-12 h-12 bg-cyan-500/20 rounded-lg" />
                        <div className="w-24 h-4 bg-slate-600 rounded" />
                        <div className="w-full h-3 bg-slate-700 rounded" />
                        <div className="w-3/4 h-3 bg-slate-700 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#1e1e1e] min-h-[500px] p-6 font-mono text-sm overflow-auto">
                <pre className="text-slate-300">
                  <code>{`import React from 'react';

const GeneratedPage = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="px-6 py-4 flex justify-between">
        <Logo />
        <NavLinks />
      </nav>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r 
          from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          Your Headline Here
        </h1>
        <p className="mt-4 text-slate-400">
          Supporting description text goes here.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="primary">Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 grid grid-cols-3 gap-6">
        {features.map((feature) => (
          <FeatureCard key={feature.id} {...feature} />
        ))}
      </section>
    </div>
  );
};

export default GeneratedPage;`}</code>
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
