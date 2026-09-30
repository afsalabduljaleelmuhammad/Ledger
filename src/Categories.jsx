import { useState, useEffect } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { supabase } from "./lib/supabase";
import { useLang } from "./lib/LangContext";

const DEFAULT_EXPENSE = ["Food", "Transport", "Rent", "Utilities", "Health", "Shopping", "Education", "Entertainment", "Other"];
const DEFAULT_INCOME = ["Salary", "Allowance", "Freelance", "Gift", "Other"];

export default function Categories({ session, onBack }) {
  const { t } = useLang();
  const [custom, setCustom] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("expense");
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const { data, error } = await supabase.from("custom_categories").select("*").eq("user_id", session.user.id).order("created_at");
    if (error) setError(error.message);
    setCustom(data || []);
    setLoaded(true);
  }

  async function addCategory(name, type) {
    const { data, error } = await supabase.from("custom_categories").insert({ user_id: session.user.id, name, type }).select().single();
    if (error) { setError(error.message); return; }
    setCustom(prev => [...prev, data]);
    setShowForm(false);
  }

  async function deleteCategory(id) {
    setCustom(prev => prev.filter(c => c.id !== id));
    await supabase.from("custom_categories").delete().eq("id", id);
  }

  const customExpense = custom.filter(c => c.type === "expense");
  const customIncome = custom.filter(c => c.type === "income");

  if (!loaded) {
    return <div style={{padding:"28px 0",textAlign:"center",color:"#6b7280",fontSize:13}} className="mono">loading…</div>;
  }

  return (
    <div className="fade-in">
      <button onClick={onBack} style={{background:"none",border:"none",color:"#8a9199",fontSize:13,marginBottom:14,padding:0}}>← {t.overview}</button>

      <div style={{marginBottom:18}}>
        <div className="display" style={{fontSize:18,fontWeight:700,color:"#e8e6e0",marginBottom:6}}>Categories</div>
        <div style={{fontSize:13,color:"#8a9199"}}>Add your own categories alongside the defaults. They'll show up when adding entries and setting budgets.</div>
      </div>

      {error && <div style={{color:"#e07856",fontSize:12,marginBottom:14}}>{error}</div>}

      <CategorySection
        title={t.expenses}
        defaults={DEFAULT_EXPENSE}
        custom={customExpense}
        onDelete={deleteCategory}
        onAdd={() => { setFormType("expense"); setShowForm(true); }}
      />

      <div style={{height:20}} />

      <CategorySection
        title={t.income}
        defaults={DEFAULT_INCOME}
        custom={customIncome}
        onDelete={deleteCategory}
        onAdd={() => { setFormType("income"); setShowForm(true); }}
      />

      {showForm && (
        <AddCategoryForm
          type={formType}
          existing={[...DEFAULT_EXPENSE, ...DEFAULT_INCOME, ...custom.map(c => c.name)]}
          onClose={() => setShowForm(false)}
          onSave={addCategory}
        />
      )}
    </div>
  );
}

function CategorySection({ title, defaults, custom, onDelete, onAdd }) {
  return (
    <div>
      <div style={{fontSize:13,color:"#8a9199",marginBottom:10,fontWeight:600}}>{title}</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:10}}>
        {defaults.map(name => (
          <div key={name} style={{background:"#1a1e25",border:"1px solid #232830",borderRadius:20,padding:"7px 14px",fontSize:13,color:"#8a9199"}}>
            {name}
          </div>
        ))}
        {custom.map(c => (
          <div key={c.id} style={{background:"rgba(201,165,92,0.1)",border:"1px solid #c9a55c",borderRadius:20,padding:"7px 10px 7px 14px",fontSize:13,color:"#c9a55c",display:"flex",alignItems:"center",gap:6}}>
            {c.name}
            <button onClick={() => onDelete(c.id)} style={{background:"none",border:"none",color:"#c9a55c",padding:2,display:"flex"}}>
              <X size={13}/>
            </button>
          </div>
        ))}
      </div>
      <button onClick={onAdd} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"1px dashed #2a2f38",borderRadius:20,padding:"7px 14px",color:"#c9a55c",fontSize:13,fontWeight:600}}>
        <Plus size={14}/> Add
      </button>
    </div>
  );
}

function AddCategoryForm({ type, existing, onClose, onSave }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (existing.some(e => e.toLowerCase() === trimmed.toLowerCase())) {
      setError("This category already exists.");
      return;
    }
    setSaving(true);
    await onSave(trimmed, type);
    setSaving(false);
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:50}}>
      <div className="fade-in" style={{background:"#1a1e25",border:"1px solid #232830",borderTopLeftRadius:16,borderTopRightRadius:16,width:"100%",maxWidth:480,padding:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:15}}>New {type === "expense" ? "expense" : "income"} category</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#6b7280"}}><X size={18}/></button>
        </div>

        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:"#6b7280",marginBottom:6,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.03em"}}>Category name</div>
          <input value={name} onChange={e => { setName(e.target.value); setError(""); }} autoFocus placeholder="e.g. Pets"
            style={{width:"100%",background:"#12151a",border:"1px solid #2a2f38",borderRadius:8,color:"#e8e6e0",padding:"10px 12px",fontSize:14}} />
          {error && <div style={{color:"#e07856",fontSize:12,marginTop:8}}>{error}</div>}
        </div>

        <button onClick={handleSubmit} disabled={saving || !name.trim()}
          style={{width:"100%",padding:"13px 0",borderRadius:10,background:"#c9a55c",border:"none",color:"#12151a",fontWeight:700,fontSize:14,opacity:(saving || !name.trim())?0.6:1}}>
          {saving ? "Saving…" : "Add category"}
        </button>
      </div>
    </div>
  );
          }
