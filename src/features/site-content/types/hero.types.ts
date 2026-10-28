export type HeroSlide = {
  eyebrow: string
  title: string
  description: string
  image: string
  isActive: boolean
}

export type HeroSection = {
  slides: HeroSlide[]
}
