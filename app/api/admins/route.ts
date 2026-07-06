import { NextResponse } from "next/server";
import type { AdminUser } from "@/lib/admin";
import { readAdminsFile, writeAdminsFile } from "@/lib/server/admin-registry";

export async function GET() {
  try {
    const admins = await readAdminsFile();
    return NextResponse.json(admins);
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to load admins." },
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
      { success: false, error: "Admins data must be an array." },
      { status: 400 }
    );
  }

  try {
    await writeAdminsFile(body as AdminUser[]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to save admins." },
      { status: 500 }
    );
  }
}
