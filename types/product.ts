export interface Specification {
  key: string;
  value: string;
}

export interface UploadedImage {
  base64: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  name: string;
}

export interface ProductInput {
  productName: string;
  description: string;
  specifications: Specification[];
  targetAudience: string;
  keySellingPoints: string[];
  uploadedImages: UploadedImage[];
}

export interface GeneratedPage {
  id: string;
  html: string;
  createdAt: number;
}

export interface GenerateResponse {
  id: string;
  previewUrl: string;
}
