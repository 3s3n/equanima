import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { randomUUID } from "crypto";

export async function POST() {
  const userKey = randomUUID();

  const { data, error } = await supabase
    .from("users")
    .insert({ user_key: userKey })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ userId: data.id, userKey });
}
