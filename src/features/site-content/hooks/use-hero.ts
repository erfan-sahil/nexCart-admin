import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getHero, heroQueryKey, saveHero, setHeroActive } from "../services"
import type { HeroSection } from "../types"

export function useHeroQuery() {
  return useQuery({
    queryKey: heroQueryKey,
    queryFn: getHero,
  })
}

export function useSaveHeroMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: HeroSection) => saveHero(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: heroQueryKey })
      const previous = queryClient.getQueryData<HeroSection>(heroQueryKey)
      queryClient.setQueryData(heroQueryKey, input)
      return { previous }
    },
    onSuccess: (hero) => {
      queryClient.setQueryData(heroQueryKey, hero)
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(heroQueryKey, context.previous)
      }
    },
  })
}

export function useSetHeroActiveMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ index, isActive }: { index: number; isActive: boolean }) =>
      setHeroActive(index, isActive),
    onMutate: async ({ index, isActive }) => {
      await queryClient.cancelQueries({ queryKey: heroQueryKey })
      const previous = queryClient.getQueryData<HeroSection>(heroQueryKey)

      if (previous) {
        queryClient.setQueryData<HeroSection>(heroQueryKey, {
          slides: previous.slides.map((slide, slideIndex) =>
            slideIndex === index ? { ...slide, isActive } : slide
          ),
        })
      }

      return { previous }
    },
    onSuccess: (hero) => {
      queryClient.setQueryData(heroQueryKey, hero)
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(heroQueryKey, context.previous)
      }
    },
  })
}
