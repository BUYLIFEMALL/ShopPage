"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductInput, UploadedImage, Specification } from "@/types/product";
import ImageUploader from "./ImageUploader";
import SpecsEditor from "./SpecsEditor";

export default function ProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ProductInput>({
    productName: "",
    description: "",
    specifications: [{ key: "", value: "" }],
    targetAudience: "",
    keySellingPoints: ["", "", ""],
    uploadedImages: [],
  });

  function updateField<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateSellingPoint(index: number, value: string) {
    const updated = [...form.keySellingPoints];
    updated[index] = value;
    setForm((prev) => ({ ...prev, keySellingPoints: updated }));
  }

  function addSellingPoint() {
    if (form.keySellingPoints.length < 5) {
      setForm((prev) => ({ ...prev, keySellingPoints: [...prev.keySellingPoints, ""] }));
    }
  }

  function removeSellingPoint(index: number) {
    if (form.keySellingPoints.length > 1) {
      setForm((prev) => ({
        ...prev,
        keySellingPoints: prev.keySellingPoints.filter((_, i) => i !== index),
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.productName.trim()) {
      setError("제품명을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "생성 중 오류가 발생했습니다.");
        return;
      }

      router.push(data.previewUrl);
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 이미지 업로드 */}
      <Section title="📸 제품 이미지" subtitle="상세페이지에 들어갈 이미지를 업로드하세요 (최대 5개)">
        <ImageUploader
          images={form.uploadedImages}
          onChange={(images: UploadedImage[]) => updateField("uploadedImages", images)}
        />
      </Section>

      {/* 기본 정보 */}
      <Section title="📝 제품 기본 정보">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              제품명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.productName}
              onChange={(e) => updateField("productName", e.target.value)}
              placeholder="예: 프리미엄 항균 에어프라이어 5.5L"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              제품 설명
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="제품의 특징, 장점, 사용법 등을 자세히 입력하세요"
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              타겟 고객
            </label>
            <input
              type="text"
              value={form.targetAudience}
              onChange={(e) => updateField("targetAudience", e.target.value)}
              placeholder="예: 1인 가구, 건강을 중시하는 30-40대"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
      </Section>

      {/* 핵심 셀링포인트 */}
      <Section title="✨ 핵심 셀링포인트" subtitle="고객에게 어필할 핵심 장점 (최대 5개)">
        <div className="space-y-2">
          {form.keySellingPoints.map((point, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-blue-500 font-bold text-sm w-5">{i + 1}.</span>
              <input
                type="text"
                value={point}
                onChange={(e) => updateSellingPoint(i, e.target.value)}
                placeholder={`셀링포인트 ${i + 1} (예: 360도 열풍 순환으로 균일한 조리)`}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {form.keySellingPoints.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSellingPoint(i)}
                  className="text-red-400 hover:text-red-600 text-lg font-bold px-2"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {form.keySellingPoints.length < 5 && (
            <button
              type="button"
              onClick={addSellingPoint}
              className="text-sm text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 mt-1"
            >
              <span>+</span> 셀링포인트 추가
            </button>
          )}
        </div>
      </Section>

      {/* 제품 스펙 */}
      <Section title="📊 제품 스펙" subtitle="규격, 소재, 용량 등 상세 제원">
        <SpecsEditor
          specs={form.specifications}
          onChange={(specs: Specification[]) => updateField("specifications", specs)}
        />
      </Section>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* 생성 버튼 */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <span className="animate-spin text-2xl">✨</span>
            <span>AI가 상세페이지를 만들고 있어요...</span>
          </>
        ) : (
          <>
            <span>🚀</span>
            <span>상세페이지 생성하기</span>
          </>
        )}
      </button>
      {loading && (
        <p className="text-center text-sm text-gray-500 animate-pulse">
          이미지 분석 및 카피라이팅 중... 약 20-40초 소요됩니다
        </p>
      )}
    </form>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-800 mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  );
}
