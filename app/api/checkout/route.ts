import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";

export const runtime = "nodejs";

const itemSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int().positive(),
  unitPrice: z.number().nonnegative()
});

const checkoutSchema = z
  .object({
    items: z.array(itemSchema).min(1),
    method: z.enum(["DELIVERY", "PICKUP"]),
    delivery: z
      .object({
        marina: z.string().optional(),
        boatName: z.string().optional(),
        slip: z.string().optional()
      })
      .optional(),
    pickup: z
      .object({
        pickupPoint: z.string().optional()
      })
      .optional(),
    notes: z.string().max(500).optional()
  })
  .superRefine((data, ctx) => {
    if (data.method === "DELIVERY") {
      if (!data.delivery?.marina?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["delivery", "marina"], message: "Marina required." });
      }
      if (!data.delivery?.boatName?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["delivery", "boatName"], message: "Boat name required." });
      }
      if (!data.delivery?.slip?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["delivery", "slip"], message: "Slip required." });
      }
    }

    if (data.method === "PICKUP" && !data.pickup?.pickupPoint?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["pickup", "pickupPoint"], message: "Pickup point required." });
    }
  });

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: "AUTH_REQUIRED" }, { status: 401 });
    }
    const payload = await request.json();
    const parsed = checkoutSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Payload checkout invalide.",
          errors: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const confirmationId = `YD-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    return NextResponse.json({
      confirmationId,
      message: "Commande mock créée avec succès."
    });
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }
}
