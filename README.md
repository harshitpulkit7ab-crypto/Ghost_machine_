# Gatherly — Ghost in the Machine

Gatherly is a private event-planning companion powered by Qwen 2.5 0.5B Instruct, an Apache-2.0 open-weight model served in ONNX format and run locally in the browser with [Transformers.js](https://github.com/huggingface/transformers.js). It turns event details into a budget, timeline, vendor checklist, and personal ideas.

## Why open innovation?

The model runs on the visitor's device instead of sending prompts to a hosted AI provider. That means no AI account, API key, per-request cost, or provider-side prompt log. The model can be inspected, replaced, and run under a different local runtime; the app's output validation and budget normalization remain in our code rather than hidden in a hosted service.

The first model use downloads public quantized weights from Hugging Face and the browser runtime may fetch its WebAssembly backend. Those assets are cached by the browser; subsequent inference uses the local model. First use therefore needs an internet connection. If the device or browser cannot run the model, Gatherly falls back to its built-in planner. Only on that fallback path, event details are sent to this app's own `/api/plan` endpoint; they are not sent to an AI provider.

The open model's trade-off is that first-use downloads take time and inference speed depends on the device. The fallback keeps the planner useful on unsupported hardware, while the open model makes private, customizable AI possible without a closed API.

## Deploy to Vercel

1. Import this repository into [Vercel](https://vercel.com/new).
2. Keep the detected **Next.js** framework and default build settings.
3. Deploy. No environment variables, API secrets, or AI provider account are required.

## Run locally

Requires Node.js 20.9 or later.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The built-in planner works immediately; the open model downloads on first use. HTTPS or `localhost` is required for browser inference.

## Checks

```bash
npm run build
npm run typecheck
npm run test:smoke
```
