import { useState, useEffect, useRef } from "react";

function calcularCuota(monto, tasaAnual, plazoMeses) {
  const r = tasaAnual / 100 / 12;
  if (r === 0) return monto / plazoMeses;
  return (monto * r * Math.pow(1 + r, plazoMeses)) / (Math.pow(1 + r, plazoMeses) - 1);
}

function generarAmortizacion(monto, tasaAnual, plazoMeses) {
  const r = tasaAnual / 100 / 12;
  const cuota = calcularCuota(monto, tasaAnual, plazoMeses);
  const tabla = [];
  let saldo = monto;
  for (let i = 1; i <= plazoMeses; i++) {
    const interes = saldo * r;
    const capital = cuota - interes;
    saldo -= capital;
    tabla.push({ cuota: i, pagoMensual: cuota, capital, interes, saldo: Math.max(0, saldo) });
  }
  return tabla;
}

function analizarViabilidad(cuota, ingresosMensuales, gastosMensuales) {
  const ingresoNeto = ingresosMensuales - gastosMensuales;
  const capacidadPago = ingresoNeto * 0.35;
  const porcentajeEndeudamiento = (cuota / ingresosMensuales) * 100;
  let estado, mensaje, color;
  if (cuota <= capacidadPago && porcentajeEndeudamiento <= 30) {
    estado = "viable"; mensaje = "El crédito es financieramente viable para su empresa."; color = "#22c55e";
  } else if (porcentajeEndeudamiento <= 40) {
    estado = "riesgoso"; mensaje = "Existe un riesgo moderado de endeudamiento. Evalúe cuidadosamente."; color = "#f59e0b";
  } else {
    estado = "noViable"; mensaje = "La cuota supera la capacidad de pago recomendada. No recomendable."; color = "#ef4444";
  }
  return { estado, mensaje, color, capacidadPago, porcentajeEndeudamiento, ingresoNeto };
}

const COP = (n) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

const INITIAL_HISTORIAL = [
  { id: 1, empresa: "Café Aroma SAS", monto: 50000000, tasa: 18, plazo: 36, ingresos: 15000000, gastos: 8000000, fecha: "2024-11-15", estado: "viable", tipo: "frances" },
  { id: 2, empresa: "Textiles Medellín", monto: 120000000, tasa: 22, plazo: 60, ingresos: 30000000, gastos: 18000000, fecha: "2024-12-03", estado: "riesgoso", tipo: "frances" },
  { id: 3, empresa: "Tech Solutions Colombia", monto: 30000000, tasa: 15, plazo: 24, ingresos: 12000000, gastos: 5000000, fecha: "2025-01-10", estado: "viable", tipo: "frances" },
  { id: 4, empresa: "Distribuidora Sur", monto: 80000000, tasa: 24, plazo: 48, ingresos: 10000000, gastos: 7000000, fecha: "2025-02-20", estado: "noViable", tipo: "frances" },
];

const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    sim: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    history: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    export: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    logout: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    warn: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
    danger: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    eye: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />,
    edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    download: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />,
    back: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />,
    close: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />,
    crown: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3l3 9H3l2 6h14l2-6h-5l3-9-7 5-7-5z" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} xmlns="http://www.w3.org/2000/svg">
      {icons[name]}
    </svg>
  );
};

const Logo = ({ collapsed }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}>
      <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>F</span>
    </div>
    {!collapsed && (
      <span style={{ fontWeight: 700, fontSize: 20, background: "linear-gradient(90deg,#0ea5e9,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Finanzu
      </span>
    )}
  </div>
);

function LoginScreen({ onLogin }) {
  const [user, setUser] = useState("demo@finanzu.co");
  const [pass, setPass] = useState("finanzu2025");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const handleLogin = () => {
    if (!user || !pass) { setErr("Completa todos los campos."); return; }
    setErr(""); setLoading(true);
    setTimeout(() => { setLoading(false); onLogin({ nombre: "Ana Gómez", empresa: "Finanzu Analytics", plan: "premium" }); }, 1400);
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0e1a", position: "relative", overflow: "hidden", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ position: "absolute", borderRadius: "50%", background: i % 2 === 0 ? "rgba(99,102,241,0.08)" : "rgba(14,165,233,0.06)", width: [400,300,500,200,350,450][i], height: [400,300,500,200,350,450][i], top: ["10%","60%","30%","70%","5%","50%"][i], left: ["5%","60%","40%","10%","70%","30%"][i], filter: "blur(60px)", pointerEvents: "none" }} />
      ))}
      <div style={{ width: 420, background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "40px 36px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Logo collapsed={false} />
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 8 }}>Simulador de Crédito Empresarial</p>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: 12, marginBottom: 6, fontWeight: 500 }}>CORREO ELECTRÓNICO</label>
          <input value={user} onChange={e => setUser(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} placeholder="usuario@empresa.co" />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: 12, marginBottom: 6, fontWeight: 500 }}>CONTRASEÑA</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} placeholder="••••••••" />
        </div>
        {err && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 16, textAlign: "center" }}>{err}</p>}
        <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", cursor: "pointer", background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg,#6366f1,#0ea5e9)", color: "#fff", fontWeight: 600, fontSize: 15, boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.4)" }}>
          {loading ? "Iniciando sesión..." : "Ingresar a Finanzu →"}
        </button>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 20 }}>Credenciales demo precargadas ✓</p>
      </div>
    </div>
  );
}

function Sidebar({ seccion, setSeccion, usuario, onLogout }) {
  const nav = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "simulador", label: "Simulador", icon: "sim" },
    { id: "graficos", label: "Análisis Visual", icon: "chart" },
    { id: "historial", label: "Historial", icon: "history" },
    { id: "exportar", label: "Exportar", icon: "export" },
    { id: "planes", label: "Planes", icon: "crown" },
  ];
  return (
    <div style={{ width: 220, minHeight: "100vh", background: "#0d1117", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "24px 20px 20px" }}><Logo collapsed={false} /></div>
      <div style={{ padding: "0 12px", flex: 1 }}>
        {nav.map(item => (
          <button key={item.id} onClick={() => setSeccion(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: seccion === item.id ? (item.id === "planes" ? "rgba(251,191,36,0.12)" : "rgba(99,102,241,0.15)") : "transparent", color: seccion === item.id ? (item.id === "planes" ? "#fbbf24" : "#a5b4fc") : "rgba(255,255,255,0.45)", fontSize: 14, fontWeight: seccion === item.id ? 600 : 400, marginBottom: 4, textAlign: "left", borderLeft: seccion === item.id ? `3px solid ${item.id === "planes" ? "#fbbf24" : "#6366f1"}` : "3px solid transparent" }}>
            <Icon name={item.icon} size={18} color={seccion === item.id ? (item.id === "planes" ? "#fbbf24" : "#a5b4fc") : "rgba(255,255,255,0.45)"} />
            {item.label}
            {item.id === "planes" && <span style={{ marginLeft: "auto", background: "rgba(251,191,36,0.15)", color: "#fbbf24", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>PRO</span>}
          </button>
        ))}
      </div>
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, margin: 0 }}>{usuario?.nombre}</p>
          <span style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>PRO</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: "2px 0 12px" }}>{usuario?.empresa}</p>
        <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.4)", fontSize: 12, padding: "7px 12px", cursor: "pointer", width: "100%" }}>
          <Icon name="logout" size={14} color="rgba(255,255,255,0.4)" /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px", borderTop: `3px solid ${accent}` }}>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", margin: 0 }}>{label}</p>
      <p style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: "8px 0 4px" }}>{value}</p>
      {sub && <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>{sub}</p>}
    </div>
  );
}

