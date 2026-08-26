import { useState } from "react";
import { supabase } from "./lib/supabase";

export default function AuthScreen() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name } },
      });
      if (error) setError(error.message);
      else setNotice("Account created. Check your email to confirm, then sign in.");
    }
    setBusy(false);
  }

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#12151a",padding:20}}>
      <div className="fade-in" style={{width:"100%",maxWidth:380}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:32,justifyContent:"center"}}>
          <div style={{width:38,height:38,borderRadius:9,background:"#c9a55c",display:"flex",alignItems:"center",justifyContent:"center",color:"#12151a",fontWeight:800,fontSize:18}}>₹</div>
          <div className="display" style={{fontSize:22,fontWeight:700}}>Ledger</div>
        </div>

        <div style={{display:"flex",gap:6,marginBottom:24,background:"#1a1e25",borderRadius:10,padding:4}}>
          {["signin","signup"].map(m => (
            <button key={m} type="button" onClick={() => { setMode(m); setError(""); setNotice(""); }}
              style={{flex:1,padding:"9px 0",borderRadius:7,border:"none",fontSize:13,fontWeight:600,
                background: mode===m ? "#12151a" : "transparent",color: mode===m ? "#e8e6e0" : "#6b7280"}}>
              {m === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <Field label="Your name">
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Afsal" style={inputStyle} />
            </Field>
          )}
          <Field label="Email">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={inputStyle} />
          </Field>
          <Field label="Password">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" style={inputStyle} />
          </Field>

          {error && <div style={{color:"#e07856",fontSize:12,marginBottom:12}}>{error}</div>}
          {notice && <div style={{color:"#6fcf97",fontSize:12,marginBottom:12}}>{notice}</div>}

          <button type="submit" disabled={busy} style={{width:"100%",padding:"12px 0",borderRadius:10,background:"#c9a55c",border:"none",color:"#12151a",fontWeight:700,fontSize:14,opacity:busy?0.6:1}}>
            {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div style={{textAlign:"center",fontSize:11,color:"#4b5259",marginTop:20}} className="mono">
          each account's entries are private, visible only to you
        </div>
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
