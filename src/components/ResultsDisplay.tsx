import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, BarChart, Bar, ScatterChart, Scatter, ReferenceLine } from "recharts";
import { Target, TrendingUp, Award, AlertCircle } from "lucide-react";
import { AnalysisGraphs } from "@/components/AnalysisGraphs";

interface DoaResult {
  algorithm: string;
  estimatedAngles: number[];
  rmse: number;
  executionTime: number;
  spectrum?: { angle: number; power: number }[];
}

interface ResultsDisplayProps {
  results: DoaResult[];
  trueAngles: number[];
  isLoading: boolean;
  comparisonData?: any[];
  activeParameter?: string;
}

export const ResultsDisplay = ({ results, trueAngles, isLoading, comparisonData = [], activeParameter = "" }: ResultsDisplayProps) => {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Running DOA estimation algorithms...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Target className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Click "Run Simulation" to see results</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const bestAlgorithm = results.reduce((best, current) => 
    current.rmse < best.rmse ? current : best
  );

  const formatSpectrum = (spectrum: { angle: number; power: number }[] | undefined) => {
    if (!spectrum) return [];
    return spectrum.map(point => ({
      angle: point.angle,
      power: Math.log10(point.power) * 10, // Convert to dB
    }));
  };

  const getAccuracyColor = (rmse: number) => {
    if (rmse < 1) return "text-success";
    if (rmse < 3) return "text-warning";
    return "text-destructive";
  };

  const getAccuracyLabel = (rmse: number) => {
    if (rmse < 1) return "Excellent";
    if (rmse < 3) return "Good";
    if (rmse < 5) return "Fair";
    return "Poor";
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {results.map((result) => (
              <div key={result.algorithm} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{result.algorithm}</span>
                  {result.algorithm === bestAlgorithm.algorithm && (
                    <Badge variant="default" className="bg-success">Best</Badge>
                  )}
                </div>
                <div className="text-2xl font-bold">
                  <span className={getAccuracyColor(result.rmse)}>
                    {result.rmse.toFixed(3)}°
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  RMSE • {getAccuracyLabel(result.rmse)}
                </div>
                <Progress 
                  value={Math.max(0, 100 - (result.rmse * 20))} 
                  className="h-2" 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Detailed Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="graphs" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="graphs">Analysis Graphs</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
              <TabsTrigger value="spectrum">MUSIC Spectrum</TabsTrigger>
              <TabsTrigger value="estimates">DOA Estimates</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="graphs" className="space-y-4">
              <AnalysisGraphs 
                results={results} 
                trueAngles={trueAngles} 
                comparisonData={comparisonData}
                activeParameter={activeParameter}
              />
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="algorithm" />
                    <YAxis />
                    <Legend />
                    <Bar dataKey="rmse" fill="hsl(var(--chart-1))" name="RMSE (degrees)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="spectrum" className="space-y-4">
              {results.find(r => r.algorithm === "MUSIC")?.spectrum && (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatSpectrum(results.find(r => r.algorithm === "MUSIC")?.spectrum)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="angle" label={{ value: 'Angle (degrees)', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'Power (dB)', angle: -90, position: 'insideLeft' }} />
                      <Line type="monotone" dataKey="power" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                      {trueAngles.map((angle, index) => (
                        <ReferenceLine key={index} x={angle} stroke="hsl(var(--chart-3))" strokeDasharray="2 2" />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </TabsContent>

            <TabsContent value="estimates" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-4 w-4" />
                  <span className="font-medium">True DOAs:</span>
                  {trueAngles.map((angle, index) => (
                    <Badge key={index} variant="outline" className="border-chart-3 text-chart-3">
                      {angle}°
                    </Badge>
                  ))}
                </div>

                {results.map((result) => (
                  <div key={result.algorithm} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{result.algorithm} Estimates:</span>
                      <span className="text-sm text-muted-foreground">
                        {result.executionTime.toFixed(2)}ms
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {result.estimatedAngles.map((angle, index) => (
                        <Badge key={index} variant="secondary">
                          {angle.toFixed(1)}°
                        </Badge>
                      ))}
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Algorithm Performance</h4>
                  {results.map((result) => (
                    <div key={result.algorithm} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span>{result.algorithm}</span>
                      <div className="text-right">
                        <div className="font-bold">{result.rmse.toFixed(3)}°</div>
                        <div className="text-xs text-muted-foreground">{result.executionTime.toFixed(1)}ms</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Quality Assessment</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-success">
                      <div className="w-3 h-3 bg-success rounded-full"></div>
                      <span className="text-sm">RMSE &lt; 1°: Excellent</span>
                    </div>
                    <div className="flex items-center gap-2 text-warning">
                      <div className="w-3 h-3 bg-warning rounded-full"></div>
                      <span className="text-sm">RMSE 1-3°: Good</span>
                    </div>
                    <div className="flex items-center gap-2 text-destructive">
                      <div className="w-3 h-3 bg-destructive rounded-full"></div>
                      <span className="text-sm">RMSE &gt; 3°: Needs improvement</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};