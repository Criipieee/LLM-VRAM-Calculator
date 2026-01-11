# LLM VRAM Calculator

A minimalist, high-precision tool designed to estimate Video RAM (VRAM) requirements for running, training, and fine-tuning Large Language Models (LLMs).

<img width="1116" height="809" alt="Bildschirmfoto 2026-01-11 um 22 05 25" src="https://github.com/user-attachments/assets/fc167493-cf47-48bb-bc4d-757e4df90034" />

## Features

- **Monochromatic Aesthetic:** A strict black-and-white design system with a "Dark Mode First" approach.
- **Universal Model Support:** Input any parameter count from 1 Million to 2 Trillion using a logarithmic slider or direct text input.
- **Multiple Operation Modes:**
  - **Inference:** Calculate requirements for simply running a model.
  - **Full Training:** Estimate VRAM for full-parameter training.
  - **LoRA / QLoRA:** Calculate requirements for efficient fine-tuning methods.
- **Advanced Precision Support:** Includes standard formats (FP32, FP16/BF16) and extensive quantization options (GGUF Q-types, INT8, INT4, etc.).
- **Detailed Breakdown:** Real-time visualization of VRAM usage across Weights, KV Cache, Activations, Gradients, and Optimizer states.

## Tech Stack

- **React:** UI rendering and state management.
- **TypeScript:** Type safety for calculations and components.
- **Tailwind CSS:** styling and theming.

## Usage Guide

1. **Select Mode:** Use the tabs to switch between Inference, Training (Full), or LoRA modes.
2. **Set Model Size:** Drag the slider or type the number of parameters (in Billions).
3. **Configure Environment:**
   - **Precision:** Choose the bit-depth/quantization of the loaded model.
   - **Context Length:** Set the sequence length (tokens).
   - **Batch Size:** Set the number of concurrent requests/samples.
4. **Training Settings (If applicable):**
   - Select the Optimizer type (AdamW, SGD, etc.).
   - Toggle Gradient Checkpointing to trade compute for memory.
   - Adjust LoRA Rank percentage for fine-tuning.
