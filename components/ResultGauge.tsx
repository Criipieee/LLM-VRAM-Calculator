import React from 'react';
import { CalculationResult } from '../types';

interface ResultGaugeProps {
  result: CalculationResult;
  isDark: boolean;
}

export const ResultGauge: React.FC<ResultGaugeProps> = ({ result, isDark }) => {
  const data = [
    { name: 'Weights', value: result.weights },
    { name: 'KV Cache', value: result.kvCache },
    { name: 'Activations', value: result.activations },
    { name: 'Gradients', value: result.gradients },
    { name: 'Optimizer', value: result.optimizer },
  ].filter(d => d.value > 0.001); // Filter negligible

  const totalUsage = result.total;

  return (
    <div className="h-full flex flex-col gap-8">
      {/* Big Total Display */}
      <div className="text-center p-8 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900/50 backdrop-blur-sm">
        <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-4">Total Estimated VRAM</h3>
        <div className="text-6xl md:text-8xl font-bold font-mono tracking-tighter">
          {totalUsage.toFixed(2)} <span className="text-3xl text-gray-400">GB</span>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="flex-1 overflow-y-auto pr-2">
         <h4 className="text-xs uppercase font-mono text-gray-500 dark:text-gray-400 mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
           Usage Breakdown
         </h4>
         
         <div className="space-y-6">
           {data.map((item) => {
             const percentage = (item.value / totalUsage) * 100;
             return (
               <div key={item.name} className="group">
                 <div className="flex justify-between items-end mb-2">
                   <div className="flex flex-col">
                     <span className="text-sm font-bold">{item.name}</span>
                     <span className="text-xs text-gray-500 font-mono">{percentage.toFixed(1)}%</span>
                   </div>
                   <div className="font-mono text-lg font-medium">
                     {item.value.toFixed(2)} <span className="text-sm text-gray-500">GB</span>
                   </div>
                 </div>
                 
                 {/* Progress Bar Container */}
                 <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-black dark:bg-white transition-all duration-700 ease-out"
                     style={{ width: `${percentage}%` }}
                   />
                 </div>
               </div>
             );
           })}
         </div>

         {data.length === 0 && (
           <div className="text-center text-gray-500 text-sm mt-10">
             Enter parameters to calculate usage
           </div>
         )}
      </div>
    </div>
  );
};
