import { Routes, Route } from 'react-router-dom'
import SendPage from './send/SendPage'
import ReceivePage from './receive/ReceivePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SendPage />} />
      <Route path="/send" element={<SendPage />} />
      <Route path="/receive" element={<ReceivePage />} />
    </Routes>
  )
}
