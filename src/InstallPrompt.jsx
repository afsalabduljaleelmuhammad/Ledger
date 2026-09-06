import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [installed, setInstalled] = useState(
    window.matchMedia("(display-mode: standalone)").matches
  );

  useEffect(() => {
    function handler(e) {
      e.preventDefault();
      setPrompt(e);
      const suppressed = localStorage.getItem("kp_install_dismissed") === "1";
      if (!suppressed && !installed) {
        setTimeout(() => setVisible(true), 800);
      }
    }
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => { setInstalled(true); setVisible(false); });
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [installed]);

  function close() {
    if (dontShowAgain) localStorage.setItem("kp_install_dismissed", "1");
    setVisible(false);
  }

  async function handleInstall() {
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    setVisible(false);
  }

  if (!visible || installed) return null;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20}}>
      <div className="fade-in" style={{background:"#1a1e25",border:"1px solid #232830",borderRadius:16,width:"100%",maxWidth:360,padding:24,position:"relative"}}>
        <button onClick={close} style={{position:"absolute",top:14,right:14,background:"none",border:"none",color:"#6b7280",padding:4}}>
          <X size={18}/>
        </button>

        <div style={{width:52,height:52,borderRadius:14,background:"rgba(201,165,92,0.12)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
          <Download size={24} color="#c9a55c" />
        </div>
        <div style={{fontWeight:700,fontSize:16,marginBottom:8,color:"#e8e6e0",textAlign:"center"}}>Install KanakkuPetti</div>
        <div style={{fontSize:13,color:"#8a9199",marginBottom:20,lineHeight:1.5,textAlign:"center"}}>
          Add it to your home screen so it opens like a regular app.
        </div>

        <button onClick={handleInstall} style={{width:"100%",padding:"12px 0",borderRadius:10,background:"#c9a55c",border:"none",color:"#12151a",fontWeight:700,fontSize:14,marginBottom:14}}>
          Install
        </button>

        <label style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",fontSize:12,color:"#8a9199",cursor:"pointer"}}>
          <input type="checkbox" checked={dontShowAgain} onChange={e => setDontShowAgain(e.target.checked)}
            style={{width:14,height:14,accentColor:"#c9a55c"}} />
          Don't show this again
        </label>
      </div>
    </div>
  );
}
