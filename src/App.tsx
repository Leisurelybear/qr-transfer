import { Routes, Route, NavLink } from 'react-router-dom'
import SendPage from './send/SendPage'
import ReceivePage from './receive/ReceivePage'

function NavBar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex-1 text-center py-3 font-medium transition-colors ${
      isActive
        ? 'text-white border-b-2 border-blue-500'
        : 'text-gray-400 hover:text-gray-200'
    }`

  return (
    <nav className="flex bg-gray-800 border-b border-gray-700">
      <NavLink to="/send" className={linkClass}>
        Send
      </NavLink>
      <NavLink to="/receive" className={linkClass}>
        Receive
      </NavLink>
    </nav>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <NavBar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<SendPage />} />
          <Route path="/send" element={<SendPage />} />
          <Route path="/receive" element={<ReceivePage />} />
        </Routes>
      </div>
    </div>
  )
}
