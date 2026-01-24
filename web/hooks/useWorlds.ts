'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type World = Database['public']['Tables']['worlds']['Row']

export interface WorldWithDetails {
  world: World
  memberCount: number
  isMember: boolean
}

async function fetchWorlds(currentUserId?: string): Promise<WorldWithDetails[]> {
  const supabase = createClient()

  // Get all worlds
  const { data: worlds } = await supabase
    .from('worlds')
    .select('*')
    .order('created_at', { ascending: false })

  if (!worlds) return []

  // Get member counts and membership status for each world
  const worldsWithDetails = await Promise.all(
    worlds.map(async (world) => {
      const { count } = await supabase
        .from('world_members')
        .select('id', { count: 'exact', head: true })
        .eq('world_id', world.id)

      let isMember = false
      if (currentUserId) {
        const { data: membership } = await supabase
          .from('world_members')
          .select('id')
          .eq('world_id', world.id)
          .eq('user_id', currentUserId)
          .single()
        isMember = !!membership
      }

      return {
        world,
        memberCount: count || 0,
        isMember,
      }
    })
  )

  return worldsWithDetails
}

export function useWorlds(currentUserId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    ['worlds', currentUserId],
    () => fetchWorlds(currentUserId)
  )

  return {
    worlds: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  }
}
