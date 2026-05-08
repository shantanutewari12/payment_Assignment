import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const PayloadSchema = z.object({
  transactionId: z.string().min(1),
  cardholderName: z.string().min(1),
  cardNumber: z.string().min(12),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/),
  cvv: z.string().regex(/^\d{3,4}$/),
  amount: z.number().positive(),
  currency: z.enum(["INR"]),
  brand: z.enum(["visa", "mastercard", "amex", "rupay", "unknown"]),
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const Route = createFileRoute("/api/pay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
        const parsed = PayloadSchema.safeParse(body);
        if (!parsed.success) {
          return new Response(JSON.stringify({ error: "Invalid payload" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
        const { transactionId } = parsed.data;
        const r = Math.random();
        if (r < 0.6) {
          await sleep(900 + Math.random() * 700);
          return Response.json({ success: true, status: "success", transactionId });
        }
        if (r < 0.85) {
          await sleep(900 + Math.random() * 700);
          return Response.json({
            success: false,
            status: "failed",
            reason: "Insufficient funds",
            transactionId,
          });
        }
        await sleep(8000);
        return Response.json({ success: true, status: "success", transactionId });
      },
    },
  },
});
