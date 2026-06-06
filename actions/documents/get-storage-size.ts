import { supabaseAdmin } from "@/lib/supabase-admin";

export const getStorageSize = async () => {
  const { data, error } = await supabaseAdmin.from("Documents").select("*");

  if (error || !data) return 0;

  //TODO: fix this any
  const storageSize = data.reduce((acc: number, doc: any) => {
    return acc + doc?.size;
  }, 0);

  const storageSizeMB = storageSize / 1000000;

  return Math.round(storageSizeMB * 100) / 100;
};
