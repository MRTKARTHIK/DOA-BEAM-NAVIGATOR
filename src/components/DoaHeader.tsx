import { Radar, Activity, BarChart3 } from "lucide-react";

export const DoaHeader = () => {
  return (
    <div className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground p-6 rounded-lg shadow-lg mb-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/10 rounded-lg">
          <Radar className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Advanced DOA Estimation Suite
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Interactive Direction of Arrival analysis with MUSIC, Root-MUSIC, and ESPRIT algorithms
          </p>
        </div>
        <div className="ml-auto flex gap-4">
          <div className="flex items-center gap-2 text-primary-foreground/80">
            <Activity className="h-5 w-5" />
            <span className="text-sm">Real-time Processing</span>
          </div>
          <div className="flex items-center gap-2 text-primary-foreground/80">
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm">Performance Analytics</span>
          </div>
        </div>
      </div>
    </div>
  );
};