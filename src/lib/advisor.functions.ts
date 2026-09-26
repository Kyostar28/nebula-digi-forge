import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output } from "ai";
import { z } from "zod";

const SYMBOLS = ["BTC", "ETH", "LTC", "SHIB", "DOGE", "TRX", "BNB", "SOL", "POL", "ETC", "BCH", "XRP", "ADA", "ATOM", "SUI", "AVAX"] as const;

const Input = z.object({ goal: z.string().min(3).max(1000), power: z.number() });

const Schema = z.object({
  summary: z.string(),
  allocations: z.array(
    z.object({ symbol: z.enum(SYMBOLS), percent: z.number(), reason: z.string() }),
  ),
});

export const recommendAllocations = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("La IA no está configurada.");
    const lovable = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    try {
      const result = streamText({
        model: lovable.responses("openai/gpt-6-astra"),
        output: Output.object({ schema: Schema }),
        system:
          "Eres un asesor de una app de minería en la nube simulada. Recomienda cómo repartir el hashpower del usuario entre estas monedas: " +
          SYMBOLS.join(", ") +
          ". Devuelve solo monedas con percent > 0, que sumen 100. Responde en español, razones breves (máx 15 palabras). No es consejo financiero.",
        prompt: `Hashpower: ${data.power} h/s. Objetivo del usuario: ${data.goal}`,
        providerOptions: {
          openai: {
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            store: false,
            include: ["reasoning.encrypted_content"],
          },
        },
      });
      const out = await result.output;
      return { ok: true as const, ...out };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 402) return { ok: false as const, error: "Sin créditos de IA disponibles." };
      if (status === 429) return { ok: false as const, error: "Demasiadas solicitudes, intenta en un momento." };
      return { ok: false as const, error: msg };
    }
  });
