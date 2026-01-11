import { OptimizerType, Precision } from "./types";

export const PRECISION_BYTES: Record<Precision, number> = {
  [Precision.FP32]: 4,
  [Precision.FP16]: 2,
  [Precision.BF16]: 2,
  [Precision.FP8]: 1,
  [Precision.INT8]: 1,
  [Precision.Q6_K]: 6.5625 / 8,
  [Precision.Q5_K_M]: 5.6875 / 8,
  [Precision.Q5_K_S]: 5.5 / 8,
  [Precision.Q4_K_M]: 4.6875 / 8,
  [Precision.Q4_K_S]: 4.5 / 8,
  [Precision.INT4]: 0.5,
  [Precision.Q3_K_M]: 3.91 / 8,
  [Precision.Q3_K_S]: 3.44 / 8,
  [Precision.Q2_K]: 2.63 / 8,
};

export const OPTIMIZER_BYTES: Record<OptimizerType, number> = {
  [OptimizerType.AdamW]: 8,
  [OptimizerType.SGD]: 4,
  [OptimizerType.Adam8bit]: 2,
  [OptimizerType.PagedAdam]: 8,
};
