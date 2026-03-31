'use client'

// ======================================================================
// 🔍 PAGE DETAIL DIAGNOSTIC - CESIZen
// ======================================================================

import { useRequireAuth } from '@/contexts'
import DiagnosticDetailView from '../DiagnosticDetailView/DiagnosticDetailView'

interface DiagnosticDetailPageProps {
  params: {
    diagnosticId: string
  }
}

export default function DiagnosticDetailPage({ params }: DiagnosticDetailPageProps) {
  // Protection de la route
  useRequireAuth()

  return <DiagnosticDetailView diagnosticId={params.diagnosticId} />
}
