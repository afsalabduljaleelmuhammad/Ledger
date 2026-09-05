import { useState, useEffect, useMemo } from "react";
import { Plus, X, Trash2, Check, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { supabase } from "./lib/supabase";

function fmt(n) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n); }

export default function Loans({ session }) {
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [openPerson, setOpenPerson] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { loadEntries(); }, []);

  async function loadEntries() {
    const { data, error } = await supabase.from("loan_entries").select("*").eq("user_id", session.user.id).order("date", { ascending: false });
    if (error) setError(error.message);
    setEntries(data || []);
    setLoaded(true);
  }

  async function addEntry(entry) {
    const { data, error } = await supabase.from("loan_entries").insert({ ...entry, user_id: session.user.id }).select().single();
    if (error) { setError(error.message); return; }
    setEntries(prev => [data, ...prev]);
    setShowForm(false);
  }

  async function toggleSettled(id, current) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, settled: !current } : e));
    await supabase.from("loan_entries").update({ settled: !current }).eq("id", id);
  }

  async function deleteEntry(id) {
    setEntries(prev => prev.filter(e => e.id !== id));
    await supabase.from("loan_entries").delete().eq("id", id);
  }

  const people = useMemo(() => {
    const map = {};
    entries.forEach(e => {
      if (!map[e.person_name]) map[e.person_name] = { name: e.person_name, balance: 0, entries: [] };
      const signed = e.direction === "lent" ? e.amount : -e.amount;
      if (!e.settled) map[e.person_name].balance += Number(signed);
      map[e.person_name].entries.push(e);
    });
    return Object.values(map).sort((a,b) => Math.abs(b.balance) - Math.abs(a.balance));
  }, [entries]);

  if (openPerson) {
    const person = people.find(p => p.name === openPerson);
    return (
      <PersonLedger
        person={person}
        onBack={() => setOpenPerson(null)}
        onToggleSettled={toggleSettled}
        onDelete={deleteEntry}
      />
    );
  }

  if (!loaded) {
    return <div style={{padding:"32px 0",textAlign:"center",color:"#6b7280",fontSize:13}} className="mono">loading…</div>;
  }

  const totalOwedToYou = people.reduce((s,p) => s + Math.max(p.balance, 0), 0);
  const totalYouOwe = people.reduce((s,p) => s + Math.max(-p.balance, 0), 0);

  return (
    <div className="fade-in">
      {error && <div style={{color:"#e07856",fontSize:12,marginBottom:12}}>{error}</div>}

      <div style={{display:"flex",gap:10,marginBottom:20}}>
        <div style={{flex:1,background:"#1a1e25",border:"1px solid #232830",borderRadius:12,padding:"14px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,color:"#6fcf97",marginBottom:8}}><ArrowDownLeft size={16}/><span style={{fontSize:12,fontWeight:600,color:"#8a9199"}}>Owed to you</span></div>
          <div className="mono" style={{fontSize:20,fontWeight:700,color:"#6fcf97"}}>{fmt(totalOwedToYou)}</div>
        </div>
        <div style={{flex:1,background:"#1a1e25",border:"1px solid #232830",borderRadius:12,padding:"14px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,color:"#e07856",marginBottom:8}}><ArrowUpRight size={16}/><span style={{fontSize:12,fontWeight:600,color:"#8a9199"}}>You owe</span></div>
          <div className="mono" style={{fontSize:20,fontWeight:700,color:"#e07856"}}>{fmt(totalYouOwe)}</div>
        </div>
      </div>

      {people.length === 0 && (
        <div style={{padding:"32px 0",textAlign:"center",color:"#6b7280",fontSize:13}}>
          No borrow/lend entries yet.
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {people.map(p => (
          <button key={p.name} onClick={() => setOpenPerson(p.name)}
            style={{textAlign:"left",background:"#1a1e25",border:"1px solid #232830",borderRadius:10,padding:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:"#e8e6e0"}}>{p.name}</div>
              <div className="mono" style={{fontSize:11,color:"#6b7280",marginTop:2}}>{p.entries.length} entr{p.entries.length===1?"y":"ies"}</div>
            </div>
            <div className="mono" style={{fontSize:14,fontWeight:700,color: p.balance === 0 ? "#6b7280" : p.balance > 0 ? "#6fcf97" : "#e07856"}}>
              {p.balance === 0 ? "settled" : p.balance > 0 ? `+${fmt(p.balance)}` : `-${fmt(Math.abs(p.balance))}`}
            </div>
          </button>
        ))}
      </div>

      <button onClick={() => setShowForm(true)}
        style={{marginTop:16,width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"12px 0",borderRadius:10,background:"#1a1e25",border:"1px dashed #2a2f38",color:"#c9a55c",fontSize:13,fontWeight:600}}>
        <Plus size={15}/> New entry
      </button>

      {showForm && <LoanEntryForm onClose={() => setShowForm(false)} onSave={addEntry} existingNames={people.map(p => p.name)} />}
    </div>
  );
}

function PersonLedger({ person, onBack, onToggleSettled, onDelete }) {
  const sorted = [...person.entries].sort((a,b) => b.date.localeCompare(a.date));
  return (
    <div className="fade-in">
      <button onClick={onBack} style={{background:"none",border:"none",color:"#8a9199",fontSize:13,marginBottom:16,padding:0}}>← Back</button>

      <div style={{marginBottom:16}}>
        <div style={{fontSize:18,fontWeight:700,color:"#e8e6e0"}} className="display">{person.name}</div>
        <div className="mono" style={{fontSize:14,fontWeight:700,marginTop:4,color: person.balance === 0 ? "#6b7280" : person.balance > 0 ? "#6fcf97" : "#e07856"}}>
          {person.balance === 0 ? "All settled" : person.balance > 0 ? `Owes you ${fmt(person.balance)}` : `You owe ${fmt(Math.abs(person.balance))}`}
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {sorted.map(e => (
          <div key={e.id} style={{background:"#1a1e25",border:"1px solid #232830",borderRadius:10,padding:"11px 14px",opacity: e.settled ? 0.5 : 1}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600}}>{e.direction === "lent" ? "You lent" : "You borrowed"}{e.note ? ` · ${e.note}` : ""}</div>
                <div className="mono" style={{fontSize:11,color:"#6b7280"}}>{e.date}{e.settled ? " · settled" : ""}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <span className="mono" style={{fontSize:13,fontWeight:600,color: e.direction === "lent" ? "#6fcf97" : "#e07856"}}>
                  {e.direction === "lent" ? "+" : "−"}{fmt(e.amount)}
                </span>
                <button onClick={() => onToggleSettled(e.id, e.settled)} title={e.settled ? "Mark unsettled" : "Mark settled"}
                  style={{background:"none",border:"none",color: e.settled ? "#6fcf97" : "#6b7280",padding:4}}>
                  <Check size={14}/>
                </button>
                <button onClick={() => onDelete(e.id)} style={{background:"none",border:"none",color:"#6b7280",padding:4}}><Trash2 size={14}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoanEntryForm({ onClose, onSave, existingNames }) {
  const [personName, setPersonName] = useState("");
  const [direction, setDirection] = useState("lent");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    const amt = Number(amount);
    if (!amt || amt <= 0 || !personName.trim()) return;
    setSaving(true);
    await onSave({ person_name: personName.trim(), direction, amount: amt, note: note.trim(), date, settled: false });
    setSaving(false);
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:50}}>
      <div className="fade-in" style={{background:"#1a1e25",border:"1px solid #232830",borderTopLeftRadius:16,borderTopRightRadius:16,width:"100%",maxWidth:480,padding:20,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:15}}>New borrow/lend entry</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#6b7280"}}><X size={18}/></button>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <button type="button" onClick={() => setDirection("lent")}
            style={{flex:1,padding:"9px 0",borderRadius:8,border:"1px solid " + (direction==="lent" ? "#c9a55c" : "#2a2f38"),
              background: direction==="lent" ? "rgba(201,165,92,0.12)" : "transparent",color: direction==="lent" ? "#c9a55c" : "#8a9199",fontWeight:600,fontSize:13}}>
            You lent
          </button>
          <button type="button" onClick={() => setDirection("borrowed")}
            style={{flex:1,padding:"9px 0",borderRadius:8,border:"1px solid " + (direction==="borrowed" ? "#c9a55c" : "#2a2f38"),
              background: direction==="borrowed" ? "rgba(201,165,92,0.12)" : "transparent",color: direction==="borrowed" ? "#c9a55c" : "#8a9199",fontWeight:600,fontSize:13}}>
            You borrowed
          </button>
        </div>

        <Field label="Person's name">
          <input value={personName} onChange={e => setPersonName(e.target.value)} autoFocus placeholder="e.g. Rahul" style={inputStyle} list="loan-people" />
          <datalist id="loan-people">
            {existingNames.map(n => <option key={n} value={n} />)}
          </datalist>
        </Field>

        <Field label="Amount">
          <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="mono" style={inputStyle} />
        </Field>

        <Field label="Note (optional)">
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. for movie tickets" style={inputStyle} />
        </Field>

        <Field label="Date">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mono" style={inputStyle} />
        </Field>

        <button onClick={handleSubmit} disabled={saving || !amount || !personName.trim()}
          style={{width:"100%",padding:"13px 0",borderRadius:10,background:"#c9a55c",border:"none",color:"#12151a",fontWeight:700,fontSize:14,opacity:(saving || !amount || !personName.trim())?0.6:1}}>
          {saving ? "Saving…" : "Add entry"}
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
