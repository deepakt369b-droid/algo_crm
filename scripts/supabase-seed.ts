import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

const accountsData = [
  { name: "Acme Corp", industry: "Manufacturing", website: "acme.com" },
  { name: "Globex", industry: "Technology", website: "globex.com" },
  { name: "Soylent", industry: "Food", website: "soylent.com" }
];

const leadSourcesData = [
  { name: "Cold Call" },
  { name: "Existing Customer" },
  { name: "Self Generated" },
  { name: "Employee" },
  { name: "Partner" },
  { name: "Public Relations" },
  { name: "Direct Mail" },
  { name: "Conference" },
  { name: "Trade Show" },
  { name: "Web Site" },
  { name: "Word of mouth" },
  { name: "Email" },
  { name: "Campaign" },
  { name: "Other" }
];

const leadStatusesData = [
  { name: "New" },
  { name: "Assigned" },
  { name: "In Process" },
  { name: "Converted" },
  { name: "Recycled" },
  { name: "Dead" }
];

const leadTypesData = [
  { name: "B2B" },
  { name: "B2C" }
];

async function seed() {
  console.log("Seeding Supabase data...");
  try {
    for (const data of accountsData) {
      await supabase.from("crm_Accounts").upsert({ id: crypto.randomUUID(), ...data }, { onConflict: "name" }).select();
    }
    for (const data of leadSourcesData) {
      await supabase.from("crm_Lead_Sources").upsert({ id: crypto.randomUUID(), ...data }, { onConflict: "name" }).select();
    }
    for (const data of leadStatusesData) {
      await supabase.from("crm_Lead_Statuses").upsert({ id: crypto.randomUUID(), ...data }, { onConflict: "name" }).select();
    }
    for (const data of leadTypesData) {
      await supabase.from("crm_Lead_Types").upsert({ id: crypto.randomUUID(), ...data }, { onConflict: "name" }).select();
    }
    console.log("Seeding complete!");
  } catch (err) {
    console.error("Failed to seed:", err);
  }
}

seed();
