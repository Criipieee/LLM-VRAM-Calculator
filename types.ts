export enum AppMode {
  Inference = 'Inference',
  TrainingFull = 'Training (Full)',
  TrainingLoRA = 'Training (LoRA)',
  TrainingQLoRA = 'Training (QLoRA)',
}

export enum Precision {
  FP32 = 'FP32 (4.00 bpw)',
  FP16 = 'FP16 (2.00 bpw)',
  BF16 = 'BF16 (2.00 bpw)',
  FP8 = 'FP8 (1.00 bpw)',
  INT8 = 'INT8 (1.00 bpw)',
  Q6_K = 'Q6_K (~6.56 bpw)',
  Q5_K_M = 'Q5_K_M (~5.69 bpw)',
  Q5_K_S = 'Q5_K_S (~5.50 bpw)',
  Q4_K_M = 'Q4_K_M (~4.69 bpw)',
  Q4_K_S = 'Q4_K_S (~4.50 bpw)',
  INT4 = 'INT4/GPTQ/AWQ (4.00 bpw)',
  Q3_K_M = 'Q3_K_M (~3.91 bpw)',
  Q3_K_S = 'Q3_K_S (~3.44 bpw)',
  Q2_K = 'Q2_K (~2.63 bpw)',
}

export enum OptimizerType {
  AdamW = 'AdamW (8 bytes/param)',
  SGD = 'SGD (4 bytes/param)',
  Adam8bit = '8-bit Adam (2 bytes/param)',
  PagedAdam = 'Paged AdamW (8 bytes)',
}

export interface ModelSpecs {
  params: number; // in Billions
  layers: number;
  hiddenSize: number;
  heads: number;
}

export interface CalculationResult {
  weights: number; // GB
  kvCache: number; // GB
  gradients: number; // GB
  optimizer: number; // GB
  activations: number; // GB
  total: number; // GB
}
