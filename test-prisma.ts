import { prismadb } from "./lib/prisma.ts";
import { supabaseAdmin } from "@/lib/supabase-admin";

 async function run() { try { const user = (await supabaseAdmin.from("users").select("*").single()).data; console.log(user); } catch (e) { console.error("ERROR:", e); } finally { process.exit(0); } } run();
