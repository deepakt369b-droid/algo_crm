import { supabaseAdmin } from "@/lib/supabase-admin";

export const getStorageSize = async () => {
  const data = (await supabaseAdmin.from("documents").select("*")).data;

  //TODO: fix this any
  const storageSize = data.reduce((acc: number, doc: any) => {
    return acc + doc?.size;
  }, 0);

  const storageSizeMB = storageSize / 1000000;

  return Math.round(storageSizeMB * 100) / 100;
};
