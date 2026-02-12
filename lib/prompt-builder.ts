import { ProductInput } from "@/types/product";

export function buildSystemPrompt(): string {
  return `당신은 한국 이커머스 상세페이지 전문 디자이너이자 카피라이터입니다.
쿠팡, 스마트스토어 스타일의 상세페이지 HTML을 생성하는 최고의 전문가입니다.

반드시 지켜야 할 규칙:
1. 완전한 HTML 문서만 출력하세요 (<!DOCTYPE html>부터 </html>까지).
2. 마크다운, 설명 텍스트, 코드블록 없이 순수 HTML만 출력하세요.
3. 모든 CSS는 <style> 태그 안에 인라인으로 작성하세요. 외부 CSS 파일 링크 금지.
4. Google Fonts (Noto Sans KR)만 외부 링크로 허용합니다.
5. 첨부된 이미지들을 HTML <img> 태그로 배치할 때 src 값을 반드시 [IMAGE_1], [IMAGE_2], [IMAGE_3] 형태의 플레이스홀더로 작성하세요. (예: <img src="[IMAGE_1]" alt="제품 이미지">)
6. JavaScript는 <script> 태그 안에 인라인으로 작성하세요. 외부 JS 파일 링크 금지.
7. 모바일 우선 반응형 디자인 (최대 너비 600px 기준).
8. 세로로 긴 레이아웃 (총 콘텐츠 높이 최소 3000px 이상).`;
}

export function buildUserPrompt(input: ProductInput): string {
  const specsRows = input.specifications
    .map((s) => `<tr><td>${s.key}</td><td>${s.value}</td></tr>`)
    .join("\n");

  const imageInstructions =
    input.uploadedImages.length > 0
      ? input.uploadedImages
          .map((img, i) => `- 이미지 ${i + 1}: ${img.name} (위에 첨부된 ${i + 1}번째 이미지)`)
          .join("\n")
      : "이미지 없음";

  return `다음 제품의 한국식 이커머스 상세페이지 HTML을 생성해주세요.

## 제품 정보
- **제품명**: ${input.productName}
- **설명**: ${input.description}
- **타겟 고객**: ${input.targetAudience || "일반 소비자"}
- **핵심 셀링포인트**:
${input.keySellingPoints.filter(Boolean).map((p, i) => `  ${i + 1}. ${p}`).join("\n")}

## 제품 스펙
${input.specifications.length > 0 ? specsRows : "스펙 정보 없음"}

## 이미지 사용 방법 (매우 중요!)
위에 첨부된 이미지들을 아래와 같이 src 플레이스홀더로 HTML에 삽입하세요:
${imageInstructions}
반드시 <img src="[IMAGE_1]">, <img src="[IMAGE_2]"> 형태로 사용하세요.

## 필수 포함 섹션 (쿠킹요소 - 고객 관심을 끄는 핵심 요소)

### 1. 히어로 섹션 - 강렬한 감성 헤드라인
- 제품의 감성/가치를 담은 강력한 한국어 카피라이팅
- 메인 제품 이미지 (첫 번째 업로드 이미지 사용)
- 부제목으로 핵심 가치 전달

### 2. 긴박감 배너
- 배경색: #ff0000 또는 주황색 계열
- 텍스트: "⚡ 한정 특가 · 오늘만 XX% 할인" 스타일
- 카운트다운 타이머 UI (JavaScript로 실시간 작동)

### 3. 핵심 기능 하이라이트
- 3~5개 기능을 카드 형태로 표시
- 각 카드에 큰 이모지 아이콘 + 제목 + 설명
- 스크롤 시 페이드인 애니메이션

### 4. 비포/애프터 비교 섹션
- 제품 사용 전/후 상황 비교
- 시각적으로 대비되는 레이아웃 (좌/우 또는 상/하)

### 5. 사회적 증거 / 통계 카운터
- 숫자 강조: "98% 고객 만족도", "누적 판매 10만개+" 등 제품에 맞게
- 숫자가 스크롤 시 카운트업 애니메이션

### 6. 제품 사진 갤러리
- 모든 업로드된 이미지를 레이아웃에 배치
- 대형 이미지와 소형 이미지 혼합 배치

### 7. 스펙 테이블
- 깔끔한 표 디자인 (교차 행 색상)
- 제품명, 스펙 항목들

### 8. CTA (구매 유도) 섹션
- "지금 구매하기" 버튼 (강렬한 색상, 크게)
- "장바구니 담기" 보조 버튼
- 재고 경고 문구 ("재고 ${Math.floor(Math.random() * 20) + 5}개 남음!")

## 디자인 요구사항
- CSS 스크롤 애니메이션: Intersection Observer API로 섹션 진입 시 페이드인/슬라이드인
- 숫자 카운트업 애니메이션 (사회적 증거 섹션)
- 카운트다운 타이머 (긴박감 배너)
- 색상 테마: 제품 분위기에 맞게 선택 (프리미엄이면 다크/골드, 생활용품이면 밝고 신선한 색상)
- Noto Sans KR 폰트 (400, 700, 900 weight)
- 각 섹션 사이 충분한 여백
- 그림자, 둥근 모서리로 현대적인 느낌`;
}
