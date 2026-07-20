// 🔍 DEBUG - Voir l'URL API utilisée
// À placer dans un composant pour vérifier la configuration

export function DebugApiUrl() {
  if (typeof window === 'undefined') return null

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const localFallback = 'http://localhost:3000'

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        backgroundColor: '#f0f0f0',
        padding: '10px',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        maxWidth: '300px',
      }}
    >
      <div>
        <strong>DEBUG API URL</strong>
      </div>
      <div>
        NEXT_PUBLIC_API_URL: <br />
        <code style={{ color: apiUrl ? 'green' : 'red' }}>
          {apiUrl || `[NOT SET - using fallback: ${localFallback}]`}
        </code>
      </div>
      <div style={{ marginTop: '5px' }}>
        Environment: <code>{process.env.NEXT_PUBLIC_ENVIRONMENT || 'production'}</code>
      </div>
    </div>
  )
}
