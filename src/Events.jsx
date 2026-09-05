import { useState, useEffect, useMemo } from "react";
import { Plus, X, Share2, Download, Trash2, Copy, Check, Eye, Pencil } from "lucide-react";
import { supabase } from "./lib/supabase";
import { useLang } from "./lib/LangContext";

const CATEGORIES = ["Food", "Transport", "Rent", "Utilities", "Health", "Shopping", "Education", "Entertainment", "Other"];

function fmt(n) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n); }

export default function Events({ session, joinCode }) {
  const { t } = useLang();
  const [ownEvents, setOwnEvents] = useState([]);
  const [memberEvents, setMemberEvents] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [openEvent, setOpenEvent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { loadEvents(); }, []);

  useEffect(() => {
    if (joinCode) resolveJoinCode(joinCode);
  }, [joinCode]);

  async function resolveJoinCode(code) {
    const { data, error } = await supabase.from("events").select("*").eq("share_code", code).maybeSingle();
    if (error) { setError(error.message); return; }
    if (data) setOpenEvent(data);
    else setError("That event link is invalid or no longer exists.");
  }

  async function loadEvents() {
    const { data: owned, error: e1 } = await supabase.from("events").select("*").eq("owner_id", session.user.id).order("created_at", { ascending: false });
    const { data: memberships, error: e2 } = await supabase.from("event_members").select("event_id, events(*)").eq("user_id", session.user.id);
    if (e1 || e2) setError((e1 || e2).message);
    setOwnEvents(owned || []);
    setMemberEvents((memberships || []).map(m => m.events).filter(ev => ev && ev.owner_id !== session.user.id));
    setLoaded(true);
  }

  async function createEvent({ name, description, budget, permission }) {
    const { data, error } = await supabase.from("events").insert({
      owner_id: session.user.id, name, description, budget: budget || null, permission,
    }).select().single();
    if (error) { setError(error.message); return; }
    setOwnEvents(prev => [data, ...prev]);
    setShowCreate(false);
    setOpenEvent(data);
  }

  async function deleteEvent(id) {
    setOwnEvents(prev => prev.filter(e => e.id !== id));
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) setError(error.message);
  }

  if (openEvent) {
    return <EventDetail event={openEvent} session={session} isOwner={openEvent.owner_id === session.user.id} onBack={() => { setOpenEvent(null); loadEvents(); }} />;
  }

  if (!loaded) {
    return <div style={{padding:"32px 0",textAlign:"center",color:"#6b7280",fontSize:13}} className="mono">loading…</div>;
  }

  const allEvents = [...ownEvents, ...memberEvents];

  return (
    <div className="fade-in">
      {error && <div style={{color:"#e07856",fontSize:12,marginBottom:12}}>{error}</div>}

      {allEvents.length === 0 && (
        <div style={{padding:"32px 0",textAlign:"center",color:"#6b7280",fontSize:13}}>
          No events yet. Create one to track a trip or special occasion with others.
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {allEvents.map(ev => (
          <button key={ev.id} onClick={() => setOpenEvent(ev)}
            style={{textAlign:"left",background:"#1a1e25",border:"1px solid #232830",borderRadius:10,padding:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:"#e8e6e0"}}>{ev.name}</div>
              <div className="mono" style={{fontSize:11,color:"#6b7280",marginTop:2}}>
                {ev.owner_id === session.user.id ? "you own this" : "shared with you"} · {ev.permission === "edit" ? "everyone can add" : "view only"}
              </div>
            </div>
            {ev.budget && <div className="mono" style={{fontSize:13,color:"#c9a55c"}}>{fmt(ev.budget)}</div>}
          </button>
        ))}
      </div>

      <button onClick={() => setShowCreate(true)}
        style={{marginTop:16,width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"12px 0",borderRadius:10,background:"#1a1e25",border:"1px dashed #2a2f38",color:"#c9a55c",fontSize:13,fontWeight:600}}>
        <Plus size={15}/> New event
      </button>

      {showCreate && <CreateEventForm onClose={() => setShowCreate(false)} onSave={createEvent} />}
    </div>
  );
}

function CreateEventForm({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [permission, setPermission] = useState("view");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ name: name.trim(), description: description.trim(), budget: budget ? Number(budget) : null, permission });
    setSaving(false);
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:50}}>
      <div className="fade-in" style={{background:"#1a1e25",border:"1px solid #232830",borderTopLeftRadius:16,borderTopRightRadius:16,width:"100%",maxWidth:480,padding:20,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:15}}>New event</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#6b7280"}}><X size={18}/></button>
        </div>

        <Field label="Event name">
          <input value={name} onChange={e => setName(e.target.value)} autoFocus placeholder="e.g. Onam 2026" style={inputStyle} />
        </Field>

        <Field label="Description (optional)">
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. family trip to Munnar" style={inputStyle} />
        </Field>

        <Field label="Budget (optional)">
          <input type="number" min="0" value={budget} onChange={e => setBudget(e.target.value)} placeholder="0" className="mono" style={inputStyle} />
        </Field>

        <Field label="Who can add expenses">
          <div style={{display:"flex",gap:8}}>
            <button type="button" onClick={() => setPermission("view")}
              style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px 0",borderRadius:8,border:"1px solid " + (permission==="view" ? "#c9a55c" : "#2a2f38"),
                background: permission==="view" ? "rgba(201,165,92,0.12)" : "transparent",color: permission==="view" ? "#c9a55c" : "#8a9199",fontSize:13,fontWeight:600}}>
              <Eye size={14}/> Only me
            </button>
            <button type="button" onClick={() => setPermission("edit")}
              style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px 0",borderRadius:8,border:"1px solid " + (permission==="edit" ? "#c9a55c" : "#2a2f38"),
                background: permission==="edit" ? "rgba(201,165,92,0.12)" : "transparent",color: permission==="edit" ? "#c9a55c" : "#8a9199",fontSize:13,fontWeight:600}}>
              <Pencil size={14}/> Everyone
            </button>
          </div>
        </Field>

        <button onClick={handleSubmit} disabled={saving || !name.trim()}
          style={{width:"100%",padding:"13px 0",borderRadius:10,background:"#c9a55c",border:"none",color:"#12151a",fontWeight:700,fontSize:14,opacity:(saving || !name.trim())?0.6:1,marginTop:8}}>
          {saving ? "Creating…" : "Create event"}
        </button>
      </div>
    </div>
  );
}

