import { NextRequest, NextResponse } from "next/server";
import { getPage } from "@/lib/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const html = getPage(params.id);

  if (!html) {
    return NextResponse.json({ error: "페이지를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ html });
}
