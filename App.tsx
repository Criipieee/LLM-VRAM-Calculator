import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppMode, OptimizerType, Precision } from './types';
import { calculateVram, estimateArchitecture } from './utils/vramMath';
import { Select, Slider, Toggle, Tabs } from './components/Controls';
import { ResultGauge } from './components/ResultGauge';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  
  // State
  const [mode, setMode] = useState<AppMode>(AppMode.Inference);
  
  // Model Parameters State
  // We keep track of the raw params value (in Billions) as the source of truth
  const [paramsInBillions, setParamsInBillions] = useState<number>(8); // Default 8B

  const [precision, setPrecision] = useState<Precision>(Precision.FP16);
  const [sequenceLength, setSequenceLength] = useState<number>(8192);
  const [batchSize, setBatchSize] = useState<number>(1);
  const [optimizer, setOptimizer] = useState<OptimizerType>(OptimizerType.AdamW);
  const [gradCheckpointing, setGradCheckpointing] = useState<boolean>(false);
  const [loraRankPercent, setLoraRankPercent] = useState<number>(2); // % of trainable params

  // Theme handling
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Logarithmic Scale Config
  // Min: 0.001 Billion (1 Million)
  // Max: 2000 Billion (2 Trillion)
  const MIN_PARAMS = 0.001; 
  const MAX_PARAMS = 2000;
  
  // Calculate slider position (0-100) from current params
  const sliderValue = useMemo(() => {
    const minLog = Math.log(MIN_PARAMS);
    const maxLog = Math.log(MAX_PARAMS);
    const currentLog = Math.log(Math.max(MIN_PARAMS, Math.min(MAX_PARAMS, paramsInBillions)));
    return ((currentLog - minLog) / (maxLog - minLog)) * 100;
  }, [paramsInBillions]);

  // Handle Slider Change
  const handleSliderChange = useCallback((newSliderVal: number) => {
    const minLog = Math.log(MIN_PARAMS);
    const maxLog = Math.log(MAX_PARAMS);
    const scale = (maxLog - minLog) / 100;
    const val = Math.exp(minLog + scale * newSliderVal);
    setParamsInBillions(val);
  }, []);

  // Handle Direct Input Change
  const handleParamInputChange = useCallback((newVal: number) => {
    // If NaN or negative, we might want to ignore or clamp, 
    // but Controls passes parsed float.
    if (!isNaN(newVal) && newVal > 0) {
      setParamsInBillions(newVal);
    }
  }, []);

  // Derived Model Specs
  const currentModelSpecs = useMemo(() => {
    return estimateArchitecture(paramsInBillions);
  }, [paramsInBillions]);

  // Calculation
  const result = useMemo(() => {
    return calculateVram(
      mode,
      currentModelSpecs,
      precision,
      sequenceLength,
      batchSize,
      optimizer,
      gradCheckpointing,
      loraRankPercent
    );
  }, [mode, currentModelSpecs, precision, sequenceLength, batchSize, optimizer, gradCheckpointing, loraRankPercent]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-black'}`}>
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-black dark:bg-white rounded-full animate-pulse-slow"></div>
            <h1 className="font-mono font-bold text-lg tracking-tighter">LLM VRAM Calculator</h1>
          </div>
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-8 animate-[fadeIn_0.5s_ease-out]">
            
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-2">
                <h2 className="text-xl font-bold tracking-tight">Configuration</h2>
                <span className="text-xs font-mono text-gray-500">{mode}</span>
              </div>

              <div className="space-y-6">
                <Tabs
                  label="Operation Mode"
                  options={Object.values(AppMode)}
                  value={mode}
                  onChange={(val) => setMode(val as AppMode)}
                />

                {/* Custom Logarithmic Slider Implementation for Parameters */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Model Size (Billions)
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-px h-3 bg-gray-300 dark:bg-gray-700 self-center" />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={0.1}
                      value={sliderValue}
                      onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
                      className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-opacity-20"
                    />
                    <div className="w-px h-3 bg-gray-300 dark:bg-gray-700 self-center" />
                    <div className="relative min-w-[80px] ml-2">
                      <input
                        type="number"
                        min={MIN_PARAMS}
                        max={MAX_PARAMS}
                        step={0.1}
                        value={parseFloat(paramsInBillions.toFixed(3))}
                        onChange={(e) => handleParamInputChange(parseFloat(e.target.value))}
                        className="w-full text-right bg-transparent border-b border-gray-300 dark:border-gray-700 py-1 text-sm font-mono font-bold focus:border-black dark:focus:border-white focus:outline-none"
                      />
                      <span className="absolute -bottom-4 right-0 text-[10px] text-gray-400 pointer-events-none whitespace-nowrap">
                         {paramsInBillions < 1 ? `${(paramsInBillions*1000).toFixed(0)}M` : `${paramsInBillions.toFixed(1)}B`}
                      </span>
                    </div>
                  </div>
                </div>

                <Select 
                  label="Precision / Quantization"
                  value={precision}
                  onChange={(e) => setPrecision(e.target.value as Precision)}
                  options={Object.values(Precision).map(p => ({ label: p, value: p }))}
                />

                <Slider 
                  label="Context Length (Tokens)"
                  min={512}
                  max={200000}
                  step={512}
                  value={sequenceLength}
                  onChange={setSequenceLength}
                  formatDisplay={(v) => `${(v/1024).toFixed(1)}k`}
                />

                <Slider 
                  label="Batch Size"
                  min={1}
                  max={512}
                  step={1}
                  value={batchSize}
                  onChange={setBatchSize}
                />
              </div>
            </section>

            {/* Training Specifics */}
            {mode !== AppMode.Inference && (
              <section className="space-y-6 border-t border-gray-200 dark:border-white/10 pt-6">
                 <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Training Parameters</h2>
                 
                 <Select 
                    label="Optimizer"
                    value={optimizer}
                    onChange={(e) => setOptimizer(e.target.value as OptimizerType)}
                    options={Object.values(OptimizerType).map(o => ({ label: o, value: o }))}
                  />

                  <Toggle 
                    label="Gradient Checkpointing"
                    description="Saves memory at cost of ~20% speed"
                    checked={gradCheckpointing}
                    onChange={setGradCheckpointing}
                  />

                  {(mode === AppMode.TrainingLoRA || mode === AppMode.TrainingQLoRA) && (
                    <Slider 
                      label="Trainable Params (LoRA %)"
                      min={0.1}
                      max={100}
                      step={0.1}
                      value={loraRankPercent}
                      onChange={setLoraRankPercent}
                      formatDisplay={(v) => `${v}%`}
                    />
                  )}
              </section>
            )}
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 sticky top-24 h-[calc(100vh-8rem)]">
            <div className="h-full bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-xl overflow-hidden">
               <ResultGauge result={result} isDark={isDark} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;