function Dashboard({ historial, onNavigate }) {
  const [hora, setHora] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setHora(new Date()), 1000); return () => clearInterval(t); }, []);
  const viables = historial.filter(h => h.estado === "viable").length;
  const montoTotal = historial.reduce((a, b) => a + b.monto, 0);
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, margin: 0 }}>Bienvenido a Finanzu 👋</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "6px 0 0" }}>
          {hora.toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · {hora.toLocaleTimeString("es-CO")}
        </p>
      </div>
      <div style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.2) 0%,rgba(14,165,233,0.15) 100%)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 16, padding: "24px 28px", marginBottom: 28, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,#6366f1,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 28 }}>💼</span>
        </div>
        <div>
          <h2 style={{ color: "#fff", fontSize: 17, fontWeight: 700, margin: 0 }}>Plataforma de Simulación Financiera Empresarial</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, margin: "4px 0 0" }}>Analiza y compara créditos antes de adquirirlos. Toma decisiones financieras inteligentes con datos reales.</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 28 }}>
        <StatCard label="Simulaciones realizadas" value={historial.length} sub="En total" accent="#6366f1" />
        <StatCard label="Créditos viables" value={viables} sub={`de ${historial.length} analizados`} accent="#22c55e" />
        <StatCard label="Monto total analizado" value={COP(montoTotal)} sub="en simulaciones" accent="#0ea5e9" />
        <StatCard label="Tasa promedio" value="19.8%" sub="anual efectiva" accent="#f59e0b" />
      </div>
      <h3 style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Acciones rápidas</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { label: "Nueva simulación", desc: "Analiza un crédito", emoji: "🧮", id: "simulador" },
          { label: "Ver historial", desc: "Simulaciones guardadas", emoji: "📋", id: "historial" },
          { label: "Exportar reporte", desc: "CSV o JSON", emoji: "📊", id: "exportar" },
          { label: "Ver planes", desc: "Free vs Premium", emoji: "👑", id: "planes" },
        ].map(a => (
          <div key={a.label} onClick={() => onNavigate(a.id)} style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}>
            <span style={{ fontSize: 24 }}>{a.emoji}</span>
            <p style={{ color: "#fff", fontSize: 14, fontWeight: 600, margin: "10px 0 2px" }}>{a.label}</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>{a.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", prefix, min, max, step }) {
  const [rawValue, setRawValue] = useState(String(value));
  useEffect(() => {
    const parsed = parseFloat(rawValue);
    if (!isNaN(parsed) && parsed !== value) setRawValue(String(value));
  }, [value]);
  const handleChange = (e) => {
    const raw = e.target.value;
    if (type !== "number") { onChange(raw); return; }
    setRawValue(raw);
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) onChange(parsed);
  };
  const handleBlur = () => {
    if (type === "number") {
      const parsed = parseFloat(rawValue);
      if (isNaN(parsed) || parsed === 0) { const fallback = min || 0; setRawValue(String(fallback)); onChange(fallback); }
      else { setRawValue(String(parsed)); onChange(parsed); }
    }
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden" }}>
        {prefix && <span style={{ padding: "0 12px", color: "rgba(255,255,255,0.3)", fontSize: 14, borderRight: "1px solid rgba(255,255,255,0.1)", whiteSpace: "nowrap" }}>{prefix}</span>}
        <input type={type === "number" ? "text" : type} inputMode={type === "number" ? "decimal" : undefined} value={type === "number" ? rawValue : value} min={min} max={max} step={step} onChange={handleChange} onBlur={handleBlur} style={{ flex: 1, background: "none", border: "none", padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none" }} />
      </div>
    </div>
  );
}

function PlanesView() {
  const features = {
    free: [
      { texto: "Simulador de crédito básico", incluido: true },
      { texto: "Hasta 3 simulaciones guardadas", incluido: true },
      { texto: "Tabla de amortización francesa", incluido: true },
      { texto: "Análisis de viabilidad básico", incluido: true },
      { texto: "Exportar PDF / CSV / JSON", incluido: false },
      { texto: "Amortización alemana", incluido: false },
      { texto: "Gráficas avanzadas e historial", incluido: false },
      { texto: "Asesoría financiera personalizada", incluido: false },
    ],
    premium: [
      { texto: "Todo lo del plan gratuito", incluido: true },
      { texto: "Simulaciones ilimitadas", incluido: true },
      { texto: "Amortización francesa y alemana", incluido: true },
      { texto: "Exportar PDF, CSV y JSON", incluido: true },
      { texto: "Historial completo con gráficas", incluido: true },
      { texto: "Análisis visual interactivo", incluido: true },
    ],
  };
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, margin: 0 }}>Planes y Precios</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "6px 0 0" }}>Empieza gratis. Escala cuando necesites asesoría experta.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="sim" size={20} color="rgba(255,255,255,0.5)" />
            </div>
            <div>
              <p style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: 0 }}>Finanzu Free</p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: 0 }}>Para explorar</p>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <span style={{ color: "#fff", fontSize: 36, fontWeight: 700 }}>$0</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}> / mes</span>
          </div>
          <button style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 14, cursor: "default", marginBottom: 24 }}>Plan básico</button>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 14 }}>Incluye</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {features.free.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={f.incluido ? "#22c55e" : "rgba(255,255,255,0.2)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    {f.incluido ? <path d="M20 6L9 17l-5-5" /> : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>}
                  </svg>
                  <span style={{ fontSize: 13, color: f.incluido ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.25)" }}>{f.texto}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ background: "#111827", border: "2px solid rgba(251,191,36,0.4)", borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", position: "relative" }}>
          <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 6, padding: "4px 14px" }}>
            <span style={{ color: "#fbbf24", fontSize: 11, fontWeight: 700 }}>✓ PLAN ACTIVO</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(251,191,36,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="crown" size={20} color="#fbbf24" />
            </div>
            <div>
              <p style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: 0 }}>Finanzu Premium</p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: 0 }}>Para emprendedores serios</p>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <span style={{ color: "#fbbf24", fontSize: 36, fontWeight: 700 }}>$29.900</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}> COP / mes</span>
          </div>
          <button style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#1a1200", fontSize: 14, fontWeight: 700, cursor: "default", marginBottom: 24 }}>
            ✓ Suscrito actualmente
          </button>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 14 }}>Todo lo de Free, más</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {features.premium.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{f.texto}</span>
                </div>
              ))}
              <div style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10, padding: "12px 14px", marginTop: 4 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <div>
                    <p style={{ color: "#fbbf24", fontSize: 13, fontWeight: 600, margin: "0 0 4px" }}>Asesoría personalizada mensual</p>
                    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, margin: 0, lineHeight: 1.5 }}>Sesión de 30 min con el equipo Finanzu: interpretamos tus resultados, evaluamos si el crédito es viable para tu modelo de negocio y te damos recomendaciones concretas. No es un bot — es asesoría humana real.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[
          { emoji: "🔒", label: "Pago seguro", desc: "Cancela cuando quieras, sin penalización" },
          { emoji: "🔄", label: "Sin permanencia", desc: "Suscripción mensual, sin contratos" },
          { emoji: "🧑‍💼", label: "Asesoría humana real", desc: "Con expertos financieros, no con chatbots" },
        ].map((g, i) => (
          <div key={i} style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{g.emoji}</span>
            <div>
              <p style={{ color: "#fff", fontSize: 13, fontWeight: 600, margin: "0 0 3px" }}>{g.label}</p>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>{g.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function exportarPDFDesdeDatos(resultado) {
  const f = resultado.form;
  const a = resultado.analisis;
  const fecha = new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
  const viabilidadColor = a.estado === "viable" ? "#16a34a" : a.estado === "riesgoso" ? "#d97706" : "#dc2626";
  const viabilidadBg = a.estado === "viable" ? "#f0fdf4" : a.estado === "riesgoso" ? "#fffbeb" : "#fef2f2";
  const viabilidadBorde = a.estado === "viable" ? "#bbf7d0" : a.estado === "riesgoso" ? "#fde68a" : "#fecaca";
  const viabilidadLabel = a.estado === "viable" ? "CRÉDITO VIABLE" : a.estado === "riesgoso" ? "RIESGO MODERADO" : "NO RECOMENDABLE";
  const filas = resultado.tabla.map((row, i) => `
    <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f9fafb"}">
      <td style="padding:6px 10px;text-align:center;color:#6b7280;font-size:12px;border-bottom:1px solid #f3f4f6">${row.cuota}</td>
      <td style="padding:6px 10px;text-align:right;color:#6366f1;font-size:12px;border-bottom:1px solid #f3f4f6">${COP(Math.round(row.capital))}</td>
      <td style="padding:6px 10px;text-align:right;color:#d97706;font-size:12px;border-bottom:1px solid #f3f4f6">${COP(Math.round(row.interes))}</td>
      <td style="padding:6px 10px;text-align:right;color:#0369a1;font-size:12px;border-bottom:1px solid #f3f4f6">${COP(Math.round(row.pagoMensual))}</td>
      <td style="padding:6px 10px;text-align:right;color:#111827;font-size:12px;border-bottom:1px solid #f3f4f6">${COP(Math.round(row.saldo))}</td>
    </tr>`).join("");
  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"/>
<title>Finanzu - ${f.empresa}</title>
<style>
  @page { size: A4; margin: 20mm 16mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1f2937; background: #fff; }
  .header { display: flex; align-items: center; gap: 14px; padding-bottom: 16px; border-bottom: 2px solid #6366f1; margin-bottom: 24px; }
  .logo-box { width: 44px; height: 44px; background: #6366f1; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 22px; font-weight: 900; }
  .logo-name { font-size: 22px; font-weight: 800; color: #6366f1; }
  .logo-sub { font-size: 11px; color: #6b7280; margin-top: 3px; }
  .sec-titulo { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #374151; background: #f3f4f6; padding: 5px 10px; border-radius: 4px; margin-bottom: 12px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 22px; }
  .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; }
  .card-label { font-size: 9px; text-transform: uppercase; color: #9ca3af; font-weight: 600; margin-bottom: 3px; }
  .card-value { font-size: 15px; font-weight: 700; color: #111827; }
  .viabilidad { border-radius: 8px; padding: 14px 16px; border: 1px solid ${viabilidadBorde}; background: ${viabilidadBg}; border-left: 5px solid ${viabilidadColor}; margin-bottom: 22px; }
  .viabilidad-titulo { font-size: 13px; font-weight: 700; color: ${viabilidadColor}; margin-bottom: 5px; }
  .viabilidad-msg { font-size: 11px; color: #374151; margin-bottom: 6px; }
  .viabilidad-datos { font-size: 10px; color: #6b7280; }
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #6366f1; }
  thead th { color: #fff; font-size: 10px; font-weight: 600; padding: 8px 10px; text-transform: uppercase; }
  thead th:first-child { text-align: center; }
  thead th:not(:first-child) { text-align: right; }
  .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; text-align: center; }
</style></head><body>
<div class="header">
  <div class="logo-box">F</div>
  <div><div class="logo-name">Finanzu</div><div class="logo-sub">Reporte de Simulacion Crediticia · ${fecha}</div></div>
</div>
<div class="sec-titulo">Datos del Crédito</div>
<div class="grid2">
  <div class="card"><div class="card-label">Empresa</div><div class="card-value" style="font-size:13px">${f.empresa}</div></div>
  <div class="card"><div class="card-label">Monto solicitado</div><div class="card-value">${COP(f.monto)}</div></div>
  <div class="card"><div class="card-label">Tasa de interés anual</div><div class="card-value">${f.tasa}%</div></div>
  <div class="card"><div class="card-label">Plazo</div><div class="card-value">${f.plazo} meses</div></div>
  <div class="card" style="grid-column:1/-1"><div class="card-label">Tipo de amortización</div><div class="card-value" style="font-size:13px">${f.tipo === "aleman" ? "Alemana (capital fijo)" : "Francesa (cuota fija)"}</div></div>
</div>
<div class="sec-titulo">Resumen Financiero</div>
<div class="grid2">
  <div class="card"><div class="card-label">Cuota mensual</div><div class="card-value" style="color:#6366f1">${COP(Math.round(resultado.cuota))}</div></div>
  <div class="card"><div class="card-label">Total pagado</div><div class="card-value" style="color:#0ea5e9">${COP(Math.round(resultado.totalPagado))}</div></div>
  <div class="card"><div class="card-label">Total intereses</div><div class="card-value" style="color:#d97706">${COP(Math.round(resultado.totalIntereses))}</div></div>
  <div class="card"><div class="card-label">% Endeudamiento</div><div class="card-value" style="color:${viabilidadColor}">${a.porcentajeEndeudamiento.toFixed(1)}%</div></div>
</div>
<div class="viabilidad">
  <div class="viabilidad-titulo">${viabilidadLabel}</div>
  <div class="viabilidad-msg">${a.mensaje}</div>
  <div class="viabilidad-datos">Ingresos: <strong>${COP(f.ingresos)}</strong> | Gastos: <strong>${COP(f.gastos)}</strong> | Capacidad recomendada: <strong>${COP(Math.round(a.capacidadPago))}</strong></div>
</div>
<div class="sec-titulo">Tabla de Amortización</div>
<table>
  <thead><tr><th>#</th><th>Capital</th><th>Interés</th><th>Cuota mensual</th><th>Saldo restante</th></tr></thead>
  <tbody>${filas}</tbody>
</table>
<div class="footer">Generado por Finanzu Analytics · Reporte de carácter informativo, no constituye asesoría financiera oficial.</div>
<script>window.onload = function(){ window.print(); }</script>
</body></html>`;
  const win = window.open("", "_blank", "width=900,height=700");
  if (win) { win.document.write(html); win.document.close(); }
}

function Simulador({ onGuardar, editData, onClearEdit }) {
  const [form, setForm] = useState(editData || { empresa: "", monto: 50000000, tasa: 18, plazo: 36, tipo: "frances", ingresos: 15000000, gastos: 8000000 });
  const [resultado, setResultado] = useState(null);
  const [tablaVisible, setTablaVisible] = useState(false);
  const [err, setErr] = useState("");
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm(editData);
      const cuota = calcularCuota(editData.monto, editData.tasa, editData.plazo);
      const tabla = generarAmortizacion(editData.monto, editData.tasa, editData.plazo);
      const totalPagado = cuota * editData.plazo;
      const analisis = analizarViabilidad(cuota, editData.ingresos, editData.gastos);
      setResultado({ cuota, totalPagado, totalIntereses: totalPagado - editData.monto, tabla, analisis, form: { ...editData } });
      setGuardado(false);
    }
  }, [editData]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const simular = () => {
    if (!form.empresa) { setErr("Ingresa el nombre de la empresa."); return; }
    if (form.monto <= 0 || form.tasa <= 0 || form.plazo <= 0) { setErr("Valores deben ser mayores a 0."); return; }
    setErr("");
    const cuota = calcularCuota(form.monto, form.tasa, form.plazo);
    const tabla = generarAmortizacion(form.monto, form.tasa, form.plazo);
    const totalPagado = cuota * form.plazo;
    const analisis = analizarViabilidad(cuota, form.ingresos, form.gastos);
    setResultado({ cuota, totalPagado, totalIntereses: totalPagado - form.monto, tabla, analisis, form: { ...form } });
    setTablaVisible(false);
    setGuardado(false);
  };

  const guardar = () => {
    if (!resultado) return;
    const sim = {
      id: editData?.id || Date.now(),
      empresa: resultado.form.empresa,
      monto: resultado.form.monto,
      tasa: resultado.form.tasa,
      plazo: resultado.form.plazo,
      ingresos: resultado.form.ingresos,
      gastos: resultado.form.gastos,
      tipo: resultado.form.tipo,
      fecha: new Date().toISOString().split("T")[0],
      estado: resultado.analisis.estado,
    };
    onGuardar(sim);
    setGuardado(true);
    if (onClearEdit) onClearEdit();
  };

  return (
    <div>
      {editData && (
        <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 10, padding: "10px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "#a5b4fc", fontSize: 13 }}>✏️ Editando simulación de <strong>{editData.empresa}</strong></span>
          <button onClick={onClearEdit} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 12 }}>Cancelar edición</button>
        </div>
      )}
      <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{editData ? "Editar Simulación" : "Simulador de Crédito"}</h1>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 24 }}>Ingresa los datos del crédito para obtener un análisis financiero completo.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", marginBottom: 20 }}>Datos del Crédito</h3>
          <InputField label="Nombre de la empresa" value={form.empresa} onChange={v => set("empresa", v)} />
          <InputField label="Monto del préstamo" type="number" value={form.monto} onChange={v => set("monto", v)} prefix="COP" min={1000000} step={1000000} />
          <InputField label="Tasa de interés anual (%)" type="number" value={form.tasa} onChange={v => set("tasa", v)} prefix="%" min={0.1} max={100} step={0.5} />
          <InputField label="Plazo (meses)" type="number" value={form.plazo} onChange={v => set("plazo", v)} prefix="meses" min={1} max={360} />
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Tipo de amortización</label>
            <select value={form.tipo} onChange={e => set("tipo", e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none" }}>
              <option value="frances">Francesa (cuota fija)</option>
              <option value="aleman">Alemana (capital fijo)</option>
            </select>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 18, marginTop: 4 }}>
            <h3 style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>Capacidad Financiera</h3>
            <InputField label="Ingresos mensuales" type="number" value={form.ingresos} onChange={v => set("ingresos", v)} prefix="COP" min={0} step={500000} />
            <InputField label="Gastos mensuales" type="number" value={form.gastos} onChange={v => set("gastos", v)} prefix="COP" min={0} step={500000} />
          </div>
          {err && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{err}</p>}
          <button onClick={simular} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#6366f1,#0ea5e9)", color: "#fff", fontWeight: 700, fontSize: 15, boxShadow: "0 4px 20px rgba(99,102,241,0.35)", marginTop: 4 }}>
            {editData ? "Recalcular →" : "Calcular simulación →"}
          </button>
        </div>
        <div>
          {resultado ? (
            <>
              <div style={{ background: "#111827", border: `2px solid ${resultado.analisis.color}33`, borderRadius: 16, padding: 20, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <Icon name={resultado.analisis.estado === "viable" ? "check" : resultado.analisis.estado === "riesgoso" ? "warn" : "danger"} size={20} color={resultado.analisis.color} />
                  <span style={{ color: resultado.analisis.color, fontWeight: 700, fontSize: 15 }}>
                    {resultado.analisis.estado === "viable" ? "Crédito Viable" : resultado.analisis.estado === "riesgoso" ? "Riesgo Moderado" : "No Recomendable"}
                  </span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: 0 }}>{resultado.analisis.mensaje}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[
                  { label: "Cuota mensual", value: COP(resultado.cuota), color: "#a5b4fc" },
                  { label: "Total pagado", value: COP(resultado.totalPagado), color: "#38bdf8" },
                  { label: "Total intereses", value: COP(resultado.totalIntereses), color: "#f59e0b" },
                  { label: "% endeudamiento", value: `${resultado.analisis.porcentajeEndeudamiento.toFixed(1)}%`, color: resultado.analisis.color },
                ].map(m => (
                  <div key={m.label} style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px" }}>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, textTransform: "uppercase", fontWeight: 600, margin: 0 }}>{m.label}</p>
                    <p style={{ color: m.color, fontSize: 20, fontWeight: 700, margin: "6px 0 0" }}>{m.value}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px", marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Uso de capacidad de pago</span>
                  <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{Math.min(100, resultado.analisis.porcentajeEndeudamiento).toFixed(0)}%</span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 8 }}>
                  <div style={{ height: "100%", borderRadius: 4, width: `${Math.min(100, resultado.analisis.porcentajeEndeudamiento)}%`, background: resultado.analisis.color, transition: "width 0.8s ease" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ color: "#22c55e", fontSize: 11 }}>Zona segura: 0-30%</span>
                  <span style={{ color: "#ef4444", fontSize: 11 }}>Zona crítica: +40%</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <button onClick={() => setTablaVisible(!tablaVisible)} style={{ padding: "10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 12 }}>
                  {tablaVisible ? "Ocultar tabla" : "Ver tabla"}
                </button>
                <button onClick={guardar} style={{ padding: "10px", borderRadius: 10, border: `1px solid ${guardado ? "rgba(34,197,94,0.6)" : "rgba(34,197,94,0.3)"}`, background: guardado ? "rgba(34,197,94,0.2)" : "rgba(34,197,94,0.08)", color: "#4ade80", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                  {guardado ? "✓ Guardado" : "Guardar"}
                </button>
                <button onClick={() => exportarPDFDesdeDatos(resultado)} style={{ padding: "10px", borderRadius: 10, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)", color: "#a5b4fc", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                  PDF
                </button>
              </div>
              {tablaVisible && (
                <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, marginTop: 14, overflow: "auto", maxHeight: 320 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "rgba(99,102,241,0.1)", position: "sticky", top: 0 }}>
                        {["#", "Capital", "Interés", "Cuota", "Saldo"].map(h => (
                          <th key={h} style={{ padding: "10px 12px", color: "rgba(255,255,255,0.5)", textAlign: "right", fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.tabla.map((row, i) => (
                        <tr key={row.cuota} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                          <td style={{ padding: "8px 12px", color: "rgba(255,255,255,0.4)", textAlign: "right" }}>{row.cuota}</td>
                          <td style={{ padding: "8px 12px", color: "#a5b4fc", textAlign: "right" }}>{COP(row.capital)}</td>
                          <td style={{ padding: "8px 12px", color: "#f59e0b", textAlign: "right" }}>{COP(row.interes)}</td>
                          <td style={{ padding: "8px 12px", color: "#38bdf8", textAlign: "right" }}>{COP(row.pagoMensual)}</td>
                          <td style={{ padding: "8px 12px", color: "#fff", textAlign: "right" }}>{COP(row.saldo)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 40, textAlign: "center", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 48, marginBottom: 16 }}>🧮</span>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, margin: 0 }}>
                Completa el formulario y presiona<br /><strong style={{ color: "#a5b4fc" }}>Calcular simulación</strong> para ver los resultados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GraficosView() {
  const canvasRef1 = useRef(); const canvasRef2 = useRef(); const canvasRef3 = useRef();
  const [monto, setMonto] = useState(80000000); const [tasa, setTasa] = useState(18); const [plazo, setPlazo] = useState(48);
  const chartsRef = useRef([]);
  const destroyCharts = () => { chartsRef.current.forEach(c => { try { c.destroy(); } catch(e){} }); chartsRef.current = []; };
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!canvasRef1.current || !canvasRef2.current || !canvasRef3.current || !window.Chart) return;
      destroyCharts();
      const tabla = generarAmortizacion(monto, tasa, plazo);
      const labels = tabla.map(r => `M${r.cuota}`);
      const saldos = tabla.map(r => Math.round(r.saldo));
      const capitales = tabla.map(r => Math.round(r.capital));
      const intereses = tabla.map(r => Math.round(r.interes));
      const commonOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "rgba(255,255,255,0.35)", font: { size: 10 } } }, y: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "rgba(255,255,255,0.35)", font: { size: 10 }, callback: v => `$${(v/1e6).toFixed(1)}M` } } } };
      chartsRef.current.push(new window.Chart(canvasRef1.current, { type: "line", data: { labels, datasets: [{ label: "Saldo", data: saldos, borderColor: "#6366f1", backgroundColor: "rgba(99,102,241,0.08)", fill: true, tension: 0.4, pointRadius: 0 }] }, options: { ...commonOpts } }));
      chartsRef.current.push(new window.Chart(canvasRef2.current, { type: "bar", data: { labels, datasets: [{ label: "Capital", data: capitales, backgroundColor: "rgba(99,102,241,0.7)" }, { label: "Interés", data: intereses, backgroundColor: "rgba(245,158,11,0.7)" }] }, options: { ...commonOpts } }));
      const totalCap = capitales.reduce((a, b) => a + b, 0); const totalInt = intereses.reduce((a, b) => a + b, 0);
      chartsRef.current.push(new window.Chart(canvasRef3.current, { type: "doughnut", data: { labels: ["Capital", "Intereses"], datasets: [{ data: [Math.round(totalCap), Math.round(totalInt)], backgroundColor: ["#6366f1", "#f59e0b"], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: "72%" } }));
    }, 300);
    return () => { clearTimeout(timer); destroyCharts(); };
  }, [monto, tasa, plazo]);
  const cuota = calcularCuota(monto, tasa, plazo); const totalInt = cuota * plazo - monto;
  return (
    <div>
      <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Análisis Visual</h1>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 24 }}>Visualiza la evolución de tu crédito con gráficos interactivos.</p>
      <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {[{ label: "Monto", value: monto, set: setMonto, min: 5000000, max: 500000000, step: 5000000, fmt: v => `${(v/1e6).toFixed(0)}M` }, { label: "Tasa anual %", value: tasa, set: setTasa, min: 5, max: 50, step: 0.5, fmt: v => `${v}%` }, { label: "Plazo meses", value: plazo, set: setPlazo, min: 6, max: 120, step: 6, fmt: v => `${v}m` }].map(ctrl => (
            <div key={ctrl.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{ctrl.label}</span>
                <span style={{ color: "#a5b4fc", fontWeight: 600, fontSize: 12 }}>{ctrl.fmt(ctrl.value)}</span>
              </div>
              <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step} value={ctrl.value} onChange={e => ctrl.set(parseFloat(e.target.value))} style={{ width: "100%", accentColor: "#6366f1" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Cuota: <strong style={{ color: "#a5b4fc" }}>{COP(cuota)}</strong></span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Total intereses: <strong style={{ color: "#f59e0b" }}>{COP(totalInt)}</strong></span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Total pagado: <strong style={{ color: "#38bdf8" }}>{COP(cuota * plazo)}</strong></span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
        <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", margin: "0 0 14px" }}>Evolución del saldo</p>
          <div style={{ position: "relative", height: 220 }}><canvas ref={canvasRef1} /></div>
        </div>
        <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", margin: "0 0 14px" }}>Distribución del pago</p>
          <div style={{ position: "relative", height: 180 }}><canvas ref={canvasRef3} /></div>
          <div style={{ display: "flex", gap: 12, marginTop: 12, justifyContent: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.5)" }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#6366f1", display: "inline-block" }}></span>Capital</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.5)" }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#f59e0b", display: "inline-block" }}></span>Intereses</span>
          </div>
        </div>
      </div>
      <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px" }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", margin: "0 0 14px" }}>Capital vs Interés por cuota</p>
        <div style={{ position: "relative", height: 200 }}><canvas ref={canvasRef2} /></div>
      </div>
    </div>
  );
}

function HistorialDetalle({ item, onCerrar, onEditar, onExportar }) {
  const cuota = calcularCuota(item.monto, item.tasa, item.plazo);
  const totalPagado = cuota * item.plazo; const totalIntereses = totalPagado - item.monto;
  const analisis = analizarViabilidad(cuota, item.ingresos || 15000000, item.gastos || 8000000);
  const canvasViabRef = useRef(); const canvasSaldoRef = useRef(); const chartsRef = useRef([]);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!window.Chart) return;
      chartsRef.current.forEach(c => { try { c.destroy(); } catch(e){} }); chartsRef.current = [];
      if (canvasViabRef.current) {
        const ing = item.ingresos || 15000000; const gastos = item.gastos || 8000000; const libre = Math.max(0, ing - gastos - cuota);
        chartsRef.current.push(new window.Chart(canvasViabRef.current, { type: "doughnut", data: { labels: ["Cuota", "Gastos", "Ingreso libre"], datasets: [{ data: [Math.round(cuota), Math.round(gastos), Math.round(libre)], backgroundColor: [analisis.color, "#6366f1", "#1f2937"], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: "68%" } }));
      }
      if (canvasSaldoRef.current) {
        const tabla = generarAmortizacion(item.monto, item.tasa, item.plazo);
        const labels = tabla.map(r => `M${r.cuota}`); const capitales = tabla.map(r => Math.round(r.capital)); const intereses = tabla.map(r => Math.round(r.interes));
        chartsRef.current.push(new window.Chart(canvasSaldoRef.current, { type: "bar", data: { labels, datasets: [{ label: "Capital", data: capitales, backgroundColor: "rgba(99,102,241,0.7)", stack: "a" }, { label: "Interés", data: intereses, backgroundColor: "rgba(245,158,11,0.7)", stack: "a" }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { stacked: true, grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "rgba(255,255,255,0.3)", font: { size: 9 } } }, y: { stacked: true, grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "rgba(255,255,255,0.3)", font: { size: 9 }, callback: v => `$${(v/1e6).toFixed(1)}M` } } } } }));
      }
    }, 200);
    return () => { clearTimeout(timer); chartsRef.current.forEach(c => { try { c.destroy(); } catch(e){} }); };
  }, [item]);
  const ing = item.ingresos || 15000000; const gastos = item.gastos || 8000000; const libre = Math.max(0, ing - gastos - cuota);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onCerrar} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <Icon name="back" size={16} color="rgba(255,255,255,0.6)" />
        </button>
        <div>
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: 0 }}>{item.empresa}</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "2px 0 0" }}>Simulación del {item.fecha}</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => onEditar(item)} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, padding: "8px 14px", cursor: "pointer", color: "#a5b4fc", fontSize: 13, fontWeight: 600 }}><Icon name="edit" size={14} color="#a5b4fc" /> Editar</button>
          <button onClick={() => onExportar(item)} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: "8px 14px", cursor: "pointer", color: "#4ade80", fontSize: 13, fontWeight: 600 }}><Icon name="download" size={14} color="#4ade80" /> Exportar CSV</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[{ label: "Monto", value: COP(item.monto), color: "#a5b4fc" }, { label: "Cuota mensual", value: COP(cuota), color: "#38bdf8" }, { label: "Total intereses", value: COP(totalIntereses), color: "#f59e0b" }, { label: "% Endeudamiento", value: `${analisis.porcentajeEndeudamiento.toFixed(1)}%`, color: analisis.color }].map(m => (
          <div key={m.label} style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, textTransform: "uppercase", fontWeight: 600, margin: 0 }}>{m.label}</p>
            <p style={{ color: m.color, fontSize: 16, fontWeight: 700, margin: "6px 0 0" }}>{m.value}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", margin: "0 0 6px" }}>Distribución de ingresos</p>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: "0 0 14px" }}>Cómo se distribuye el ingreso mensual</p>
          <div style={{ position: "relative", height: 180 }}><canvas ref={canvasViabRef} /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
            {[{ label: "Cuota crédito", value: COP(Math.round(cuota)), color: analisis.color }, { label: "Gastos operativos", value: COP(gastos), color: "#6366f1" }, { label: "Ingreso libre", value: COP(Math.round(libre)), color: "#374151" }].map(l => (
              <div key={l.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.5)" }}><span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, display: "inline-block" }}></span>{l.label}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{l.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", margin: "0 0 6px" }}>Composición de cuotas</p>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: "0 0 14px" }}>Capital vs interés por mes</p>
          <div style={{ position: "relative", height: 220 }}><canvas ref={canvasSaldoRef} /></div>
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.5)" }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "#6366f1", display: "inline-block" }}></span>Capital</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.5)" }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "#f59e0b", display: "inline-block" }}></span>Interés</span>
          </div>
        </div>
      </div>
      <div style={{ background: "#111827", border: `2px solid ${analisis.color}33`, borderRadius: 14, padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <Icon name={analisis.estado === "viable" ? "check" : analisis.estado === "riesgoso" ? "warn" : "danger"} size={18} color={analisis.color} />
          <span style={{ color: analisis.color, fontWeight: 700, fontSize: 15 }}>{analisis.estado === "viable" ? "Crédito Viable" : analisis.estado === "riesgoso" ? "Riesgo Moderado" : "No Recomendable"}</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: "0 0 10px" }}>{analisis.mensaje}</p>
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, height: 6 }}>
          <div style={{ height: "100%", borderRadius: 8, width: `${Math.min(100, analisis.porcentajeEndeudamiento)}%`, background: analisis.color }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Tasa: {item.tasa}% anual · Plazo: {item.plazo} meses · {item.tipo === "aleman" ? "Alemana" : "Francesa"}</span>
          <span style={{ fontSize: 11, color: analisis.color, fontWeight: 600 }}>{analisis.porcentajeEndeudamiento.toFixed(1)}% del ingreso</span>
        </div>
      </div>
    </div>
  );
}

function Historial({ historial, onEliminar, onEditar, onVerDetalle, seleccionados, setSeleccionados, onExportarSeleccion }) {
  const [busqueda, setBusqueda] = useState("");
  const filtrado = historial.filter(h => h.empresa.toLowerCase().includes(busqueda.toLowerCase()));
  const estadoBadge = (estado) => {
    const cfg = { viable: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", label: "Viable" }, riesgoso: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Riesgoso" }, noViable: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "No viable" } };
    const c = cfg[estado] || cfg.riesgoso;
    return <span style={{ background: c.bg, color: c.color, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{c.label}</span>;
  };
  const toggleSeleccion = (id) => setSeleccionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  return (
    <div>
      <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Historial de Simulaciones</h1>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 20 }}>Haz clic en una fila para ver el detalle completo y gráficas de viabilidad.</p>
      <div style={{ display: "flex", gap: 12, marginBottom: 18, alignItems: "center" }}>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, display: "flex", alignItems: "center", padding: "0 14px" }}>
          <span style={{ color: "rgba(255,255,255,0.3)", marginRight: 8 }}>🔍</span>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar empresa..." style={{ flex: 1, background: "none", border: "none", padding: "11px 0", color: "#fff", fontSize: 14, outline: "none" }} />
        </div>
        {seleccionados.length > 0 && (
          <button onClick={() => onExportarSeleccion(seleccionados, historial)} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "10px 16px", cursor: "pointer", color: "#4ade80", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
            <Icon name="download" size={14} color="#4ade80" /> Exportar {seleccionados.length} seleccionada{seleccionados.length !== 1 ? "s" : ""}
          </button>
        )}
      </div>
      <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(99,102,241,0.08)" }}>
              <th style={{ padding: "12px 16px", width: 36 }}></th>
              {["Empresa", "Monto", "Tasa", "Plazo", "Fecha", "Estado", "Acciones"].map(h => (
                <th key={h} style={{ padding: "12px 16px", color: "rgba(255,255,255,0.4)", textAlign: "left", fontSize: 11, fontWeight: 600, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrado.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>No se encontraron simulaciones.</td></tr>
            ) : filtrado.map((h, i) => (
              <tr key={h.id} onClick={() => onVerDetalle(h)}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: seleccionados.includes(h.id) ? "rgba(99,102,241,0.08)" : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)", cursor: "pointer" }}
                onMouseEnter={e => { if (!seleccionados.includes(h.id)) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = seleccionados.includes(h.id) ? "rgba(99,102,241,0.08)" : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"; }}>
                <td style={{ padding: "12px 16px" }} onClick={e => { e.stopPropagation(); toggleSeleccion(h.id); }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${seleccionados.includes(h.id) ? "#6366f1" : "rgba(255,255,255,0.2)"}`, background: seleccionados.includes(h.id) ? "#6366f1" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    {seleccionados.includes(h.id) && <span style={{ color: "#fff", fontSize: 10, lineHeight: 1 }}>✓</span>}
                  </div>
                </td>
                <td style={{ padding: "12px 16px", color: "#fff", fontWeight: 500, fontSize: 14 }}>{h.empresa}</td>
                <td style={{ padding: "12px 16px", color: "#a5b4fc", fontSize: 13 }}>{COP(h.monto)}</td>
                <td style={{ padding: "12px 16px", color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{h.tasa}%</td>
                <td style={{ padding: "12px 16px", color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{h.plazo} m</td>
                <td style={{ padding: "12px 16px", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{h.fecha}</td>
                <td style={{ padding: "12px 16px" }}>{estadoBadge(h.estado)}</td>
                <td style={{ padding: "12px 16px" }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => onEditar(h)} style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 7, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}><Icon name="edit" size={13} color="#a5b4fc" /></button>
                    <button onClick={() => onEliminar(h.id)} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 7, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}><Icon name="trash" size={13} color="#f87171" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, marginTop: 10 }}>{filtrado.length} registros · {seleccionados.length > 0 ? `${seleccionados.length} seleccionados` : "Haz clic en una fila para ver detalle"}</p>
    </div>
  );
}

function ExportarView({ historial }) {
  const [selectedId, setSelectedId] = useState(null);
  const seleccionado = selectedId ? historial.find(h => h.id === selectedId) : null;
  const getResumen = (item) => { const cuota = calcularCuota(item.monto, item.tasa, item.plazo); return { cuota, totalPagado: cuota * item.plazo, totalIntereses: cuota * item.plazo - item.monto }; };
  const exportCSV = (item) => {
    const tabla = generarAmortizacion(item.monto, item.tasa, item.plazo);
    const rows = [["FINANZU - REPORTE DE AMORTIZACIÓN"], [`Empresa: ${item.empresa}`, `Monto: ${COP(item.monto)}`, `Tasa: ${item.tasa}%`, `Plazo: ${item.plazo} meses`], [], ["Cuota", "Capital", "Interés", "Pago Mensual", "Saldo Restante"], ...tabla.map(r => [r.cuota, r.capital.toFixed(2), r.interes.toFixed(2), r.pagoMensual.toFixed(2), r.saldo.toFixed(2)])];
    const csv = rows.map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `finanzu_${item.empresa.replace(/\s/g, "_")}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };
  const exportJSON = (item) => {
    const tabla = generarAmortizacion(item.monto, item.tasa, item.plazo);
    const { cuota, totalPagado, totalIntereses } = getResumen(item);
    const data = { empresa: item.empresa, monto: item.monto, tasa: item.tasa, plazo: item.plazo, cuotaMensual: cuota, totalPagado, totalIntereses, tabla };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `finanzu_${item.empresa.replace(/\s/g, "_")}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };
  return (
    <div>
      <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Exportar Reportes</h1>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 24 }}>Selecciona una simulación del historial para exportarla.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>Seleccionar simulación</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto" }}>
            {historial.map(h => {
              const { cuota } = getResumen(h); const isSelected = selectedId === h.id;
              const estadoColor = { viable: "#22c55e", riesgoso: "#f59e0b", noViable: "#ef4444" }[h.estado] || "#f59e0b";
              return (
                <div key={h.id} onClick={() => setSelectedId(h.id)} style={{ background: isSelected ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${isSelected ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)"}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div><p style={{ color: "#fff", fontSize: 14, fontWeight: 600, margin: 0 }}>{h.empresa}</p><p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, margin: "2px 0 0" }}>{h.fecha} · {h.plazo} meses · {h.tasa}%</p></div>
                    <div style={{ textAlign: "right" }}><p style={{ color: "#a5b4fc", fontSize: 13, fontWeight: 600, margin: 0 }}>{COP(h.monto)}</p><p style={{ color: estadoColor, fontSize: 11, margin: "2px 0 0" }}>{COP(Math.round(cuota))}/mes</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          {seleccionado ? (
            <>
              <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>F</span>
                  </div>
                  <div><p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>Finanzu Analytics</p><p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: 0 }}>Reporte de Simulación Crediticia</p></div>
                </div>
                {(() => { const { cuota, totalIntereses } = getResumen(seleccionado); return (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[["Empresa", seleccionado.empresa], ["Monto", COP(seleccionado.monto)], ["Cuota mensual", COP(Math.round(cuota))], ["Total intereses", COP(Math.round(totalIntereses))]].map(([k, v]) => (
                      <div key={k}><p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, textTransform: "uppercase", margin: 0 }}>{k}</p><p style={{ color: "#fff", fontSize: 13, fontWeight: 600, margin: "2px 0 0" }}>{v}</p></div>
                    ))}
                  </div>
                ); })()}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button onClick={() => exportCSV(seleccionado)} style={{ padding: "14px", borderRadius: 12, border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)", color: "#4ade80", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>📊 Exportar CSV</button>
                <button onClick={() => exportJSON(seleccionado)} style={{ padding: "14px", borderRadius: 12, border: "1px solid rgba(14,165,233,0.3)", background: "rgba(14,165,233,0.08)", color: "#38bdf8", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>🗂 Exportar JSON</button>
              </div>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, textAlign: "center", marginTop: 12 }}>Los archivos se descargan directamente a tu equipo</p>
            </>
          ) : (
            <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 40, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
              <span style={{ fontSize: 40, marginBottom: 16 }}>📂</span>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: 0 }}>Selecciona una simulación<br />del panel izquierdo para exportar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [seccion, setSeccion] = useState("dashboard");
  // ✅ FIX: historial unificado — incluye los datos demo desde el inicio
  const [historial, setHistorial] = useState(INITIAL_HISTORIAL);
  const [editData, setEditData] = useState(null);
  const [detalleItem, setDetalleItem] = useState(null);
  const [seleccionados, setSeleccionados] = useState([]);

  const handleLogin = (u) => { setUsuario(u); setLoggedIn(true); };
  const handleLogout = () => {
    setLoggedIn(false); setUsuario(null); setSeccion("dashboard");
    setEditData(null); setDetalleItem(null);
    setHistorial(INITIAL_HISTORIAL); // reset al logout
    setSeleccionados([]);
  };

  const handleGuardar = (sim) => {
    setHistorial(prev => {
      const existe = prev.findIndex(x => x.id === sim.id);
      if (existe >= 0) {
        const nuevo = [...prev];
        nuevo[existe] = sim;
        return nuevo;
      }
      return [...prev, sim];
    });
  };

  // ✅ FIX: elimina de historial unificado — funciona para todos los registros
  const handleEliminar = (id) => {
    setHistorial(h => h.filter(x => x.id !== id));
    setSeleccionados(prev => prev.filter(x => x !== id));
    if (detalleItem?.id === id) setDetalleItem(null);
  };

  const handleEditar = (item) => { setEditData({ ...item }); setDetalleItem(null); setSeccion("simulador"); };
  const handleExportarItem = (item) => {
    const tabla = generarAmortizacion(item.monto, item.tasa, item.plazo);
    const rows = [["FINANZU - REPORTE DE AMORTIZACIÓN"], [`Empresa: ${item.empresa}`, `Monto: ${COP(item.monto)}`, `Tasa: ${item.tasa}%`, `Plazo: ${item.plazo} meses`], [], ["Cuota", "Capital", "Interés", "Pago Mensual", "Saldo Restante"], ...tabla.map(r => [r.cuota, r.capital.toFixed(2), r.interes.toFixed(2), r.pagoMensual.toFixed(2), r.saldo.toFixed(2)])];
    const csv = rows.map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `finanzu_${item.empresa.replace(/\s/g, "_")}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };
  const handleExportarSeleccion = (ids, todos) => {
    const items = todos.filter(h => ids.includes(h.id));
    let csv = "FINANZU - EXPORTACIÓN MÚLTIPLE\n\n";
    items.forEach(item => { const cuota = calcularCuota(item.monto, item.tasa, item.plazo); csv += `Empresa: ${item.empresa};Monto: ${item.monto};Tasa: ${item.tasa}%;Plazo: ${item.plazo} meses;Cuota: ${cuota.toFixed(2)}\n`; });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `finanzu_seleccion_${ids.length}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };
  const handleNavigate = (id) => { setSeccion(id); setDetalleItem(null); };
  const mostrarDetalle = seccion === "historial" && detalleItem;

  if (!loggedIn) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#090d17", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Sidebar seccion={seccion} setSeccion={(s) => { setSeccion(s); setDetalleItem(null); }} usuario={usuario} onLogout={handleLogout} />
      <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>
        {seccion === "dashboard" && <Dashboard historial={historial} onNavigate={handleNavigate} />}
        {seccion === "simulador" && <Simulador onGuardar={handleGuardar} editData={editData} onClearEdit={() => setEditData(null)} />}
        {seccion === "graficos" && <GraficosView />}
        {seccion === "historial" && !detalleItem && (
          <Historial
            historial={historial}
            onEliminar={handleEliminar}
            onEditar={handleEditar}
            onVerDetalle={setDetalleItem}
            seleccionados={seleccionados}
            setSeleccionados={setSeleccionados}
            onExportarSeleccion={handleExportarSeleccion}
          />
        )}
        {mostrarDetalle && <HistorialDetalle item={detalleItem} onCerrar={() => setDetalleItem(null)} onEditar={handleEditar} onExportar={handleExportarItem} />}
        {seccion === "exportar" && <ExportarView historial={historial} />}
        {seccion === "planes" && <PlanesView />}
      </div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js" async />
    </div>
  );
}
