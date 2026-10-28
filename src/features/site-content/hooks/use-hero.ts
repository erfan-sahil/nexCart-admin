import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getHero, heroQueryKey, saveHero } from "../services"
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
