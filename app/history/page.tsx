'use client'

import { useRequireAuth } from '@/contexts'
import dynamic from 'next/dynamic'

const HistoryView = dynamic(() => import('./HistoryView/HistoryView'), { ssr: false })

export default function HistoryPage() {
  // Protection de la route - redirection auto si non authentifié
  useRequireAuth()

  return <HistoryView />
}
