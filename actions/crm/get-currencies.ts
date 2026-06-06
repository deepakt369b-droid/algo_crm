"use server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getCurrencies = async () => {
  try {
    const currencies = (await supabaseAdmin.from("Currency").select("code, name, symbol").eq("isEnabled", true).order("code", { ascending: true })).data;
    return { data: currencies };
  } catch (error) {
    return { error: "Failed to fetch currencies" };
  }
};
