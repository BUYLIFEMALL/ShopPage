"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PreviewFrame from "@/components/PreviewFrame";
import ExportButton from "@/components/ExportButton";

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPage() {
      try {
        const res = await fetch(`/api/page/${id}`);
        if (!res.ok) {
          setError("페이지를 찾을 수 없습니다. 이미 만료되었을 수 있습니다.");
          return;
        }
        const data = await res.json();
        setHtml(data.html);
      } catch {
        setError("페이지를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🎨</div>
          <p className="text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !html) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">😥</div>
          <p className="text-gray-700 font-medium mb-4">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            다시 생성하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 바 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
            >
              ← 다시 만들기
            </button>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-semibold text-gray-700">✅ 상세페이지 완성!</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 다운로드 버튼 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">📥 다운로드</h2>
          <ExportButton pageId={id} html={html} />
        </div>

        {/* 미리보기 */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">👀 미리보기</h2>
          <PreviewFrame html={html} />
        </div>
      </div>
    </div>
  );
}
