import { TemplateType, TemplateInput } from "@/types/product";

const BASE_DEFAULTS = {
  productName: "",
  description: "",
  specifications: [{ key: "", value: "" }],
  targetAudience: "",
  keySellingPoints: ["", "", ""],
  uploadedImages: [],
};

export function createDefaultForm(template: TemplateType): TemplateInput {
  switch (template) {
    case "coupang":
      return {
        ...BASE_DEFAULTS,
        template: "coupang",
        originalPrice: "",
        discountRate: "",
        finalPrice: "",
        deliveryInfo: "",
        certificationBadges: [],
        reviewHighlights: ["", "", ""],
        rocketBadge: true,
      };
    case "smartstore":
      return {
        ...BASE_DEFAULTS,
        template: "smartstore",
        brandStory: "",
        productOrigin: "",
        sourcingStory: "",
        hashtags: [],
        qaItems: [{ question: "", answer: "" }],
        ingredientDetails: "",
        certifications: [],
        naverPayBadge: true,
      };
    case "premium":
      return {
        ...BASE_DEFAULTS,
        template: "premium",
        brandHeritage: "",
        materialsStory: "",
        limitedEditionInfo: "",
        unboxingDescription: "",
        endorsements: [{ name: "", quote: "", platform: "Instagram" }],
        videos: [],
        collectionName: "",
      };
  }
}
