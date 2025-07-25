import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { TrendingUp, BarChart3, Activity, Zap } from "lucide-react";

interface DoaResult {
  algorithm: string;
  estimatedAngles: number[];
  rmse: number;
  executionTime: number;
  spectrum?: { angle: number; power: number }[];
}

interface ComparisonData {
  parameter: string;
  value: number;
  musicRmse: number;
  rootMusicRmse: number;
  espritRmse: number;
}

interface AnalysisGraphsProps {
  results: DoaResult[];
  trueAngles: number[];
  comparisonData: ComparisonData[];
  activeParameter: string;
}

export const AnalysisGraphs = ({ results, trueAngles, comparisonData, activeParameter }: AnalysisGraphsProps) => {
  const formatSpectrum = (spectrum: { angle: number; power: number }[] | undefined) => {
    if (!spectrum) return [];
    return spectrum.map(point => ({
      angle: point.angle,
      power: Math.log10(point.power) * 10, // Convert to dB
    }));
  };

  const formatRmseData = () => {
    return results.map((result, index) => ({
      algorithm: result.algorithm,
      rmse: result.rmse,
      index: index + 1,
    }));
  };

  const formatExecutionTimeData = () => {
    return results.map((result, index) => ({
      algorithm: result.algorithm,
      executionTime: result.executionTime,
      index: index + 1,
    }));
  };

  const formatAngularAccuracyData = () => {
    const data: { angle: number; [key: string]: number }[] = [];
    
    trueAngles.forEach((trueAngle, angleIndex) => {
      const dataPoint: { angle: number; [key: string]: number } = { angle: trueAngle };
      
      results.forEach(result => {
        if (result.estimatedAngles[angleIndex] !== undefined) {
          const error = Math.abs(result.estimatedAngles[angleIndex] - trueAngle);
          dataPoint[result.algorithm] = error;
        }
      });
      
      data.push(dataPoint);
    });
    
    return data;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* MUSIC Spectrum Analysis */}
      {results.find(r => r.algorithm === "MUSIC")?.spectrum && (
        <Card className="shadow-elegant border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-chart-1" />
              MUSIC Spectrum Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatSpectrum(results.find(r => r.algorithm === "MUSIC")?.spectrum)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="angle" 
                    label={{ value: 'Angle (degrees)', position: 'insideBottom', offset: -5 }} 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ value: 'Power (dB)', angle: -90, position: 'insideLeft' }} 
                    tick={{ fontSize: 12 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="power" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={3} 
                    dot={false} 
                    activeDot={{ r: 6, fill: "hsl(var(--chart-1))" }}
                  />
                  {trueAngles.map((angle, index) => (
                    <ReferenceLine 
                      key={index} 
                      x={angle} 
                      stroke="hsl(var(--chart-3))" 
                      strokeDasharray="4 4" 
                      strokeWidth={2}
                    />
                  ))}
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* RMSE Comparison Line Graph */}
      <Card className="shadow-elegant border-chart-2/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-chart-2" />
            RMSE Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatRmseData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="algorithm" 
                  label={{ value: 'Algorithm', position: 'insideBottom', offset: -5 }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  label={{ value: 'RMSE (degrees)', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rmse" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={4} 
                  dot={{ r: 8, fill: "hsl(var(--chart-2))", strokeWidth: 2, stroke: "white" }}
                  activeDot={{ r: 10, fill: "hsl(var(--chart-2))" }}
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Execution Time Analysis */}
      <Card className="shadow-elegant border-chart-4/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-chart-4" />
            Execution Time Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatExecutionTimeData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="algorithm" 
                  label={{ value: 'Algorithm', position: 'insideBottom', offset: -5 }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="executionTime" 
                  stroke="hsl(var(--chart-4))" 
                  strokeWidth={4} 
                  dot={{ r: 8, fill: "hsl(var(--chart-4))", strokeWidth: 2, stroke: "white" }}
                  activeDot={{ r: 10, fill: "hsl(var(--chart-4))" }}
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Angular Accuracy per Source */}
      <Card className="shadow-elegant border-chart-5/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-chart-5" />
            Angular Accuracy per Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatAngularAccuracyData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="angle" 
                  label={{ value: 'True Angle (degrees)', position: 'insideBottom', offset: -5 }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  label={{ value: 'Error (degrees)', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                />
                {results.map((result, index) => (
                  <Line 
                    key={result.algorithm}
                    type="monotone" 
                    dataKey={result.algorithm} 
                    stroke={`hsl(var(--chart-${(index % 5) + 1}))`}
                    strokeWidth={3} 
                    dot={{ r: 6, strokeWidth: 2, stroke: "white" }}
                    activeDot={{ r: 8 }}
                  />
                ))}
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Parameter Comparison (if available) */}
      {comparisonData.length > 0 && (
        <Card className="lg:col-span-2 shadow-elegant border-chart-3/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-chart-3" />
              Parameter Sensitivity Analysis: {activeParameter}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="value" 
                    label={{ value: `${activeParameter}`, position: 'insideBottom', offset: -5 }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ value: 'RMSE (degrees)', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="musicRmse" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={3}
                    name="MUSIC"
                    dot={{ r: 6, fill: "hsl(var(--chart-1))", strokeWidth: 2, stroke: "white" }}
                    activeDot={{ r: 8, fill: "hsl(var(--chart-1))" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rootMusicRmse" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={3}
                    name="Root-MUSIC"
                    dot={{ r: 6, fill: "hsl(var(--chart-2))", strokeWidth: 2, stroke: "white" }}
                    activeDot={{ r: 8, fill: "hsl(var(--chart-2))" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="espritRmse" 
                    stroke="hsl(var(--chart-3))" 
                    strokeWidth={3}
                    name="ESPRIT"
                    dot={{ r: 6, fill: "hsl(var(--chart-3))", strokeWidth: 2, stroke: "white" }}
                    activeDot={{ r: 8, fill: "hsl(var(--chart-3))" }}
                  />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};