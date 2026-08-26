import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "./lib/supabase";

export default function AuthScreen() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/#reset-password",
      });
      if (error) setError(error.message);
      else setNotice("Check your email for a password reset link.");
      setBusy(false);
      return;
    }

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

        {mode !== "reset" && (
          <div style={{display:"flex",gap:6,marginBottom:24,background:"#1a1e25",borderRadius:10,padding:4}}>
            {["signin","signup"].map(m => (
              <button key={m} type="button" onClick={() => { setMode(m); setError(""); setNotice(""); }}
                style={{flex:1,padding:"9px 0",borderRadius:7,border:"none",fontSize:13,fontWeight:600,
                  background: mode===m ? "#12151a" : "transparent",color: mode===m ? "#e8e6e0" : "#6b7280"}}>
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>
        )}

        {mode === "reset" && (
          <div style={{marginBottom:20}}>
            <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>Reset password</div>
            <div style={{fontSize:12,color:"#8a9199"}}>We'll email you a link to set a new password.</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <Field label="Your name">
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Afsal" style={inputStyle} />
            </Field>
          )}
          <Field label="Email">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={inputStyle} />
          </Field>

          {mode !== "reset" && (
            <Field label="Password">
              <div style={{position:"relative"}}>
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  required minLength={6} placeholder="At least 6 characters" style={{...inputStyle, paddingRight:40}} />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#6b7280",padding:4,display:"flex"}}>
                  {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </Field>
          )}

          {mode === "signin" && (
            <button type="button" onClick={() => { setMode("reset"); setError(""); setNotice(""); }}
              style={{background:"none",border:"none",color:"#c9a55c",fontSize:12,padding:0,marginBottom:16,display:"block"}}>
              Forgot password?
            </button>
          )}

          {error && <div style={{color:"#e07856",fontSize:12,marginBottom:12}}>{error}</div>}
          {notice && <div style={{color:"#6fcf97",fontSize:12,marginBottom:12}}>{notice}</div>}

          <button type="submit" disabled={busy} style={{width:"100%",padding:"12px 0",borderRadius:10,background:"#c9a55c",border:"none",color:"#12151a",fontWeight:700,fontSize:14,opacity:busy?0.6:1}}>
            {busy ? "Working…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
          </button>

          {mode === "reset" && (
            <button type="button" onClick={() => { setMode("signin"); setError(""); setNotice(""); }}
              style={{width:"100%",background:"none",border:"none",color:"#8a9199",fontSize:12,marginTop:14}}>
              Back to sign in
            </button>
          )}
        </form>

        {mode !== "reset" && (
          <div style={{textAlign:"center",fontSize:11,color:"#4b5259",marginTop:20}} className="mono">
            each account's entries are private, visible only to you
          </div>
        )}
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
