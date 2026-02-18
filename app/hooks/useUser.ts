// app/hooks/useUser.ts
'use client'

import { useEffect, useState } from 'react'

export const useUser = () => {
  const [user, setUser] = useState(null)
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
