import { z } from "zod";

export const createPaymentSchema = z.object({
  blockchain: z.string().min(1, "Select a blockchain"),
  count: z.number().int().min(1).max(20),
  expected_amount: z.string().optional(),
});

export type CreatePaymentValues = z.infer<typeof createPaymentSchema>;
