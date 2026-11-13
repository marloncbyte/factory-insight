import { useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
const DATACENTER_ID = import.meta.env.VITE_DATACENTER_ID || "1"
const periods = { "24h": 1, "7d": 7, "30d": 30 }
const chartColors = ["#00c8ff", "#38516f"]

const formatNumber = (value, digits = 2) =>
  Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

const formatDate = (value) =>
  new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  })

function KpiCard({ label, value, unit, detail, accent = false }) {
  return (
    <div
      className="p-5 flex flex-col gap-3"
      style={{
        background: "var(--card)",
        border: `1px solid ${accent ? "rgba(0,200,255,0.25)" : "var(--border)"}`,
        borderRadius: "var(--radius)",
        boxShadow: accent ? "0 0 20px rgba(0,200,255,0.06)" : "none",
      }}
    >
      <span className="text-xs uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-3xl font-bold leading-none" style={{ color: accent ? "var(--primary)" : "var(--foreground)" }}>
          {value}
        </span>
        {unit && <span className="text-sm font-mono" style={{ color: "var(--muted-foreground)" }}>{unit}</span>}
      </div>
      {detail && <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{detail}</span>}
    </div>
  )
}

function Panel({ children, className = "" }) {
  return (
    <section className={`p-5 ${className}`} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
      {children}
    </section>
  )
}

