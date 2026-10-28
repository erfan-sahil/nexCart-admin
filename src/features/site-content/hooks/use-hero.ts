import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getHero, heroQueryKey, saveHero } from "../services"
import type { HeroInput } from "../types"

export function useHeroQuery() {
  return useQuery({
    queryKey: heroQueryKey,
    queryFn: getHero,
  })
}

export function useSaveHeroMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: HeroInput) => saveHero(input),
    onSuccess: (hero) => {
      queryClient.setQueryData(heroQueryKey, hero)
    },
  })
}
