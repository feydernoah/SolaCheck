import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Hello from the API! This is a sample endpoint.",
    timestamp: new Date().toISOString(),
  });
}
