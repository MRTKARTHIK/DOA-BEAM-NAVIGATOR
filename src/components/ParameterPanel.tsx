import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Play, RefreshCw } from "lucide-react";

interface ParameterPanelProps {
  onParameterChange: (params: DoaParameters) => void;
  onRunSimulation: () => void;
  isRunning: boolean;
}

export interface DoaParameters {
  snapshots: number;
  arrayElements: number;
  snr: number;
  sourceAngles: number[];
  carrierFreq: number;
  arraySpacing: number;
}

export const ParameterPanel = ({ onParameterChange, onRunSimulation, isRunning }: ParameterPanelProps) => {
  const [params, setParams] = useState<DoaParameters>({
    snapshots: 200,
    arrayElements: 10,
    snr: 10,
    sourceAngles: [20, 40, 60],
    carrierFreq: 1,
    arraySpacing: 0.5,
  });

  const updateParam = (key: keyof DoaParameters, value: number | number[]) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    onParameterChange(newParams);
  };

  const resetParams = () => {
    const defaultParams: DoaParameters = {
      snapshots: 200,
      arrayElements: 10,
      snr: 10,
      sourceAngles: [20, 40, 60],
      carrierFreq: 1,
      arraySpacing: 0.5,
    };
    setParams(defaultParams);
    onParameterChange(defaultParams);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Simulation Parameters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Array Configuration */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Array Configuration
          </h3>
          
          <div className="space-y-2">
            <Label>Array Elements: {params.arrayElements}</Label>
            <Slider
              value={[params.arrayElements]}
              onValueChange={(value) => updateParam('arrayElements', value[0])}
              min={4}
              max={16}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Element Spacing (λ): {params.arraySpacing}</Label>
            <Slider
              value={[params.arraySpacing]}
              onValueChange={(value) => updateParam('arraySpacing', value[0])}
              min={0.25}
              max={1.0}
              step={0.05}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Carrier Frequency (GHz): {params.carrierFreq}</Label>
            <Slider
              value={[params.carrierFreq]}
              onValueChange={(value) => updateParam('carrierFreq', value[0])}
              min={0.5}
              max={5.0}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>

        <Separator />

        {/* Signal Parameters */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Signal Parameters
          </h3>
          
          <div className="space-y-2">
            <Label>Snapshots: {params.snapshots}</Label>
            <Slider
              value={[params.snapshots]}
              onValueChange={(value) => updateParam('snapshots', value[0])}
              min={50}
              max={1000}
              step={50}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>SNR (dB): {params.snr}</Label>
            <Slider
              value={[params.snr]}
              onValueChange={(value) => updateParam('snr', value[0])}
              min={-5}
              max={30}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <Separator />

        {/* Source Configuration */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Signal Sources
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {params.sourceAngles.map((angle, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {angle}°
              </Badge>
            ))}
          </div>

          <div className="text-xs text-muted-foreground">
            Default sources at 20°, 40°, and 60°
          </div>
        </div>

        <Separator />

        {/* Control Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={onRunSimulation} 
            disabled={isRunning}
            variant="scientific"
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Simulation
              </>
            )}
          </Button>

          <Button 
            onClick={resetParams}
            variant="outline"
            className="w-full"
          >
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};