function EmptyChart({ text }) {
  return <div className="h-48 flex items-center justify-center text-sm" style={{ color: "var(--muted-foreground)" }}>{text}</div>
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 text-xs" style={{ background: "#0e1420", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--foreground)" }}>
      <div style={{ color: "var(--muted-foreground)", marginBottom: 4 }}>{label}</div>
      {payload.map((item) => (
        <div key={item.dataKey} className="font-mono font-bold">
          {formatNumber(item.value, 3)} {item.unit || "kWh"}
        </div>
      ))}
    </div>
  )
}

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("Visão Geral")
  const [selectedPeriod, setSelectedPeriod] = useState("24h")
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState("")
  const [period, setPeriod] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const end = new Date()
    const start = new Date(end.getTime() - periods[selectedPeriod] * 24 * 60 * 60 * 1000)
    const query = new URLSearchParams({ start: start.toISOString(), end: end.toISOString() })
    setLoading(true)
    setApiError("")
    setPeriod({ start, end })

    fetch(`${API_BASE_URL}/api/datacenters/${DATACENTER_ID}/energy-summary?${query}`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(body.detail || `A API respondeu HTTP ${response.status}.`)
        return body
      })
      .then((body) => setSummary(body))
      .catch((error) => {
        if (error.name !== "AbortError") {
          setSummary(null)
          setApiError(error.message || "Não foi possível conectar à API.")
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [selectedPeriod])

  const energyTotals = useMemo(() => summary ? [
    { name: "Total", kwh: Number(summary.energy_total_kwh) },
    { name: "TI", kwh: Number(summary.energy_it_kwh) },
  ] : [], [summary])

  const distribution = useMemo(() => {
    if (!summary) return []
    const total = Number(summary.energy_total_kwh)
    const it = Number(summary.energy_it_kwh)
    if (!total) return []
    const itShare = Math.round((it / total) * 100)
    return [
      { name: "TI", value: itShare },
      { name: "Demais cargas", value: 100 - itShare },
    ]
  }, [summary])

  const now = new Date().toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })
  const apiStatus = loading ? "CONSULTANDO" : summary ? "API CONECTADA" : "SEM CONEXÃO"
  const statusColor = loading ? "#fbbf24" : summary ? "#34d399" : "#f87171"

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--background)" }}>
      <header className="flex items-center justify-between px-6 py-3 shrink-0" style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-sm flex items-center justify-center" style={{ background: "var(--primary)" }}>
              <svg width="13" height="13" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="6" fill="#080b11"/><rect x="10" y="2" width="6" height="6" fill="#080b11" opacity=".6"/><rect x="2" y="10" width="6" height="6" fill="#080b11" opacity=".6"/><rect x="10" y="10" width="6" height="6" fill="#080b11"/></svg>
            </div>
            <span className="font-display text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--foreground)" }}>EnergyCore DC</span>
          </div>
          <div style={{ width: 1, height: 20, background: "var(--border)" }} />
          <nav className="flex items-center gap-1">
            {["Visão Geral", "Racks", "Histórico", "Relatórios"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className="px-3 py-1.5 text-xs font-medium transition-all" style={{ background: activeTab === tab ? "rgba(0,200,255,0.1)" : "transparent", color: activeTab === tab ? "var(--primary)" : "var(--muted-foreground)", borderRadius: "var(--radius)", border: "none", cursor: "pointer" }}>
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: statusColor }} /><span className="font-mono text-xs" style={{ color: statusColor }}>{apiStatus}</span></div>
          <div style={{ width: 1, height: 20, background: "var(--border)" }} />
          <div className="text-right hidden sm:block"><p className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{user.name}</p><p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{user.role}</p></div>
          <button onClick={onLogout} className="px-3 py-1.5 text-xs font-medium" style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--muted-foreground)", borderRadius: "var(--radius)", cursor: "pointer" }}>Sair</button>
        </div>
      </header>

      <div className="px-6 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <h1 className="font-display text-lg font-semibold" style={{ color: "var(--foreground)" }}>{activeTab === "Visão Geral" ? "Painel de Consumo Energético" : activeTab}</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {summary ? `${summary.datacenter.name} · ${summary.datacenter.location}` : "Datacenter EnergiaDC"} · Atualizado em {now}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {Object.keys(periods).map((p) => (
            <button key={p} onClick={() => setSelectedPeriod(p)} className="px-3 py-1 text-xs font-mono font-medium" style={{ background: selectedPeriod === p ? "var(--primary)" : "var(--card)", color: selectedPeriod === p ? "var(--primary-foreground)" : "var(--muted-foreground)", border: `1px solid ${selectedPeriod === p ? "var(--primary)" : "var(--border)"}`, borderRadius: "var(--radius)", cursor: "pointer" }}>{p}</button>
          ))}
        </div>
      </div>

      <main className="flex-1 p-6 overflow-y-auto">
        {apiError && (
          <div className="mb-5 px-4 py-3 text-sm" role="alert" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", borderRadius: "var(--radius)" }}>
            Não foi possível carregar os dados do backend: {apiError} Confira se a API Java está rodando em {API_BASE_URL}.
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Consumo Total" value={summary ? formatNumber(summary.energy_total_kwh, 0) : loading ? "…" : "—"} unit="kWh" detail={summary ? `${summary.reading_count} medições no período` : "Dados da API"} accent />
          <KpiCard label="PUE do Período" value={summary ? formatNumber(summary.pue, 2) : loading ? "…" : "—"} detail={summary ? `Limite configurado: ${formatNumber(summary.pue_limit, 2)}` : "Indicador de eficiência"} />
          <KpiCard label="Consumo de TI" value={summary ? formatNumber(summary.energy_it_kwh, 0) : loading ? "…" : "—"} unit="kWh" detail="Soma das medições do período" />
          <KpiCard label="Custo Estimado" value={summary ? formatNumber(summary.estimated_cost_brl, 2) : loading ? "…" : "—"} unit="R$" detail="Calculado pela tarifa cadastrada" />
        </div>

        {summary?.alert && (
          <div className="mb-5 px-4 py-3 flex items-start gap-3" role="status" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24", borderRadius: "var(--radius)" }}>
            <span className="font-bold">Atenção · PUE acima do limite</span><span className="text-sm">{summary.alert.message}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4 mb-4">
          <Panel className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div><h3 className="font-display text-sm font-semibold" style={{ color: "var(--foreground)" }}>Consumo do período</h3><p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Comparação entre energia total e consumo de TI</p></div>
              <span className="font-mono text-xs px-2 py-1" style={{ background: "rgba(0,200,255,0.08)", color: "var(--primary)", border: "1px solid rgba(0,200,255,0.2)", borderRadius: "var(--radius)" }}>kWh</span>
            </div>
            {summary ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={energyTotals}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="kwh" name="Energia" fill="#00c8ff" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart text={loading ? "Buscando dados da API…" : "Sem medições para exibir."} />}
          </Panel>

          <Panel>
            <h3 className="font-display text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>Distribuição Energética</h3>
            <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>TI e demais cargas calculadas a partir da API</p>
            {summary ? <>
              <ResponsiveContainer width="100%" height={145}>
                <PieChart><Pie data={distribution} dataKey="value" nameKey="name" innerRadius={43} outerRadius={65} stroke="none" paddingAngle={2}>{distribution.map((item, i) => <Cell key={item.name} fill={chartColors[i]} />)}</Pie><Tooltip formatter={(v) => [`${v}%`, ""]} contentStyle={{ background: "#0e1420", border: "1px solid var(--border)", borderRadius: "4px", fontSize: 11 }} itemStyle={{ color: "var(--foreground)" }} labelStyle={{ display: "none" }} /></PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">{distribution.map((item, i) => <div key={item.name} className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: chartColors[i] }} /><span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{item.name}</span></div><span className="font-mono text-xs font-bold" style={{ color: "var(--foreground)" }}>{item.value}%</span></div>)}</div>
            </> : <EmptyChart text={loading ? "Carregando…" : "Sem dados para exibir."} />}
          </Panel>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="font-display text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>Período consultado</h3>
            <p className="text-xs mb-5" style={{ color: "var(--muted-foreground)" }}>Intervalo recebido pelo backend Java</p>
            {summary && period ? <div className="space-y-4">
              <div><p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Início</p><p className="font-mono text-sm mt-1" style={{ color: "var(--foreground)" }}>{formatDate(summary.period.start)}</p></div>
              <div><p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Fim</p><p className="font-mono text-sm mt-1" style={{ color: "var(--foreground)" }}>{formatDate(summary.period.end)}</p></div>
              <div><p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Quantidade de leituras</p><p className="font-mono text-sm mt-1" style={{ color: "var(--primary)" }}>{summary.reading_count}</p></div>
            </div> : <EmptyChart text={loading ? "Consultando API…" : "Aguardando conexão com a API."} />}
          </Panel>
          <Panel>
            <h3 className="font-display text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>Alertas de eficiência</h3>
            <p className="text-xs mb-5" style={{ color: "var(--muted-foreground)" }}>Alertas calculados pelo backend</p>
            {summary ? summary.alert ? <div className="p-4" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: "var(--radius)" }}>
              <p className="text-sm font-semibold" style={{ color: "#fbbf24" }}>{summary.alert.type} · {summary.alert.severity}</p><p className="text-sm mt-2" style={{ color: "var(--foreground)" }}>{summary.alert.message}</p>
            </div> : <div className="p-4 text-sm" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399", borderRadius: "var(--radius)" }}>Nenhum alerta de PUE para este período.</div> : <EmptyChart text={loading ? "Consultando alertas…" : "Sem dados para consultar alertas."} />}
          </Panel>
        </div>
      </main>

      <footer className="px-6 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
        <span className="font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>EnergiaDC · Java Spring Boot</span>
        <div className="flex items-center gap-4"><span className="font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>Operador: {user.name}</span></div>
      </footer>
    </div>
  )
}
