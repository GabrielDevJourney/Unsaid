import { z } from "zod";

export const WaitlistCreateSchema = z.object({
    email: z
        .email("Please enter a valid email address")
        .transform((val) => val.toLowerCase().trim()),
    source: z.string().optional().default("landing_page"),
});

export type WaitlistCreateInput = z.infer<typeof WaitlistCreateSchema>;
