export interface PricingPlan {
  credits: number
  price: number
  originalPrice: number
  pricePerCredit: number
  label: string
  description: string
  popular: boolean
  badge: string
}

export const pricingPlans: PricingPlan[] = [
  {
    credits: 10,
    price: 9.9,
    originalPrice: 12,
    pricePerCredit: 0.99,
    label: "入门包",
    description: "适合轻度使用",
    popular: false,
    badge: "热门"
  },
  {
    credits: 50,
    price: 45,
    originalPrice: 60,
    pricePerCredit: 0.9,
    label: "进阶包",
    description: "适合日常创作",
    popular: true,
    badge: "推荐"
  },
  {
    credits: 100,
    price: 80,
    originalPrice: 120,
    pricePerCredit: 0.8,
    label: "专业包",
    description: "适合深度使用",
    popular: false,
    badge: "超值"
  },
  {
    credits: 200,
    price: 140,
    originalPrice: 240,
    pricePerCredit: 0.7,
    label: "企业包",
    description: "适合大量创作",
    popular: false,
    badge: "最划算"
  },
] 