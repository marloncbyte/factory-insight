import { useState } from "react"
import LoginPage from "./components/LoginPage"
import Dashboard from "./components/Dashboard"

export default function App() {
  const [user, setUser] = useState(null)

  if (!user) {
    return <LoginPage onLogin={setUser} />
  }

  return <Dashboard user={user} onLogout={() => setUser(null)} />
}
