import { supabaseAdmin } from "./supabase.ts";

export async function log(
  level: "info" | "warn" | "error",
  source: string,
  message: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await supabaseAdmin.from("system_logs").insert({
      level,
      source,
      message,
      metadata: metadata ?? {},
    });
  } catch (e) {
    console.error("[logger] Failed to write log:", e);
  }
}
