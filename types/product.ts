export type TemplateType = "coupang" | "smartstore" | "premium";

export interface Specification {
  key: string;
  value: string;
}

export interface UploadedImage {
  base64: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  name: string;
}

export interface VideoInput {
  url: string;
  caption?: string;
}

export interface ProductInputBase {
  productName: string;
  description: string;
  specifications: Specification[];
  targetAudience: string;
  keySellingPoints: string[];
  uploadedImages: UploadedImage[];
}

export interface CoupangInput extends ProductInputBase {
  template: "coupang";
  originalPrice: string;
  discountRate: string;
  finalPrice: string;
  deliveryInfo: string;
  certificationBadges: string[];
  reviewHighlights: string[];
  rocketBadge: boolean;
}

export interface SmartstoreInput extends ProductInputBase {
  template: "smartstore";
  brandStory: string;
  productOrigin: string;
  sourcingStory: string;
  hashtags: string[];
  qaItems: { question: string; answer: string }[];
  ingredientDetails: string;
  certifications: string[];
  naverPayBadge: boolean;
}

export interface PremiumInput extends ProductInputBase {
  template: "premium";
  brandHeritage: string;
  materialsStory: string;
  limitedEditionInfo: string;
  unboxingDescription: string;
  endorsements: { name: string; quote: string; platform: string }[];
  videos: VideoInput[];
  collectionName: string;
}

export type TemplateInput = CoupangInput | SmartstoreInput | PremiumInput;

export interface GeneratedPage {
  id: string;
  html: string;
  createdAt: number;
}

export interface GenerateResponse {
  id: string;
  previewUrl: string;
}
