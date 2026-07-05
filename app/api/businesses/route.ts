import { NextResponse } from "next/server";
import type { Business } from "@/lib/business";
import { readBusinessesFile, writeBusinessesFile } from "@/lib/server/business-registry";

export async function GET() {
  try {
    const businesses = await readBusinessesFile();
    return NextResponse.json(businesses);
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to load businesses." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  if (!Array.isArray(body)) {
    return NextResponse.json(
      { success: false, error: "Businesses data must be an array." },
      { status: 400 }
    );
  }

  try {
    await writeBusinessesFile(body as Business[]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to save businesses." },
      { status: 500 }
    );
  }
}
