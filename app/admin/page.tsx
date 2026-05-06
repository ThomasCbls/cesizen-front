'use client'

import { useAuth } from '@/contexts'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (user?.role === 'ADMIN') {
      router.replace('/admin/dashboard')
    } else {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  return null
}
