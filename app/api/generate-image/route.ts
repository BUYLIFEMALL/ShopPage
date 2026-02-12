import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

type Platform = "nanobanana" | "replicate" | "gpt-image-1";

interface GenerateImageRequest {
  platform: Platform;
  prompt: string;
  aspectRatio: string;
  apiKey: string; // 클라이언트에서 전달받는 API 키
}

/* ── 나노바나나 (Gemini 2.5 Flash Image) ── */
async function generateWithNanobanana(
  prompt: string,
  aspectRatio: string,
  apiKey: string
) {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          imageConfig: { aspectRatio },
          responseModalities: ["Image"],
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API 오류: ${err}`);
  }

  const data = await res.json();
  const part = data.candidates?.[0]?.content?.parts?.[0];

  if (!part?.inlineData) {
    throw new Error("Gemini로부터 이미지 데이터를 받지 못했습니다.");
  }

  return {
    base64: part.inlineData.data as string,
    mediaType: (part.inlineData.mimeType || "image/png") as string,
  };
}

/* ── Replicate (FLUX 2 Dev) ── */
async function generateWithReplicate(
  prompt: string,
  aspectRatio: string,
  apiKey: string
) {
  // 1. 예측 생성
  const createRes = await fetch(
    "https://api.replicate.com/v1/models/black-forest-labs/flux-2-dev/predictions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          prompt,
          go_fast: true,
          aspect_ratio: aspectRatio,
          input_images: [],
          output_format: "jpg",
          output_quality: 80,
        },
      }),
    }
  );

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Replicate API 오류: ${err}`);
  }

  const prediction = await createRes.json();
  const pollUrl = prediction.urls?.get;
  if (!pollUrl) throw new Error("Replicate prediction URL을 받지 못했습니다.");

  // 2. 결과 폴링 (최대 50초)
  for (let i = 0; i < 25; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const pollRes = await fetch(pollUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const result = await pollRes.json();

    if (result.status === "succeeded" && result.output?.[0]) {
      const imgRes = await fetch(result.output[0]);
      const buffer = await imgRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      return { base64, mediaType: "image/jpeg" };
    }

    if (result.status === "failed") {
      throw new Error(`Replicate 생성 실패: ${result.error}`);
    }
  }

  throw new Error("Replicate 이미지 생성 타임아웃 (50초 초과)");
}

/* ── GPT Image 1 (OpenAI) ── */
async function generateWithGptImage1(
  prompt: string,
  aspectRatio: string,
  apiKey: string
) {
  const sizeMap: Record<string, string> = {
    "1:1": "1024x1024",
    "4:3": "1536x1024",
    "16:9": "1536x1024",
    "3:4": "1024x1536",
    "9:16": "1024x1536",
  };
  const size = sizeMap[aspectRatio] || "1024x1024";

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size,
      response_format: "b64_json",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API 오류: ${err}`);
  }

  const data = await res.json();
  const base64 = data.data?.[0]?.b64_json;

  if (!base64) throw new Error("OpenAI로부터 이미지 데이터를 받지 못했습니다.");

  return { base64, mediaType: "image/png" };
}

/* ── 메인 핸들러 ── */
export async function POST(request: NextRequest) {
  try {
    const { platform, prompt, aspectRatio, apiKey }: GenerateImageRequest =
      await request.json();

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "프롬프트를 입력해주세요." },
        { status: 400 }
      );
    }

    if (!apiKey?.trim()) {
      return NextResponse.json(
        { error: "API 키를 입력해주세요." },
        { status: 400 }
      );
    }

    let result: { base64: string; mediaType: string };

    switch (platform) {
      case "nanobanana":
        result = await generateWithNanobanana(prompt, aspectRatio, apiKey);
        break;
      case "replicate":
        result = await generateWithReplicate(prompt, aspectRatio, apiKey);
        break;
      case "gpt-image-1":
        result = await generateWithGptImage1(prompt, aspectRatio, apiKey);
        break;
      default:
        return NextResponse.json(
          { error: "지원하지 않는 플랫폼입니다." },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Image generation error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
