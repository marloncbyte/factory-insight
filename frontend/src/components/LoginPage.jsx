import { useState } from "react"

const CREDENTIALS = [
  {
    email: "admin@datacenter.io",
    password: "dc2026",
    name: "Rafael Mendes",
    role: "Administrador",
  },
  {
    email: "analyst@datacenter.io",
    password: "energy1",
    name: "Camila Souza",
    role: "Analista de Energia",
  },
]

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    setTimeout(() => {
      const user = CREDENTIALS.find(
        (c) => c.email === email && c.password === password,
      )

      if (user) {
        onLogin({ name: user.name, role: user.role })
      } else {
        setError("Credenciais inválidas. Verifique e-mail e senha.")
      }

      setLoading(false)
    }, 800)
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--background)" }}
    >
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 p-12 relative overflow-hidden"
        style={{
          background: "var(--card)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow */}
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "var(--primary)" }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div
              className="w-8 h-8 rounded-sm flex items-center justify-center"
              style={{ background: "var(--primary)" }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="6" height="6" fill="#080b11" />
                <rect
                  x="10"
                  y="2"
                  width="6"
                  height="6"
                  fill="#080b11"
                  opacity=".6"
                />
                <rect
                  x="2"
                  y="10"
                  width="6"
                  height="6"
                  fill="#080b11"
                  opacity=".6"
                />
                <rect x="10" y="10" width="6" height="6" fill="#080b11" />
              </svg>
            </div>

            <span
              className="font-display text-sm font-semibold tracking-widest uppercase"
              style={{ color: "var(--foreground)" }}
            >
              EnergyCore DC
            </span>
          </div>

          <div>
            <h1
              className="font-display text-4xl font-700 leading-tight mb-4"
              style={{
                color: "var(--foreground)",
                fontWeight: 700,
              }}
            >
              Monitoramento de
              <br />
              <span style={{ color: "var(--primary)" }}>
                Consumo Energético
              </span>
            </h1>

            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--muted-foreground)" }}
            >
              Plataforma restrita para análise de eficiência energética, PUE,
              carga de resfriamento e emissões de CO₂ em tempo real.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { label: "Racks monitorados", value: "148" },
            { label: "Consumo atual", value: "4.2 MW" },
            { label: "PUE médio", value: "1.38" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex justify-between items-center py-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <span
                className="text-xs uppercase tracking-widest"
                style={{ color: "var(--muted-foreground)" }}
              >
                {stat.label}
              </span>

              <span
                className="font-mono text-sm font-bold"
                style={{ color: "var(--primary)" }}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-12 lg:hidden">
            <div
              className="w-7 h-7 rounded-sm flex items-center justify-center"
              style={{ background: "var(--primary)" }}
            >
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="6" height="6" fill="#080b11" />
                <rect
                  x="10"
                  y="2"
                  width="6"
                  height="6"
                  fill="#080b11"
                  opacity=".6"
                />
                <rect
                  x="2"
                  y="10"
                  width="6"
                  height="6"
                  fill="#080b11"
                  opacity=".6"
                />
                <rect x="10" y="10" width="6" height="6" fill="#080b11" />
              </svg>
            </div>

            <span
              className="font-display text-sm font-semibold tracking-widest uppercase"
              style={{ color: "var(--foreground)" }}
            >
              EnergyCore DC
            </span>
          </div>

          <div className="mb-10">
            <h2
              className="font-display text-2xl font-semibold mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Acesso restrito
            </h2>

            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Insira suas credenciais corporativas para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-xs font-medium uppercase tracking-widest mb-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                E-mail corporativo
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@datacenter.io"
                required
                className="w-full px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  borderRadius: "var(--radius)",
                  fontFamily: "inherit",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--primary)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border)")
                }
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium uppercase tracking-widest mb-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                Senha
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  borderRadius: "var(--radius)",
                  fontFamily: "inherit",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--primary)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border)")
                }
              />
            </div>

            {error && (
              <div
                className="px-4 py-3 text-xs"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#f87171",
                  borderRadius: "var(--radius)",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-semibold tracking-wide transition-all mt-2"
              style={{
                background: loading ? "rgba(0,200,255,0.6)" : "var(--primary)",
                color: "var(--primary-foreground)",
                borderRadius: "var(--radius)",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: "0.05em",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "#22d8ff"
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "var(--primary)"
                }
              }}
            >
              {loading ? "Autenticando..." : "Entrar"}
            </button>
          </form>

          <div
            className="mt-10 pt-6"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <p
              className="text-xs text-center"
              style={{ color: "var(--muted-foreground)" }}
            >
              Problemas de acesso? Contate{" "}
              <span style={{ color: "var(--primary)", cursor: "pointer" }}>
                ti@datacenter.io
              </span>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs" style={{ color: "var(--border)" }}>
              Acesso monitorado · Sessão auditada
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
