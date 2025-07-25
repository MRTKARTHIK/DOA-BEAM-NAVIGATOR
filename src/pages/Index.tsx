import { useState } from "react";
import { DoaHeader } from "@/components/DoaHeader";
import { ParameterPanel, DoaParameters } from "@/components/ParameterPanel";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { ComparisonAnalysis } from "@/components/ComparisonAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { runDoaEstimation, runComparisonAnalysis, DoaResult } from "@/lib/doaAlgorithms";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [parameters, setParameters] = useState<DoaParameters>({
    snapshots: 200,
    arrayElements: 10,
    snr: 10,
    sourceAngles: [20, 40, 60],
    carrierFreq: 1,
    arraySpacing: 0.5,
  });

  const [results, setResults] = useState<DoaResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const handleParameterChange = (newParams: DoaParameters) => {
    setParameters(newParams);
  };

  const handleRunSimulation = async () => {
    setIsRunning(true);
    try {
      toast({
        title: "Simulation Started",
        description: "Running DOA estimation algorithms...",
      });

      const simulationResults = await runDoaEstimation(parameters);
      setResults(simulationResults);

      toast({
        title: "Simulation Complete",
        description: `Successfully estimated DOAs using ${simulationResults.length} algorithms.`,
      });
    } catch (error) {
      console.error("Simulation failed:", error);
      toast({
        title: "Simulation Failed",
        description: "An error occurred during DOA estimation.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunComparison = async (parameter: string, values: number[]) => {
    try {
      toast({
        title: "Comparison Analysis Started",
        description: `Analyzing performance vs ${parameter}...`,
      });

      const comparisonResults = await runComparisonAnalysis(parameter, values, parameters);
      
      toast({
        title: "Comparison Complete",
        description: `Analysis complete for ${values.length} parameter values.`,
      });

      return comparisonResults;
    } catch (error) {
      console.error("Comparison failed:", error);
      toast({
        title: "Comparison Failed",
        description: "An error occurred during comparison analysis.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-muted/10 to-background/80 backdrop-blur-sm"></div>
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <DoaHeader />
        
        <Tabs defaultValue="estimation" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="estimation">DOA Estimation</TabsTrigger>
            <TabsTrigger value="comparison">Performance Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="estimation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Parameter Panel */}
              <div className="lg:col-span-1">
                <ParameterPanel
                  onParameterChange={handleParameterChange}
                  onRunSimulation={handleRunSimulation}
                  isRunning={isRunning}
                />
              </div>

              {/* Results Display */}
              <div className="lg:col-span-2">
                <ResultsDisplay
                  results={results}
                  trueAngles={parameters.sourceAngles}
                  isLoading={isRunning}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <ComparisonAnalysis onRunComparison={handleRunComparison} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;