function EventDetail({ event, session, isOwner, onBack }) {
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joining, setJoining] = useState(false);
  const [isMember, setIsMember] = useState(isOwner);
  const [error, setError] = useState("");

  const canAdd = isOwner || (event.permission === "edit" && isMember);

  useEffect(() => { init(); }, []);

  async function init() {
    if (!isOwner) {
      const { data } = await supabase.from("event_members").select("id").eq("event_id", event.id).eq("user_id", session.user.id).maybeSingle();
      setIsMember(!!data);
    }
    await loadEntries();
  }

  async function loadEntries() {
    const { data, error } = await supabase.from("event_entries").select("*").eq("event_id", event.id).order("date", { ascending: false });
    if (error) setError(error.message);
    setEntries(data || []);
    setLoaded(true);
  }

  async function joinEvent() {
    setJoining(true);
    const { error } = await supabase.from("event_members").insert({
      event_id: event.id, user_id: session.user.id,
      display_name: session.user.user_metadata?.display_name || session.user.email,
    });
    if (error) setError(error.message);
    else setIsMember(true);
    setJoining(false);
  }

  async function addEntry(entry) {
    const { data, error } = await supabase.from("event_entries").insert({ ...entry, event_id: event.id, user_id: session.user.id }).select().single();
    if (error) { setError(error.message); return; }
    setEntries(prev => [data, ...prev]);
    setShowForm(false);
  }

  async function deleteEntry(id) {
    setEntries(prev => prev.filter(e => e.id !== id));
    await supabase.from("event_entries").delete().eq("id", id);
  }

  function copyShareLink() {
    const url = `${window.location.origin}/#event/${event.share_code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function exportCSV() {
    const rows = [["Date","Category","Amount","Note"]];
    entries.forEach(e => rows.push([e.date, e.category, e.amount, e.note || ""]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${event.name.replace(/\s+/g,"-")}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const total = entries.reduce((s,e) => s+Number(e.amount), 0);

  return (
    <div className="fade-in">
      <button onClick={onBack} style={{background:"none",border:"none",color:"#8a9199",fontSize:13,marginBottom:16,padding:0}}>← Back to events</button>

      <div style={{marginBottom:16}}>
        <div style={{fontSize:18,fontWeight:700,color:"#e8e6e0"}} className="display">{event.name}</div>
        {event.description && <div style={{fontSize:13,color:"#8a9199",marginTop:2}}>{event.description}</div>}
      </div>

      {!isOwner && !isMember && (
        <div style={{background:"#1a1e25",border:"1px solid #232830",borderRadius:10,padding:14,marginBottom:16}}>
          <div style={{fontSize:13,color:"#8a9199",marginBottom:10}}>You're viewing this event. Join to see it in your events list.</div>
          <button onClick={joinEvent} disabled={joining} style={{width:"100%",padding:"10px 0",borderRadius:8,background:"#c9a55c",border:"none",color:"#12151a",fontWeight:600,fontSize:13}}>
            {joining ? "Joining…" : "Join event"}
          </button>
        </div>
      )}

      {error && <div style={{color:"#e07856",fontSize:12,marginBottom:12}}>{error}</div>}

      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <div style={{flex:1,background:"#1a1e25",border:"1px solid #232830",borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontSize:11,color:"#8a9199",marginBottom:4}}>Total spent</div>
          <div className="mono" style={{fontSize:18,fontWeight:700,color:"#c9a55c"}}>{fmt(total)}</div>
        </div>
        {event.budget && (
          <div style={{flex:1,background:"#1a1e25",border:"1px solid #232830",borderRadius:10,padding:"12px 14px"}}>
            <div style={{fontSize:11,color:"#8a9199",marginBottom:4}}>Budget</div>
            <div className="mono" style={{fontSize:18,fontWeight:700,color: total>event.budget ? "#e07856" : "#e8e6e0"}}>{fmt(event.budget)}</div>
          </div>
        )}
      </div>

      {isOwner && (
        <button onClick={copyShareLink} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px 0",borderRadius:8,background:"#1a1e25",border:"1px solid #2a2f38",color:"#8a9199",fontSize:13,marginBottom:16}}>
          {copied ? <><Check size={14} color="#6fcf97"/> Link copied</> : <><Share2 size={14}/> Share this event</>}
        </button>
      )}

      {!loaded ? (
        <div style={{padding:"32px 0",textAlign:"center",color:"#6b7280",fontSize:13}} className="mono">loading…</div>
      ) : (
        <>
          {entries.length === 0 && <div style={{padding:"24px 0",textAlign:"center",color:"#6b7280",fontSize:13}}>No expenses logged yet.</div>}
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {entries.map(e => (
              <div key={e.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#1a1e25",border:"1px solid #232830",borderRadius:10,padding:"11px 14px"}}>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.note || e.category}</div>
                  <div className="mono" style={{fontSize:11,color:"#6b7280"}}>{e.date} · {e.category}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                  <span className="mono" style={{fontSize:13,fontWeight:600,color:"#e07856"}}>{fmt(e.amount)}</span>
                  {(isOwner || e.user_id === session.user.id) && (
                    <button onClick={() => deleteEntry(e.id)} style={{background:"none",border:"none",color:"#6b7280",padding:4}}><Trash2 size={14}/></button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {entries.length > 0 && (
            <button onClick={exportCSV} style={{marginTop:16,display:"flex",alignItems:"center",gap:6,background:"none",border:"1px solid #2a2f38",color:"#8a9199",padding:"8px 14px",borderRadius:8,fontSize:12}}>
              <Download size={13}/> Export event as CSV
            </button>
          )}
        </>
      )}

      {canAdd && (
        <button onClick={() => setShowForm(true)}
          style={{position:"fixed",bottom:24,right:24,width:56,height:56,borderRadius:"50%",background:"#c9a55c",border:"none",
            display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(201,165,92,0.35)"}}>
          <Plus size={24} color="#12151a" />
        </button>
      )}

      {showForm && <EventEntryForm onClose={() => setShowForm(false)} onSave={addEntry} />}
    </div>
  );
}

function EventEntryForm({ onClose, onSave }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    const amt = Number(amount);
    if (!amt || amt <= 0) return;
    setSaving(true);
    await onSave({ amount: amt, category, note: note.trim(), date });
    setSaving(false);
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:50}}>
      <div className="fade-in" style={{background:"#1a1e25",border:"1px solid #232830",borderTopLeftRadius:16,borderTopRightRadius:16,width:"100%",maxWidth:480,padding:20,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:15}}>Add expense</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#6b7280"}}><X size={18}/></button>
        </div>

        <Field label="Amount">
          <input type="number" min="0" autoFocus value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="mono" style={inputStyle} />
        </Field>

        <Field label="Category">
          <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Note (optional)">
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. lunch at hotel" style={inputStyle} />
        </Field>

        <Field label="Date">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mono" style={inputStyle} />
        </Field>

        <button onClick={handleSubmit} disabled={saving} style={{width:"100%",padding:"13px 0",borderRadius:10,background:"#c9a55c",border:"none",color:"#12151a",fontWeight:700,fontSize:14,opacity:saving?0.6:1}}>
          {saving ? "Saving…" : "Add expense"}
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
