'use client'

// ======================================================================
// 📈 PAGE HISTORIQUE DIAGNOSTICS - CESIZen
// ======================================================================

import { useRequireAuth } from '@/contexts'
import HistoryView from './HistoryView/HistoryView'

export default function HistoryPage() {
  // Protection de la route - redirection auto si non authentifié
  useRequireAuth()

  return <HistoryView />
}
