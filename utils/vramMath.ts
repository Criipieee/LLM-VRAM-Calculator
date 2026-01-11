import { AppMode, CalculationResult, ModelSpecs, OptimizerType, Precision } from "../types";
import { OPTIMIZER_BYTES, PRECISION_BYTES } from "../constants";

// Helper to estimate model architecture based on parameter count
// This uses interpolation between known architecture points for realistic estimation
export const estimateArchitecture = (paramsInBillions: number): ModelSpecs => {
  // Known reference points: [Params(B), Layers, HiddenSize]
  const references = [
    [0.1, 12, 768],
    [0.5, 24, 1024],
    [1.5, 24, 2048], // GPT-2 XL ish
    [3, 32, 2560],
    [7, 32, 4096],   // Llama 2 7B
    [13, 40, 5120],  // Llama 2 13B
    [34, 60, 7168],  // Yi 34B
    [70, 80, 8192],  // Llama 2 70B
    [180, 80, 14848], // Falcon
    [314, 64, 6144], // Grok (MoEish, but treats as dense for RAM mostly) - outlier, ignoring for linear fit
    [500, 100, 18000], // Extrapolation
    [2000, 140, 30000] // Extrapolation
  ];

  // Find range
  let lower = references[0];
  let upper = references[references.length - 1];

  for (let i = 0; i < references.length - 1; i++) {
    if (paramsInBillions >= references[i][0] && paramsInBillions <= references[i+1][0]) {
      lower = references[i];
      upper = references[i+1];
      break;
    }
  }

  // Linear interpolation
  const t = (paramsInBillions - lower[0]) / (upper[0] - lower[0]);
  const safeT = Math.max(0, Math.min(1, isNaN(t) ? 0 : t));

  const layers = Math.round(lower[1] + safeT * (upper[1] - lower[1]));
  const hiddenSize = Math.round(lower[2] + safeT * (upper[2] - lower[2]));
  const heads = 32; // Placeholder, heads affects KV cache divisor but usually hiddenSize/heads is constant-ish (64-128)

  return {
    params: paramsInBillions,
    layers,
    hiddenSize,
    heads
  };
};

export const calculateVram = (
  mode: AppMode,
  specs: ModelSpecs,
  precision: Precision,
  sequenceLength: number,
  batchSize: number,
  optimizer: OptimizerType,
  gradCheckpointing: boolean,
  trainableParamsPercent: number = 100 // For LoRA
): CalculationResult => {
  const bytesPerParam = PRECISION_BYTES[precision];
  const paramsBytes = specs.params * 1_000_000_000 * bytesPerParam;
  
  // GB conversion factor
  const GB = 1024 * 1024 * 1024;

  let weights = paramsBytes;
  let kvCache = 0;
  let gradients = 0;
  let optimizerState = 0;
  let activations = 0;

  // --- KV Cache Calculation ---
  // Formula: 2 * Layers * HiddenSize * SeqLen * Batch * SizeOf(KV_Precision)
  // We assume KV cache is usually computed in FP16 (2 bytes)
  const kvPrecision = 2; 
  
  kvCache = 2 * specs.layers * specs.hiddenSize * sequenceLength * batchSize * kvPrecision;

  // --- Mode Specifics ---

  if (mode === AppMode.Inference) {
    // Inference uses Weights + KV Cache + minimal activation overhead
    activations = batchSize * sequenceLength * specs.hiddenSize * bytesPerParam; 
  } 
  else if (mode === AppMode.TrainingFull) {
    // Gradients
    gradients = specs.params * 1_000_000_000 * 4; // Gradients usually stored in FP32

    // Optimizer
    optimizerState = specs.params * 1_000_000_000 * OPTIMIZER_BYTES[optimizer];

    // Activations
    // Heuristic: ~ Batch * Seq * Hidden * Layers * (Checkpointing ? 2 : 10) * Precision
    // We refined the multiplier based on common transformer training memory profiles
    const activationMultiplier = gradCheckpointing ? 2 : 12; 
    activations = batchSize * sequenceLength * specs.hiddenSize * specs.layers * activationMultiplier;
  } 
  else if (mode === AppMode.TrainingLoRA || mode === AppMode.TrainingQLoRA) {
    const trainableParams = (specs.params * 1_000_000_000) * (trainableParamsPercent / 100);

    // Gradients: Only for trainable params
    gradients = trainableParams * 4;

    // Optimizer: Only for trainable params
    optimizerState = trainableParams * OPTIMIZER_BYTES[optimizer];

    // Activations
    // Checkpointing is almost always used in QLoRA to save memory
    const activationMultiplier = gradCheckpointing ? 1.5 : (specs.layers / 2); 
    activations = batchSize * sequenceLength * specs.hiddenSize * activationMultiplier * 4;
  }

  return {
    weights: weights / GB,
    kvCache: kvCache / GB,
    gradients: gradients / GB,
    optimizer: optimizerState / GB,
    activations: activations / GB,
    total: (weights + kvCache + gradients + optimizerState + activations) / GB
  };
};