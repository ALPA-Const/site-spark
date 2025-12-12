import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface AnalysisProgressProps {
  url: string;
}

const analysisSteps = [
  { id: "crawl", label: "Crawling website", duration: 800 },
  { id: "dom", label: "Analyzing DOM structure", duration: 600 },
  { id: "css", label: "Extracting CSS tokens", duration: 700 },
  { id: "layout", label: "Detecting layout patterns", duration: 500 },
  { id: "components", label: "Identifying components", duration: 600 },
  { id: "generate", label: "Generating new site", duration: 800 },
];

const AnalysisProgress = ({ url }: AnalysisProgressProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    let totalDelay = 0;
    
    analysisSteps.forEach((step, index) => {
      totalDelay += step.duration;
      
      setTimeout(() => {
        setCurrentStep(index + 1);
        setCompletedSteps(prev => [...prev, step.id]);
      }, totalDelay);
    });
  }, []);

  return (
    <div className="max-w-lg mx-auto">
      <div className="glass-strong rounded-2xl p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4 animate-pulse-glow">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Analyzing Website</h3>
          <p className="text-sm text-muted-foreground truncate max-w-xs mx-auto">{url}</p>
        </div>

        <div className="space-y-3">
          {analysisSteps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isActive = currentStep === index;
            
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
                    <span className="text-xs text-muted-foreground">{index + 1}</span>
                  )}
                </div>
                <span className={`text-sm ${isCompleted || isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalysisProgress;
