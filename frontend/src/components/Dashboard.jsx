import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Area,
  AreaChart,
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
const PERIODS = { "24h": 1, "7d": 7, "30d": 30, "90d": 90 }
const TABS = ["Visão Geral", "Histórico", "Alertas", "Relatórios"]
const COLORS = ["#00c8ff", "#38516f"]

const money = (value) =>
  Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
const number = (value, digits = 2) =>
  Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })
const date = (value) =>
  value ? new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—"

async function apiFetch(path, options = {}) {
  const response = await fetch(API_BASE_URL + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(body.detail || "A API respondeu HTTP " + response.status + ".")
    error.status = response.status
    throw error
  }
  return body
}

function Panel({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={"p-5 " + className} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            {title && <h3 className="font-display text-sm font-semibold" style={{ color: "var(--foreground)" }}>{title}</h3>}
            {subtitle && <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

function Kpi({ label, value, unit, note, accent }) {
  return (
    <div className="p-5 flex flex-col gap-3" style={{ background: "var(--card)", border: "1px solid " + (accent ? "rgba(0,200,255,.3)" : "var(--border)"), borderRadius: "var(--radius)" }}>
      <span className="text-xs uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <div className="flex items-baseline gap-2">
        <strong className="font-mono text-2xl" style={{ color: accent ? "var(--primary)" : "var(--foreground)" }}>{value}</strong>
        {unit && <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{unit}</span>}
      </div>
      {note && <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{note}</span>}
    </div>
  )
}

function Empty({ children }) {
  return <div className="h-32 flex items-center justify-center text-sm text-center" style={{ color: "var(--muted-foreground)" }}>{children}</div>
}

function Table({ columns, rows, empty = "Nenhum registro encontrado." }) {
  if (!rows.length) return <Empty>{empty}</Empty>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>{columns.map((column) => <th key={column.key} className="text-left text-xs uppercase tracking-wider p-3" style={{ color: "var(--muted-foreground)", borderBottom: "1px solid var(--border)" }}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || row.key || index} style={{ borderBottom: "1px solid var(--border)" }}>
              {columns.map((column) => <td key={column.key} className="p-3" style={{ color: "var(--foreground)", whiteSpace: "nowrap" }}>{column.render ? column.render(row) : row[column.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Badge({ children, tone = "info" }) {
  const colors = {
    info: ["rgba(0,200,255,.1)", "#00c8ff"],
    warning: ["rgba(251,191,36,.1)", "#fbbf24"],
    critical: ["rgba(248,113,113,.1)", "#f87171"],
    ok: ["rgba(52,211,153,.1)", "#34d399"],
  }
  const selected = colors[tone] || colors.info
  return <span className="text-xs font-mono uppercase px-2 py-1" style={{ background: selected[0], color: selected[1], borderRadius: "4px" }}>{children}</span>
}

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("Visão Geral")
  const [selectedPeriod, setSelectedPeriod] = useState("7d")
  const [summary, setSummary] = useState(null)
  const [readings, setReadings] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState("")
  const [totalInput, setTotalInput] = useState("")
  const [itInput, setItInput] = useState("")

  const range = useMemo(() => {
    const end = new Date()
    const start = new Date(end.getTime() - PERIODS[selectedPeriod] * 86400000)
    return { start: start.toISOString(), end: end.toISOString() }
  }, [selectedPeriod])

  const reload = useCallback(async () => {
    setLoading(true)
    setError("")
    const query = "?start=" + encodeURIComponent(range.start) + "&end=" + encodeURIComponent(range.end)
    const base = "/api/datacenters/" + DATACENTER_ID
    const results = await Promise.allSettled([
      apiFetch(base + "/energy-summary" + query),
      apiFetch(base + "/readings" + query),
      apiFetch(base + "/alerts"),
    ])
    if (results[0].status === "fulfilled") setSummary(results[0].value)
    else {
      setSummary(null)
      if (results[0].reason.status !== 404) setError(results[0].reason.message)
    }
    if (results[1].status === "fulfilled") setReadings(results[1].value)
    else {
      setReadings([])
      if (!error && results[1].reason.status !== 404) setError(results[1].reason.message)
    }
    if (results[2].status === "fulfilled") setAlerts(results[2].value)
    else if (results[2].reason.status !== 404) setError(results[2].reason.message)
    setLoading(false)
  }, [range])

  useEffect(() => { reload() }, [reload])

  const periodAlerts = useMemo(() => {
    const start = new Date(range.start).getTime()
    const end = new Date(range.end).getTime()
    return alerts.filter((item) => {
      const stamp = new Date(item.reading_measured_at || item.created_at).getTime()
      return stamp >= start && stamp < end
    })
  }, [alerts, range])

  const daily = useMemo(() => {
    const groups = {}
    readings.forEach((item) => {
      const key = new Date(item.measured_at).toLocaleDateString("pt-BR")
      if (!groups[key]) groups[key] = { day: key, total: 0, it: 0, cost: 0, count: 0 }
      groups[key].total += Number(item.energy_total_kwh)
      groups[key].it += Number(item.energy_it_kwh)
      groups[key].cost += Number(item.estimated_cost_brl)
      groups[key].count += 1
    })
    return Object.values(groups)
  }, [readings])

  const distribution = useMemo(() => {
    if (!summary || !Number(summary.energy_total_kwh)) return []
    const total = Number(summary.energy_total_kwh)
    const it = Number(summary.energy_it_kwh)
    return [
      { name: "TI", value: Math.round((it / total) * 100) },
      { name: "Demais cargas", value: Math.round(((total - it) / total) * 100) },
    ]
  }, [summary])

  const exportCsv = () => {
    const rows = [["Data", "Consumo total (kWh)", "Consumo TI (kWh)", "PUE", "Custo estimado (R$)"]]
    readings.forEach((item) => rows.push([item.measured_at, item.energy_total_kwh, item.energy_it_kwh, item.pue, item.estimated_cost_brl]))
    const csv = "\uFEFF" + rows.map((row) => row.map((value) => '"' + String(value ?? "").replaceAll('"', '""') + '"').join(";")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "relatorio-energiadc.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  const registerReading = async (event) => {
    event.preventDefault()
    setBusy(true)
    setToast("")
    try {
      const result = await apiFetch("/api/datacenters/" + DATACENTER_ID + "/readings", {
        method: "POST",
        body: JSON.stringify({ energy_total_kwh: Number(totalInput), energy_it_kwh: Number(itInput) }),
      })
      setToast(result.alert ? "Medição registrada e alerta gerado." : "Medição registrada com sucesso.")
      setTotalInput("")
      setItInput("")
      await reload()
    } catch (err) {
      setToast(err.message)
    } finally {
      setBusy(false)
    }
  }

  const simulate = async () => {
    setBusy(true)
    setToast("")
    try {
      const result = await apiFetch("/api/datacenters/" + DATACENTER_ID + "/readings/simulate?hours=24", { method: "POST" })
      setToast("Simulação concluída: " + result.created + " leituras criadas, " + result.skipped + " ignoradas e " + result.alerts_created + " alertas.")
      await reload()
    } catch (err) {
      setToast(err.message)
    } finally {
      setBusy(false)
    }
  }

  const now = new Date().toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })
  const apiStatus = loading ? "CONSULTANDO" : error ? "SEM CONEXÃO" : "API CONECTADA"
  const statusColor = loading ? "#fbbf24" : error ? "#f87171" : "#34d399"

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <header className="px-5 py-4 flex flex-wrap items-center justify-between gap-4" style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-4 flex-wrap">
          <strong className="font-display text-sm tracking-widest uppercase" style={{ color: "var(--primary)" }}>EnergyCore DC</strong>
          <nav className="flex flex-wrap gap-1">
            {TABS.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className="px-3 py-2 text-xs" style={{ border: 0, borderRadius: "var(--radius)", background: activeTab === tab ? "rgba(0,200,255,.12)" : "transparent", color: activeTab === tab ? "var(--primary)" : "var(--muted-foreground)", cursor: "pointer" }}>{tab}</button>)}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono" style={{ color: statusColor }}>● {apiStatus}</span>
          <span className="hidden sm:inline text-xs" style={{ color: "var(--muted-foreground)" }}>{user?.name}</span>
          <button onClick={onLogout} className="px-3 py-2 text-xs" style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--foreground)", borderRadius: "var(--radius)" }}>Sair</button>
        </div>
      </header>

      <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <h1 className="font-display text-lg font-semibold" style={{ color: "var(--foreground)" }}>{activeTab === "Visão Geral" ? "Painel de Consumo Energético" : activeTab}</h1>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{summary?.datacenter?.name || "Datacenter EnergiaDC"} · Atualizado em {now}</p>
        </div>
        <div className="flex gap-2">
          {Object.keys(PERIODS).map((period) => <button key={period} onClick={() => setSelectedPeriod(period)} className="px-3 py-2 text-xs font-mono" style={{ background: selectedPeriod === period ? "var(--primary)" : "var(--card)", color: selectedPeriod === period ? "var(--primary-foreground)" : "var(--muted-foreground)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>{period}</button>)}
          <button onClick={reload} className="px-3 py-2 text-xs" style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--foreground)", borderRadius: "var(--radius)" }}>Atualizar</button>
        </div>
      </div>

      <main className="flex-1 p-5 md:p-6 space-y-5">
        {error && <div className="p-3 text-sm" role="alert" style={{ background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.3)", color: "#f87171", borderRadius: "var(--radius)" }}>{error} Confira se a API Java está ativa em {API_BASE_URL}.</div>}
        {toast && <div className="p-3 text-sm" role="status" style={{ background: "rgba(0,200,255,.08)", border: "1px solid rgba(0,200,255,.25)", color: "var(--foreground)", borderRadius: "var(--radius)" }}>{toast}</div>}

        {activeTab === "Visão Geral" && (
          <>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              <Kpi label="Consumo total" value={summary ? number(summary.energy_total_kwh, 0) : loading ? "…" : "—"} unit="kWh" note={summary ? summary.reading_count + " medições no período" : "Dados da API"} accent />
              <Kpi label="PUE do período" value={summary ? number(summary.pue) : loading ? "…" : "—"} note={summary ? "Limite: " + number(summary.pue_limit) : "Eficiência energética"} />
              <Kpi label="Consumo de TI" value={summary ? number(summary.energy_it_kwh, 0) : loading ? "…" : "—"} unit="kWh" note="Soma das medições" />
              <Kpi label="Custo estimado" value={summary ? money(summary.estimated_cost_brl) : loading ? "…" : "—"} note="Tarifa cadastrada" />
            </div>
            {summary?.alert && <div className="p-4 flex items-start gap-3" style={{ background: "rgba(251,191,36,.08)", border: "1px solid rgba(251,191,36,.3)", color: "#fbbf24", borderRadius: "var(--radius)" }}><strong>Alerta de PUE</strong><span className="text-sm">{summary.alert.message}</span></div>}
            <div className="grid lg:grid-cols-3 gap-4">
              <Panel title="Consumo do período" subtitle="Comparação entre energia total e consumo de TI" className="lg:col-span-2">
                {summary ? <ResponsiveContainer width="100%" height={250}><BarChart data={[{ name: "Total", kwh: Number(summary.energy_total_kwh) }, { name: "TI", kwh: Number(summary.energy_it_kwh) }]}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" /><XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} /><YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} /><Tooltip formatter={(value) => [number(value, 3) + " kWh", "Consumo"]} /><Bar dataKey="kwh" fill="#00c8ff" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer> : <Empty>{loading ? "Consultando API…" : "Sem medições para o período."}</Empty>}
              </Panel>
              <Panel title="Distribuição energética" subtitle="Participação do consumo de TI e demais cargas">
                {distribution.length ? <><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={distribution} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} stroke="none">{distribution.map((item, index) => <Cell key={item.name} fill={COLORS[index]} />)}</Pie><Tooltip formatter={(value) => [value + "%", "Participação"]} /></PieChart></ResponsiveContainer><div className="space-y-2">{distribution.map((item, index) => <div key={item.name} className="flex justify-between text-xs"><span style={{ color: "var(--muted-foreground)" }}>{item.name}</span><strong style={{ color: "var(--foreground)" }}>{item.value}%</strong></div>)}</div></> : <Empty>Sem dados para exibir.</Empty>}
              </Panel>
            </div>
            <Panel title="Últimas medições" subtitle="Leituras mais recentes retornadas pela API" action={<button onClick={() => setActiveTab("Histórico")} className="text-xs" style={{ color: "var(--primary)", background: "none", border: 0 }}>Ver histórico</button>}>
              <Table rows={readings.slice(-5).reverse()} columns={[
                { key: "measured_at", label: "Data", render: (row) => date(row.measured_at) },
                { key: "energy_total_kwh", label: "Total (kWh)", render: (row) => number(row.energy_total_kwh, 3) },
                { key: "energy_it_kwh", label: "TI (kWh)", render: (row) => number(row.energy_it_kwh, 3) },
                { key: "pue", label: "PUE", render: (row) => number(row.pue, 3) },
                { key: "above_limit", label: "Status", render: (row) => <Badge tone={row.above_limit ? "warning" : "ok"}>{row.above_limit ? "Acima do limite" : "Normal"}</Badge> },
              ]} />
            </Panel>
          </>
        )}

        {activeTab === "Histórico" && (
          <>
            <Panel title="Registrar medição" subtitle="Informe os consumos em kWh. A data será preenchida automaticamente pela API se não for enviada.">
              <form onSubmit={registerReading} className="grid md:grid-cols-3 gap-3 items-end">
                <label className="text-xs" style={{ color: "var(--muted-foreground)" }}>Consumo total (kWh)<input required type="number" min="0.001" step="0.001" value={totalInput} onChange={(event) => setTotalInput(event.target.value)} className="w-full mt-2 p-3" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)", borderRadius: "var(--radius)" }} /></label>
                <label className="text-xs" style={{ color: "var(--muted-foreground)" }}>Consumo de TI (kWh)<input required type="number" min="0.001" step="0.001" value={itInput} onChange={(event) => setItInput(event.target.value)} className="w-full mt-2 p-3" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)", borderRadius: "var(--radius)" }} /></label>
                <button disabled={busy} className="p-3 text-sm font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)", border: 0, borderRadius: "var(--radius)", opacity: busy ? .6 : 1 }}>Registrar medição</button>
              </form>
              <div className="mt-4"><button onClick={simulate} disabled={busy} className="px-4 py-2 text-xs" style={{ background: "transparent", color: "var(--primary)", border: "1px solid var(--primary)", borderRadius: "var(--radius)" }}>{busy ? "Processando…" : "Simular 24 horas de sensores"}</button></div>
            </Panel>
            <Panel title="Medições do período" subtitle={readings.length + " registros encontrados"}>
              <Table rows={readings.slice().reverse()} columns={[
                { key: "measured_at", label: "Data", render: (row) => date(row.measured_at) },
                { key: "energy_total_kwh", label: "Total (kWh)", render: (row) => number(row.energy_total_kwh, 3) },
                { key: "energy_it_kwh", label: "TI (kWh)", render: (row) => number(row.energy_it_kwh, 3) },
                { key: "pue", label: "PUE", render: (row) => number(row.pue, 3) },
                { key: "estimated_cost_brl", label: "Custo", render: (row) => money(row.estimated_cost_brl) },
                { key: "above_limit", label: "Situação", render: (row) => <Badge tone={row.above_limit ? "warning" : "ok"}>{row.above_limit ? "Alerta" : "Normal"}</Badge> },
              ]} />
            </Panel>
          </>
        )}

        {activeTab === "Alertas" && (
          <>
            <div className="grid sm:grid-cols-3 gap-3">
              <Kpi label="Total de alertas" value={periodAlerts.length} note="No período selecionado" />
              <Kpi label="Avisos" value={periodAlerts.filter((item) => item.severity === "warning").length} note="Severidade warning" />
              <Kpi label="Críticos" value={periodAlerts.filter((item) => item.severity === "critical").length} note="Severidade critical" />
            </div>
            <Panel title="Central de alertas" subtitle="Registros retornados pelo backend">
              <Table rows={periodAlerts} columns={[
                { key: "reading_measured_at", label: "Medição", render: (row) => date(row.reading_measured_at) },
                { key: "type", label: "Tipo" },
                { key: "severity", label: "Severidade", render: (row) => <Badge tone={row.severity === "critical" ? "critical" : "warning"}>{row.severity}</Badge> },
                { key: "message", label: "Descrição" },
              ]} />
            </Panel>
          </>
        )}

        {activeTab === "Relatórios" && (
          <>
            <Panel title="Relatório consolidado" subtitle="Resumo diário das medições do período selecionado" action={<button onClick={exportCsv} disabled={!readings.length} className="px-3 py-2 text-xs" style={{ background: "var(--primary)", color: "var(--primary-foreground)", border: 0, borderRadius: "var(--radius)", opacity: readings.length ? 1 : .5 }}>Exportar CSV</button>}>
              <div className="grid sm:grid-cols-3 gap-3 mb-5">
                <Kpi label="Consumo total" value={summary ? number(summary.energy_total_kwh, 0) : "—"} unit="kWh" />
                <Kpi label="Custo estimado" value={summary ? money(summary.estimated_cost_brl) : "—"} />
                <Kpi label="Medições" value={summary ? summary.reading_count : readings.length} />
              </div>
              <Table rows={daily} columns={[
                { key: "day", label: "Dia" },
                { key: "count", label: "Leituras" },
                { key: "total", label: "Total (kWh)", render: (row) => number(row.total, 3) },
                { key: "it", label: "TI (kWh)", render: (row) => number(row.it, 3) },
                { key: "cost", label: "Custo", render: (row) => money(row.cost) },
              ]} />
            </Panel>
            <Panel title="Eficiência energética" subtitle="Indicador PUE consolidado para o período">
              {summary ? <div className="flex flex-wrap items-end gap-4"><strong className="font-mono text-4xl" style={{ color: "var(--primary)" }}>{number(summary.pue)}</strong><div className="text-sm" style={{ color: "var(--muted-foreground)" }}>Limite configurado: {number(summary.pue_limit)}<br />{summary.alert ? "O limite foi ultrapassado no período." : "Nenhum alerta no resumo do período."}</div></div> : <Empty>Sem resumo disponível para este período.</Empty>}
            </Panel>
          </>
        )}
      </main>

      <footer className="px-6 py-3 flex justify-between text-xs" style={{ borderTop: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
        <span>Factory Insight · Módulo EnergiaDC · API Java</span>
        <span>Operador: {user?.name || "Usuário"}</span>
      </footer>
    </div>
  )
}
