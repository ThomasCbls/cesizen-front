import { BrowserRouter } from 'react-router'
import LogViewPage from './LogView/LogViewPage'
export default function Home() {
  return (
    <BrowserRouter>
      <LogViewPage />
    </BrowserRouter>
  )
}
