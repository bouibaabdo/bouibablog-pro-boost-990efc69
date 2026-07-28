import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const { data, error } = await supabase
    .from("lessons")
    .select("id, title, description, category, video_path")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching lessons:", error);
    return;
  }

  console.log(`Found ${data.length} lessons in DB:`);
  data.forEach((l, idx) => {
    console.log(`${idx + 1}. [${l.category || "No Cat"}] ${l.title}`);
    console.log(`   Path: ${l.video_path}`);
  });
}

run();
