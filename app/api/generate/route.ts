import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { anthropic, MODEL, MAX_TOKENS } from "@/lib/claude";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompt-builder";
import { savePage } from "@/lib/store";
import { TemplateInput } from "@/types/product";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const input: TemplateInput = await request.json();

    if (!input.productName?.trim()) {
      return NextResponse.json({ error: "제품명을 입력해주세요." }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." }, { status: 500 });
    }

    const imageBlocks = input.uploadedImages.map((img) => ({
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: img.mediaType,
        data: img.base64,
      },
    }));

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: buildSystemPrompt(input.template),
      messages: [
        {
          role: "user",
          content: [
            ...imageBlocks,
            {
              type: "text",
              text: buildUserPrompt(input),
            },
          ],
        },
      ],
    });

    let html =
      response.content[0].type === "text" ? response.content[0].text : "";

    if (!html) {
      return NextResponse.json({ error: "AI가 응답을 생성하지 못했습니다." }, { status: 500 });
    }

    // 마크다운 코드블록 제거 (Claude가 감쌌을 경우 대비)
    html = html.replace(/^```html\s*/i, "").replace(/```\s*$/, "").trim();

    // [IMAGE_N] 플레이스홀더를 실제 base64 데이터로 교체
    input.uploadedImages.forEach((img, i) => {
      const placeholder = new RegExp(`\\[IMAGE_${i + 1}\\]`, "g");
      html = html.replace(placeholder, `data:${img.mediaType};base64,${img.base64}`);
    });

    const id = uuidv4();
    savePage(id, html);

    return NextResponse.json({
      id,
      previewUrl: `/preview/${id}`,
    });
  } catch (error: unknown) {
    console.error("Generate error:", error);
    const message =
      error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `오류: ${message}` },
      { status: 500 }
    );
  }
}
