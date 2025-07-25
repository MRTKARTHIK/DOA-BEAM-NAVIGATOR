import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { BarChart3, Zap, RefreshCw, Download } from "lucide-react";

interface ComparisonData {
  parameter: string;
  value: number;
  musicRmse: number;
  rootMusicRmse: number;
  espritRmse: number;
}

interface ComparisonAnalysisProps {
  onRunComparison: (parameter: string, values: number[]) => Promise<ComparisonData[]>;
}

export const ComparisonAnalysis = ({ onRunComparison }: ComparisonAnalysisProps) => {
  const [activeParameter, setActiveParameter] = useState<string>("snr");
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const parameterConfigs = {
    snr: {
      label: "Signal-to-Noise Ratio",
      unit: "dB",
      values: [0, 5, 10, 15, 20],
      description: "Performance vs noise level"
    },
    snapshots: {
      label: "Number of Snapshots",
      unit: "",
      values: [50, 100, 200, 300, 500],
      description: "Performance vs data length"
    },
    arrayElements: {
      label: "Array Elements",
      unit: "",
      values: [6, 8, 10, 12, 14],
      description: "Performance vs array size"
    },
    sourceSpacing: {
      label: "Source Spacing",
      unit: "degrees",
      values: [5, 10, 15, 20, 25],
      description: "Performance vs angular separation"
    }
  };

  const runComparison = async () => {
    setIsRunning(true);
    try {
      const config = parameterConfigs[activeParameter as keyof typeof parameterConfigs];
      const data = await onRunComparison(activeParameter, config.values);
      setComparisonData(data);
    } catch (error) {
      console.error("Comparison failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const exportData = () => {
    const csv = [
      ['Parameter', 'Value', 'MUSIC RMSE', 'Root-MUSIC RMSE', 'ESPRIT RMSE'],
      ...comparisonData.map(d => [
        activeParameter,
        d.value.toString(),
        d.musicRmse.toFixed(4),
        d.rootMusicRmse.toFixed(4),
        d.espritRmse.toFixed(4)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doa_comparison_${activeParameter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getBestAlgorithm = (dataPoint: ComparisonData) => {
    const rmses = {
      MUSIC: dataPoint.musicRmse,
      'Root-MUSIC': dataPoint.rootMusicRmse,
      ESPRIT: dataPoint.espritRmse
    };
    
    return Object.entries(rmses).reduce((best, [alg, rmse]) => 
      rmse < best.rmse ? { algorithm: alg, rmse } : best
    , { algorithm: 'MUSIC', rmse: dataPoint.musicRmse });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Comparative Performance Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Parameter to Analyze</label>
                <Select value={activeParameter} onValueChange={setActiveParameter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(parameterConfigs).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">
                  {parameterConfigs[activeParameter as keyof typeof parameterConfigs].label}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {parameterConfigs[activeParameter as keyof typeof parameterConfigs].description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {parameterConfigs[activeParameter as keyof typeof parameterConfigs].values.map((value) => (
                    <Badge key={value} variant="outline">
                      {value}{parameterConfigs[activeParameter as keyof typeof parameterConfigs].unit}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                onClick={runComparison}
                disabled={isRunning}
                variant="scientific"
                className="w-full"
                size="lg"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Running Comparison...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Run Comparison Analysis
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {comparisonData.length > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    RMSE vs {parameterConfigs[activeParameter as keyof typeof parameterConfigs].label}
                  </h3>
                  <Button onClick={exportData} variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="value" 
                        label={{ 
                          value: `${parameterConfigs[activeParameter as keyof typeof parameterConfigs].label} (${parameterConfigs[activeParameter as keyof typeof parameterConfigs].unit})`, 
                          position: 'insideBottom', 
                          offset: -5 
                        }} 
                      />
                      <YAxis label={{ value: 'RMSE (degrees)', angle: -90, position: 'insideLeft' }} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="musicRmse" 
                        stroke="hsl(var(--chart-1))" 
                        strokeWidth={2}
                        name="MUSIC"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="rootMusicRmse" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                        name="Root-MUSIC"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="espritRmse" 
                        stroke="hsl(var(--chart-3))" 
                        strokeWidth={2}
                        name="ESPRIT"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {comparisonData.map((dataPoint, index) => {
                    const best = getBestAlgorithm(dataPoint);
                    return (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <div className="font-medium mb-2">
                          {activeParameter}: {dataPoint.value}{parameterConfigs[activeParameter as keyof typeof parameterConfigs].unit}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>MUSIC:</span>
                            <span>{dataPoint.musicRmse.toFixed(3)}°</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Root-MUSIC:</span>
                            <span>{dataPoint.rootMusicRmse.toFixed(3)}°</span>
                          </div>
                          <div className="flex justify-between">
                            <span>ESPRIT:</span>
                            <span>{dataPoint.espritRmse.toFixed(3)}°</span>
                          </div>
                        </div>
                        <Badge variant="default" className="mt-2 bg-success text-xs">
                          Best: {best.algorithm}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Run a comparison analysis to see results here
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {comparisonData.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Performance Insights</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Algorithm Ranking</h4>
                    <div className="space-y-2">
                      {['MUSIC', 'Root-MUSIC', 'ESPRIT'].map((alg, index) => {
                        const avgRmse = comparisonData.reduce((sum, d) => {
                          const rmse = alg === 'MUSIC' ? d.musicRmse : 
                                      alg === 'Root-MUSIC' ? d.rootMusicRmse : d.espritRmse;
                          return sum + rmse;
                        }, 0) / comparisonData.length;
                        
                        return (
                          <div key={alg} className="flex justify-between items-center">
                            <span>{alg}</span>
                            <Badge variant="outline">
                              {avgRmse.toFixed(3)}° avg
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Key Observations</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• MUSIC algorithm typically performs best at high SNR</p>
                      <p>• Root-MUSIC offers computational efficiency</p>
                      <p>• ESPRIT excels with closely spaced sources</p>
                      <p>• Array size significantly impacts resolution</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Performance insights will appear after running analysis
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};