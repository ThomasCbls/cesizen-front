'use client'

// ======================================================================
// 🧠 PAGE DIAGNOSTIC STRESS - CESIZen
// ======================================================================

import { useRequireAuth } from '@/contexts'
import DiagnosticView from './DiagnosticView/DiagnosticView'

export default function DiagnosticPage() {
  // Protection de la route - redirection auto si non authentifié
  useRequireAuth()

  return <DiagnosticView />
}
