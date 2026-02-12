import {
  TemplateInput,
  CoupangInput,
  SmartstoreInput,
  PremiumInput,
  ProductInputBase,
} from "@/types/product";

export function buildSystemPrompt(template: TemplateInput["template"]): string {
  const base = `당신은 한국 이커머스 상세페이지 전문 디자이너이자 카피라이터입니다.

반드시 지켜야 할 규칙:
1. 완전한 HTML 문서만 출력하세요 (<!DOCTYPE html>부터 </html>까지).
2. 마크다운, 설명 텍스트, 코드블록 없이 순수 HTML만 출력하세요.
3. 모든 CSS는 <style> 태그 안에 인라인으로 작성하세요. 외부 CSS 파일 링크 금지.
4. Google Fonts (Noto Sans KR)만 외부 링크로 허용합니다.
5. 첨부된 이미지들을 HTML <img> 태그로 배치할 때 src 값을 반드시 [IMAGE_1], [IMAGE_2], [IMAGE_3] 형태의 플레이스홀더로 작성하세요.
6. JavaScript는 <script> 태그 안에 인라인으로 작성하세요. 외부 JS 파일 링크 금지.
7. 모바일 우선 반응형 디자인 (최대 너비 600px 기준).
8. 세로로 긴 레이아웃 (총 콘텐츠 높이 최소 3000px 이상).`;

  const guide: Record<TemplateInput["template"], string> = {
    coupang: `
9. 쿠팡 스타일 전문가입니다. 빨간색(#cc0000)과 흰색 중심, 굵은 가격 강조, 긴박감 요소, 로켓배송 뱃지가 특징입니다.`,
    smartstore: `
9. 네이버 스마트스토어 스타일 전문가입니다. 초록색(#03c75a)과 흰색 중심, 브랜드 스토리텔링, 신뢰 요소, 커뮤니티 감성이 특징입니다.`,
    premium: `
9. 프리미엄/럭셔리 브랜드 상세페이지 전문가입니다. 다크(#1a1a1a)와 골드(#b8960c) 중심, 미니멀 타이포그래피, 전폭 이미지, 희소성 강조가 특징입니다.`,
  };

  return base + guide[template];
}

export function buildUserPrompt(input: TemplateInput): string {
  switch (input.template) {
    case "coupang":
      return buildCoupangPrompt(input);
    case "smartstore":
      return buildSmartstorePrompt(input);
    case "premium":
      return buildPremiumPrompt(input);
  }
}

function buildBaseSection(input: ProductInputBase): string {
  const specsRows = input.specifications
    .filter((s) => s.key && s.value)
    .map((s) => `  - ${s.key}: ${s.value}`)
    .join("\n");

  const imageInstructions =
    input.uploadedImages.length > 0
      ? input.uploadedImages
          .map((img, i) => `- [IMAGE_${i + 1}]: ${img.name}`)
          .join("\n")
      : "이미지 없음";

  return `다음 제품의 한국식 이커머스 상세페이지 HTML을 생성해주세요.

## 제품 기본 정보
- **제품명**: ${input.productName}
- **설명**: ${input.description}
- **타겟 고객**: ${input.targetAudience || "일반 소비자"}
- **핵심 셀링포인트**:
${input.keySellingPoints.filter(Boolean).map((p, i) => `  ${i + 1}. ${p}`).join("\n") || "  없음"}

## 제품 스펙
${specsRows || "스펙 정보 없음"}

## 이미지 플레이스홀더 (반드시 준수)
${imageInstructions}
반드시 <img src="[IMAGE_1]">, <img src="[IMAGE_2]"> 형태로 사용하세요.`;
}

function buildCoupangPrompt(input: CoupangInput): string {
  const base = buildBaseSection(input);

  return `${base}

## 쿠팡 스타일 전용 정보
- **원가**: ${input.originalPrice || "미입력"}
- **할인율**: ${input.discountRate ? input.discountRate + "%" : "미입력"}
- **판매가**: ${input.finalPrice || "미입력"}
- **배송 정보**: ${input.deliveryInfo || "로켓배송"}
- **로켓배송 뱃지**: ${input.rocketBadge ? "표시" : "미표시"}
- **인증 배지**: ${input.certificationBadges.filter(Boolean).join(", ") || "없음"}

## 고객 리뷰 하이라이트
${input.reviewHighlights.filter(Boolean).map((r) => `- "${r}"`).join("\n") || "없음"}

## 필수 포함 섹션 (쿠팡 스타일)

### 1. 히어로: 가격 강타 배너
- 빨간 배경(#cc0000)에 원가/할인율/판매가 크게 표시
- "오늘만 특가" + 카운트다운 타이머
- 로켓배송 뱃지 (입력된 경우)

### 2. 긴박감 / 재고 경고 배너
- "⚡ 재고 N개 남음!" + 프로그레스 바

### 3. 핵심 스펙 카드 (3~5개)
- 빨간 아이콘 + 텍스트

### 4. 인증 뱃지 섹션
- 배지 아이콘 + 인증명

### 5. 고객 리뷰 하이라이트
- 별점 5개 + 리뷰 텍스트 카드 (입력된 경우)

### 6. 제품 이미지 갤러리 (모든 [IMAGE_N] 사용)

### 7. 스펙 테이블

### 8. CTA 섹션
- 빨간 "지금 구매하기" + 회색 "장바구니 담기"

## 디자인 요구사항
- 색상: 빨강(#cc0000), 흰색, 노랑(#ffd600)
- Noto Sans KR 폰트 700/900 weight
- 카운트다운 타이머, 숫자 카운트업, 스크롤 페이드인 애니메이션`;
}

