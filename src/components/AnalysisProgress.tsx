import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface AnalysisProgressProps {
  url: string;
  currentStep: number;
}

const analysisSteps = [
  { id: 1, label: "Crawling website", phase: "crawl" },
  { id: 2, label: "Analyzing DOM structure", phase: "crawl" },
  { id: 3, label: "Extracting design tokens", phase: "crawl" },
  { id: 4, label: "Detecting components", phase: "generate" },
  { id: 5, label: "AI interpretation", phase: "generate" },
  { id: 6, label: "Generating code", phase: "generate" },
];

const AnalysisProgress = ({ url, currentStep }: AnalysisProgressProps) => {
  return (
    <div className="max-w-lg mx-auto">
      <div className="glass-strong rounded-2xl p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4 animate-pulse-glow">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {currentStep <= 3 ? "Crawling & Analyzing" : "Generating Website"}
          </h3>
          <p className="text-sm text-muted-foreground truncate max-w-xs mx-auto">{url}</p>
        </div>

        <div className="space-y-3">
          {analysisSteps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id || 
              (currentStep >= step.id && currentStep < step.id + 1);
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                  isActive ? "bg-primary/10 border border-primary/20" : 
                  isCompleted ? "bg-secondary/50" : "opacity-50"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted 
                    ? "bg-primary text-primary-foreground" 
                    : isActive 
                      ? "bg-primary/20 border-2 border-primary" 
                      : "bg-muted"
                }`}>
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : isActive ? (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  ) : (
                    <span className="text-xs text-muted-foreground">{step.id}</span>
                  )}
                </div>
                <span className={`text-sm ${isCompleted || isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.label}
                </span>
                {isActive && (
                  <Loader2 className="w-4 h-4 text-primary animate-spin ml-auto" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalysisProgress;
