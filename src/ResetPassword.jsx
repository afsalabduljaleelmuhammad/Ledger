import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "./lib/supabase";

export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else setDone(true);
    setBusy(false);
  }

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#12151a",padding:20}}>
      <div className="fade-in" style={{width:"100%",maxWidth:380}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:32,justifyContent:"center"}}>
          <div style={{width:38,height:38,borderRadius:9,background:"#c9a55c",display:"flex",alignItems:"center",justifyContent:"center",color:"#12151a",fontWeight:800,fontSize:18}}>₹</div>
          <div className="display" style={{fontSize:22,fontWeight:700}}>Ledger</div>
        </div>

        {done ? (
          <div style={{textAlign:"center"}}>
            <div style={{color:"#6fcf97",fontSize:14,marginBottom:16}}>Password updated.</div>
            <button onClick={onDone} style={{width:"100%",padding:"12px 0",borderRadius:10,background:"#c9a55c",border:"none",color:"#12151a",fontWeight:700,fontSize:14}}>
              Continue to Ledger
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{fontWeight:700,fontSize:16,marginBottom:16}}>Set a new password</div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:"#6b7280",marginBottom:6,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.03em"}}>New password</div>
              <div style={{position:"relative"}}>
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  required minLength={6} placeholder="At least 6 characters"
                  style={{width:"100%",background:"#12151a",border:"1px solid #2a2f38",borderRadius:8,color:"#e8e6e0",padding:"10px 40px 10px 12px",fontSize:14}} />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#6b7280",padding:4,display:"flex"}}>
                  {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {error && <div style={{color:"#e07856",fontSize:12,marginBottom:12}}>{error}</div>}

            <button type="submit" disabled={busy} style={{width:"100%",padding:"12px 0",borderRadius:10,background:"#c9a55c",border:"none",color:"#12151a",fontWeight:700,fontSize:14,opacity:busy?0.6:1}}>
              {busy ? "Saving…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
