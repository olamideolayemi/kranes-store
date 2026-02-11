import { useQuery } from '@tanstack/react-query'
import { experimentsApi } from '../services/api'

export const useExperiment = () => {
  return useQuery({
    queryKey: ['experiments'],
    queryFn: experimentsApi.getAssignments,
    staleTime: 5 * 60_000,
  })
}
