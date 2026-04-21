'use client'

// 🔍 PAGE DETAIL DIAGNOSTIC - CESIZen

import { useRequireAuth } from '@/contexts'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'

const DiagnosticDetailView = dynamic(() => import('../DiagnosticDetailView/DiagnosticDetailView'), {
  ssr: false,
})

export default function DiagnosticDetailPage() {
  const params = useParams()
  const diagnosticId = params.diagnosticId as string
  // Protection de la route
  useRequireAuth()

  return <DiagnosticDetailView diagnosticId={diagnosticId} />
}
