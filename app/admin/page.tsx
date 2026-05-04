'use client'

import { redirect } from 'next/navigation'
import { useAuth } from '@/contexts'

export default function AdminPage() {
  const { user } = useAuth()

  // Rediriger vers le dashboard admin
  if (user?.role === 'ADMIN') {
    redirect('/admin/dashboard')
  } else {
    redirect('/login')
  }

  return null
}
