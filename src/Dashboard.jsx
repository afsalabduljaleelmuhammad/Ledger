import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, Download, FileText, X, AlertTriangle, RotateCcw, LogOut } from "lucide-react";
import { supabase } from "./lib/supabase";
import { useLang } from "./lib/LangContext";
import LangSwitch from "./LangSwitch.jsx";
import InstallButton from "./InstallButton.jsx";
import Events from "./Events.jsx";
import Loans from "./Loans.jsx";
import Help from "./Help.jsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CATEGORIES = ["Food", "Transport", "Rent", "Utilities", "Health", "Shopping", "Education", "Entertainment", "Other"];
const INCOME_CATEGORIES = ["Salary", "Allowance", "Freelance", "Gift", "Other"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function monthKey(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; }
function fmt(n) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n); }

export default function Dashboard({ session, joinCode }) {
  const { t } = useLang();
  const [entries, setEntries] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState(joinCode ? "events" : "overview");
  const [selectedMonth, setSelectedMonth] = useState(monthKey(new Date()));
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (joinCode) {
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", cleanUrl);
    }
  }, [joinCode]);

  const displayName = session.user.user_metadata?.display_name || session.user.email;

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const [{ data: e, error: eErr }, { data: b, error: bErr }] = await Promise.all([
      supabase.from("entries").select("*").order("date", { ascending: false }),
      supabase.from("budgets").select("*"),
    ]);
    if (eErr || bErr) setError((eErr || bErr).message);
    setEntries(e || []);
    const bMap = {};
    (b || []).forEach(row => { bMap[row.category] = row.amount; });
    setBudgets(bMap);
    setLoaded(true);
  }

  const months = useMemo(() => {
    const set = new Set(entries.map(e => e.date.slice(0,7)));
    set.add(monthKey(new Date()));
    return Array.from(set).sort().reverse();
  }, [entries]);

  const monthEntries = useMemo(() => entries.filter(e => e.date.slice(0,7) === selectedMonth), [entries, selectedMonth]);
  const monthIncome = useMemo(() => monthEntries.filter(e => e.type === "income").reduce((s,e) => s+Number(e.amount), 0), [monthEntries]);
  const monthExpense = useMemo(() => monthEntries.filter(e => e.type === "expense").reduce((s,e) => s+Number(e.amount), 0), [monthEntries]);
  const netSavings = monthIncome - monthExpense;

  const categoryTotals = useMemo(() => {
    const map = {};
    monthEntries.filter(e => e.type === "expense").forEach(e => { map[e.category] = (map[e.category]||0) + Number(e.amount); });
    return Object.entries(map).sort((a,b) => b[1]-a[1]);
  }, [monthEntries]);

  const totalBudget = useMemo(() => Object.values(budgets).reduce((s,v) => s+(Number(v)||0), 0), [budgets]);

  async function addEntry(entry) {
    const { data, error } = await supabase.from("entries").insert({ ...entry, user_id: session.user.id }).select().single();
    if (error) { setError(error.message); return; }
    setEntries(prev => [data, ...prev]);
    setShowForm(false);
  }

  async function deleteEntry(id) {
    setEntries(prev => prev.filter(e => e.id !== id));
    const { error } = await supabase.from("entries").delete().eq("id", id);
    if (error) setError(error.message);
  }

  async function updateBudget(category, amount) {
    setBudgets(prev => ({ ...prev, [category]: amount }));
    if (amount === undefined) {
      await supabase.from("budgets").delete().eq("user_id", session.user.id).eq("category", category);
      return;
    }
    const { error } = await supabase.from("budgets").upsert(
      { user_id: session.user.id, category, amount },
      { onConflict: "user_id,category" }
    );
    if (error) setError(error.message);
  }

  function exportCSV() {
    const rows = [["Date","Type","Category","Amount","Note","Recurring"]];
    [...entries].sort((a,b) => a.date.localeCompare(b.date)).forEach(e => {
      rows.push([e.date, e.type, e.category, e.amount, e.note || "", e.recurring ? "yes" : ""]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ledger-${selectedMonth}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const monthExpenses = [...monthEntries].filter(e => e.type === "expense").sort((a,b) => a.date.localeCompare(b.date));
    const [y, mo] = selectedMonth.split("-");
    const monthLabel = `${MONTH_NAMES[+mo-1]} ${y}`;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${t.appName} - Expenses`, 14, 18);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(monthLabel, 14, 25);

    autoTable(doc, {
      startY: 32,
      head: [["Date", "Category", "Note", "Amount (Rs.)"]],
      body: monthExpenses.map(e => [e.date, e.category, e.note || "-", Number(e.amount).toLocaleString("en-IN")]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [201, 165, 92], textColor: [18, 21, 26] },
      columnStyles: { 3: { halign: "right" } },
      foot: [["", "", "Total", monthExpense.toLocaleString("en-IN")]],
      footStyles: { fillColor: [26, 30, 37], textColor: [232, 230, 224], fontStyle: "bold" },
      columnStylesFoot: { 3: { halign: "right" } },
    });

    doc.save(`${t.appName}-expenses-${selectedMonth}.pdf`);
  }

  if (!loaded) {
    return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#12151a",color:"#6b7280"}} className="mono">loading ledger…</div>;
  }

  return (
    <div style={{minHeight:"100vh",background:"#12151a",color:"#e8e6e0"}}>
      <header style={{borderBottom:"1px solid #232830",padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:8,background:"#c9a55c",display:"flex",alignItems:"center",justifyContent:"center",color:"#12151a",fontWeight:800}}>₹</div>
          <div>
            <div className="display" style={{fontWeight:700,fontSize:16}}>{t.appName}</div>
            <div className="mono" style={{fontSize:11,color:"#6b7280"}}>{displayName}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <InstallButton />
          <LangSwitch />
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
            className="mono" style={{background:"#1a1e25",border:"1px solid #2a2f38",color:"#e8e6e0",padding:"8px 12px",borderRadius:8,fontSize:13}}>
            {months.map(m => {
              const [y,mo] = m.split("-");
              return <option key={m} value={m}>{MONTH_NAMES[+mo-1]} {y}</option>;
            })}
          </select>
          <button onClick={() => supabase.auth.signOut()} title="Sign out" style={{background:"#1a1e25",border:"1px solid #2a2f38",borderRadius:8,padding:"8px 10px",color:"#8a9199"}}>
            <LogOut size={14}/>
          </button>
        </div>
      </header>

      {error && (
        <div style={{background:"rgba(224,120,86,0.1)",borderBottom:"1px solid rgba(224,120,86,0.3)",color:"#e07856",padding:"8px 24px",fontSize:12}}>{error}</div>
      )}

      <nav style={{display:"flex",gap:2,padding:"0 24px",borderBottom:"1px solid #232830"}}>
        {[["overview",t.overview],["transactions",t.transactions],["budgets",t.budgets],["events",t.events],["loans",t.loans],["help","Help"]].map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{padding:"12px 4px",marginRight:20,background:"none",border:"none",color: tab===key ? "#e8e6e0" : "#6b7280",
              borderBottom: tab===key ? "2px solid #c9a55c" : "2px solid transparent",fontSize:13,fontWeight:600}}>
            {label}
          </button>
        ))}
      </nav>

      <main style={{padding:"24px",maxWidth:920,margin:"0 auto"}}>
        {tab === "overview" && (
          <div className="fade-in">
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:24}}>
              <StatCard icon={<TrendingUp size={16}/>} label={t.income} value={fmt(monthIncome)} color="#6fcf97" />
              <StatCard icon={<TrendingDown size={16}/>} label={t.expenses} value={fmt(monthExpense)} color="#e07856" />
              <StatCard icon={<Wallet size={16}/>} label={t.net} value={fmt(netSavings)} color={netSavings>=0?"#6fcf97":"#e07856"} />
            </div>

            {totalBudget > 0 && (
              <div style={{marginBottom:24}}>
                <div style={{fontSize:13,color:"#8a9199",marginBottom:8,fontWeight:600}}>Budget usage</div>
                <BudgetBar spent={monthExpense} budget={totalBudget} />
              </div>
            )}

            <div style={{fontSize:13,color:"#8a9199",marginBottom:10,fontWeight:600}}>{t.byCategory}</div>
            {categoryTotals.length === 0 && <EmptyNote text={t.noExpenses} />}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {categoryTotals.map(([cat,amt]) => {
                const budget = budgets[cat];
                const pct = monthExpense ? (amt/monthExpense*100) : 0;
                const over = budget && amt > budget;
                return (
                  <div key={cat} style={{background:"#1a1e25",border:"1px solid #232830",borderRadius:10,padding:"12px 14px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}>
                      <span style={{fontWeight:600}}>{cat}</span>
                      <span className="mono" style={{color: over ? "#e07856" : "#e8e6e0"}}>
                        {fmt(amt)}{budget ? ` / ${fmt(budget)}` : ""}
                      </span>
                    </div>
                    <div style={{height:5,background:"#232830",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:"#c9a55c",borderRadius:3}} />
                    </div>
                    {over && <div style={{fontSize:11,color:"#e07856",marginTop:6,display:"flex",alignItems:"center",gap:4}}><AlertTriangle size={11}/> {t.overBudgetBy} {fmt(amt-budget)}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "transactions" && (
          <div className="fade-in">
            {monthEntries.length === 0 && <EmptyNote text={t.nothingLogged} />}
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[...monthEntries].sort((a,b) => b.date.localeCompare(a.date)).map(e => (
                <div key={e.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#1a1e25",border:"1px solid #232830",borderRadius:10,padding:"11px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:e.type==="income"?"#6fcf97":"#e07856",flexShrink:0}} />
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.note || e.category}</div>
                      <div className="mono" style={{fontSize:11,color:"#6b7280"}}>{e.date} · {e.category}{e.recurring ? " · recurring" : ""}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                    <span className="mono" style={{fontSize:13,fontWeight:600,color:e.type==="income"?"#6fcf97":"#e07856"}}>
                      {e.type==="income"?"+":"−"}{fmt(e.amount)}
                    </span>
                    <button onClick={() => deleteEntry(e.id)} style={{background:"none",border:"none",color:"#6b7280",padding:4}}><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8,marginTop:16}}>
              <button onClick={exportCSV} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"1px solid #2a2f38",color:"#8a9199",padding:"8px 14px",borderRadius:8,fontSize:12}}>
                <Download size={13}/> {t.exportCSV}
              </button>
              <button onClick={exportPDF} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"1px solid #2a2f38",color:"#8a9199",padding:"8px 14px",borderRadius:8,fontSize:12}}>
                <FileText size={13}/> Export PDF
              </button>
            </div>
          </div>
        )}

        {tab === "budgets" && (
          <div className="fade-in">
            <div style={{fontSize:13,color:"#8a9199",marginBottom:12,fontWeight:600}}>{t.monthlyLimits}</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {CATEGORIES.map(cat => (
                <div key={cat} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#1a1e25",border:"1px solid #232830",borderRadius:10,padding:"10px 14px"}}>
                  <span style={{fontSize:13,fontWeight:600}}>{cat}</span>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span className="mono" style={{fontSize:13,color:"#6b7280"}}>₹</span>
                    <input type="number" min="0" placeholder="0" defaultValue={budgets[cat] || ""}
                      onBlur={e => updateBudget(cat, e.target.value === "" ? undefined : Number(e.target.value))}
                      className="mono" style={{width:100,background:"#12151a",border:"1px solid #2a2f38",borderRadius:6,color:"#e8e6e0",padding:"6px 8px",fontSize:13,textAlign:"right"}} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "events" && <Events session={session} joinCode={joinCode} />}
        {tab === "loans" && <Loans session={session} />}
        {tab === "help" && <Help onBack={() => setTab("overview")} />}
      </main>

      {tab !== "events" && tab !== "loans" && tab !== "help" && <button onClick={() => setShowForm(true)}
        style={{position:"fixed",bottom:24,right:24,width:56,height:56,borderRadius:"50%",background:"#c9a55c",border:"none",
          display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(201,165,92,0.35)"}}>
        <Plus size={24} color="#12151a" />
      </button>}

      {showForm && <EntryForm onClose={() => setShowForm(false)} onSave={addEntry} t={t} />}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{background:"#1a1e25",border:"1px solid #232830",borderRadius:12,padding:"14px 16px"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,color,marginBottom:8}}>{icon}<span style={{fontSize:12,fontWeight:600,color:"#8a9199"}}>{label}</span></div>
      <div className="mono" style={{fontSize:20,fontWeight:700,color}}>{value}</div>
    </div>
  );
}

function BudgetBar({ spent, budget }) {
  const pct = Math.min((spent/budget)*100, 100);
  const over = spent > budget;
  return (
    <div>
      <div style={{height:8,background:"#232830",borderRadius:4,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background: over ? "#e07856" : "#c9a55c",borderRadius:4}} />
      </div>
      <div className="mono" style={{fontSize:11,color:"#6b7280",marginTop:6}}>{fmt(spent)} of {fmt(budget)} {over ? "— over budget" : "used"}</div>
    </div>
  );
}

function EmptyNote({ text }) {
  return <div style={{padding:"32px 0",textAlign:"center",color:"#6b7280",fontSize:13}}>{text}</div>;
}

function EntryForm({ onClose, onSave, t }) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [recurring, setRecurring] = useState(false);
  const [saving, setSaving] = useState(false);

  const cats = type === "income" ? INCOME_CATEGORIES : CATEGORIES;

  async function handleSubmit() {
    const amt = Number(amount);
    if (!amt || amt <= 0) return;
    setSaving(true);
    await onSave({ type, amount: amt, category, note: note.trim(), date, recurring });
    setSaving(false);
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:50}}>
      <div className="fade-in" style={{background:"#1a1e25",border:"1px solid #232830",borderTopLeftRadius:16,borderTopRightRadius:16,width:"100%",maxWidth:480,padding:20,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:15}}>{t.newEntry}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#6b7280"}}><X size={18}/></button>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {["expense","income"].map(ty => (
            <button key={ty} onClick={() => { setType(ty); setCategory(ty==="income"?INCOME_CATEGORIES[0]:CATEGORIES[0]); }}
              style={{flex:1,padding:"9px 0",borderRadius:8,border:"1px solid " + (type===ty ? "#c9a55c" : "#2a2f38"),
                background: type===ty ? "rgba(201,165,92,0.12)" : "transparent",color: type===ty ? "#c9a55c" : "#8a9199",fontWeight:600,fontSize:13,textTransform:"capitalize"}}>
              {ty === "income" ? t.income : t.expenses}
            </button>
          ))}
        </div>

        <Field label={t.amount}>
          <input type="number" min="0" autoFocus value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
            className="mono" style={inputStyle} />
        </Field>

        <Field label={t.category}>
          <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label={t.note}>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. groceries at store" style={inputStyle} />
        </Field>

        <Field label={t.date}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mono" style={inputStyle} />
        </Field>

        <button onClick={() => setRecurring(r => !r)} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",color:"#8a9199",fontSize:12,marginBottom:16,padding:"4px 0"}}>
          <div style={{width:16,height:16,borderRadius:4,border:"1px solid #2a2f38",background: recurring ? "#c9a55c" : "transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {recurring && <RotateCcw size={10} color="#12151a"/>}
          </div>
          {t.repeatsMonthly}
        </button>

        <button onClick={handleSubmit} disabled={saving} style={{width:"100%",padding:"13px 0",borderRadius:10,background:"#c9a55c",border:"none",color:"#12151a",fontWeight:700,fontSize:14,opacity:saving?0.6:1}}>
          {saving ? "…" : `${t.add} ${type === "income" ? t.income : t.expenses}`}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:11,color:"#6b7280",marginBottom:6,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.03em"}}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = { width:"100%",background:"#12151a",border:"1px solid #2a2f38",borderRadius:8,color:"#e8e6e0",padding:"10px 12px",fontSize:14 };
