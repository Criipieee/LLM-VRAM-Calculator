import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { label: string; value: string | number }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</label>
    <div className="relative">
      <select
        className="w-full appearance-none rounded-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-black py-2 pl-3 pr-8 text-sm focus:border-black dark:focus:border-white focus:outline-none transition-colors"
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  </div>
);

interface TabsProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export const Tabs: React.FC<TabsProps> = ({ options, value, onChange, label }) => (
  <div className="flex flex-col gap-2">
    {label && <label className="text-xs font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</label>}
    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`py-2 px-2 text-[10px] sm:text-xs font-mono font-medium rounded-md transition-all truncate ${
            value === opt
              ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
          title={opt}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatDisplay?: (val: number) => string;
}

export const Slider: React.FC<SliderProps> = ({ 
  label, 
  value, 
  min, 
  max, 
  step = 1, 
  onChange, 
  formatDisplay,
  ...props 
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end">
        <label className="text-xs font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </label>
      </div>
      <div className="flex items-center gap-3">
        {/* Min Marker */}
        <div className="w-px h-3 bg-gray-300 dark:bg-gray-700 self-center" />
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-opacity-20"
          {...props}
        />
        
        {/* Max Marker */}
        <div className="w-px h-3 bg-gray-300 dark:bg-gray-700 self-center" />

        <div className="relative min-w-[80px] ml-2">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full text-right bg-transparent border-b border-gray-300 dark:border-gray-700 py-1 text-sm font-mono font-bold focus:border-black dark:focus:border-white focus:outline-none"
          />
          {formatDisplay && (
             <span className="absolute -bottom-4 right-0 text-[10px] text-gray-400 pointer-events-none whitespace-nowrap">
               {formatDisplay(value)}
             </span>
          )}
        </div>
      </div>
    </div>
  );
};

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange, description }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <div className="text-sm font-medium">{label}</div>
      {description && <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-800'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);