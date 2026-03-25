import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { userKey } = await request.json();

  if (!userKey) {
    return NextResponse.json({ error: "Missing userKey" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("user_key", userKey.trim())
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Key not found" }, { status: 404 });
  }

  return NextResponse.json({ userId: data.id });
}
