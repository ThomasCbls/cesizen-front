// app/hooks/useUser.ts
'use client'

import { useEffect, useState } from 'react'
import type { User } from '@/types'

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  return { user, userId: user?.id, isLoading, setUser }
}
