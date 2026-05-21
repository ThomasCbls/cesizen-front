// app/hooks/useUser.ts
'use client'

import { config } from '@/lib/config'
import type { User } from '@/types'
import { useEffect, useState } from 'react'

export const useUser = () => {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem(config.authUserKey)
    if (storedUser) {
      setUserState(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const setUser = (updatedUser: User | null) => {
    setUserState(updatedUser)
    if (updatedUser) {
      localStorage.setItem(config.authUserKey, JSON.stringify(updatedUser))
    } else {
      localStorage.removeItem(config.authUserKey)
    }
  }

  return { user, userId: user?.id, isLoading, setUser }
}