function buildSmartstorePrompt(input: SmartstoreInput): string {
  const base = buildBaseSection(input);

  const qaText =
    input.qaItems.filter((q) => q.question).length > 0
      ? input.qaItems
          .filter((q) => q.question)
          .map((q) => `Q: ${q.question}\nA: ${q.answer || "답변 미입력"}`)
          .join("\n\n")
      : "Q&A 없음";

  return `${base}

## 스마트스토어 전용 정보
- **브랜드 스토리**: ${input.brandStory || "미입력"}
- **원산지/생산지**: ${input.productOrigin || "미입력"}
- **소싱 스토리**: ${input.sourcingStory || "미입력"}
- **해시태그**: ${input.hashtags.filter(Boolean).join(" ") || "없음"}
- **성분/소재 상세**: ${input.ingredientDetails || "미입력"}
- **인증 정보**: ${input.certifications.filter(Boolean).join(", ") || "없음"}
- **네이버페이 뱃지**: ${input.naverPayBadge ? "표시" : "미표시"}

## Q&A
${qaText}

## 필수 포함 섹션 (스마트스토어 스타일)

### 1. 브랜드 스토리 히어로
- 감성적인 라이프스타일 이미지 ([IMAGE_1])
- 브랜드 스토리 인용 형식 표시

### 2. 원산지/소싱 스토리 섹션
- 지도 아이콘 + 원산지 설명
- 소싱 스토리 산문체

### 3. 핵심 특징 카드 (3~5개)
- 초록 테마 카드

### 4. 성분/소재 상세 섹션

### 5. 인증 뱃지 그리드

### 6. Q&A 아코디언
- 질문/답변 토글 (JavaScript)

### 7. 해시태그 클라우드

### 8. 이미지 갤러리 (모든 [IMAGE_N] 사용)

### 9. 스펙 테이블

### 10. 네이버페이 CTA
- 초록 "네이버페이로 구매" + "찜하기"

## 디자인 요구사항
- 색상: 초록(#03c75a), 흰색, 연회색(#f5f5f5)
- 라이프스타일 감성, 여백 넉넉히
- Noto Sans KR 폰트, 스크롤 페이드인 애니메이션`;
}

function buildPremiumPrompt(input: PremiumInput): string {
  const base = buildBaseSection(input);

  const endorsementText =
    input.endorsements.filter((e) => e.name).length > 0
      ? input.endorsements
          .filter((e) => e.name)
          .map((e) => `- ${e.name} (${e.platform}): "${e.quote}"`)
          .join("\n")
      : "없음";

  const videoText =
    input.videos.length > 0
      ? input.videos
          .map(
            (v, i) =>
              `- 영상 ${i + 1}: ${v.url}${v.caption ? ` (${v.caption})` : ""}\n  → HTML에 <!-- VIDEO_${i + 1}_PLACEHOLDER: ${v.url} --> 주석 삽입 + 검은 배경 재생버튼 UI 표시`
          )
          .join("\n")
      : "없음";

  return `${base}

## 프리미엄 전용 정보
- **브랜드 헤리티지**: ${input.brandHeritage || "미입력"}
- **소재/장인정신 스토리**: ${input.materialsStory || "미입력"}
- **컬렉션명**: ${input.collectionName || "미입력"}
- **한정판 정보**: ${input.limitedEditionInfo || "해당 없음"}
- **언박싱 경험**: ${input.unboxingDescription || "미입력"}

## 인플루언서/셀럽 추천
${endorsementText}

## 영상 (Puppeteer 렌더링 제외 → 플레이스홀더 처리)
${videoText}

## 필수 포함 섹션 (프리미엄 스타일)

### 1. 풀스크린 히어로
- 다크 배경에 골드 텍스트
- 컬렉션명 + 브랜드명 + 한 줄 철학 문구
- [IMAGE_1] 전폭 배치

### 2. 브랜드 헤리티지 섹션
- 타임라인 형식 또는 산문 + 이미지 교차 배치

### 3. 소재/장인정신 섹션
- 클로즈업 이미지 ([IMAGE_2]) + 소재 스토리

### 4. 한정판 배너 (입력된 경우)
- "Limited Edition" 골드 뱃지

### 5. 언박싱 경험 섹션
- 패키지 이미지 + 설명 문구

### 6. 영상 플레이스홀더 섹션 (영상 입력된 경우)
- <!-- VIDEO_N_PLACEHOLDER: url --> 주석 삽입
- 검은 배경 + 재생 아이콘 UI 렌더링

### 7. 인플루언서 추천 갤러리
- 다크 카드에 인용 + 이름 + 플랫폼

### 8. 이미지 갤러리 ([IMAGE_N] 모두 사용)

### 9. 스펙 테이블 (다크 테마)

### 10. CTA
- 골드 "지금 주문하기" + "컬렉션 보기"

## 디자인 요구사항
- 색상: 다크(#1a1a1a), 골드(#b8960c), 흰색
- 미니멀 타이포그래피, 풍부한 여백
- 느린 페이드인 애니메이션, 고급스러운 hover 효과
- Noto Sans KR 폰트 (400, 700, 900 weight)`;
}
