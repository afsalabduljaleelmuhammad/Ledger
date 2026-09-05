import { useState, useEffect } from "react";
import { RefreshCw, X } from "lucide-react";
import { useLang } from "./lib/LangContext";

// Bump this string on every deploy where you want existing users notified.
export const APP_VERSION = "2025-09-05.1";

export default function UpdateAlert() {
  const { t } = useLang();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("kp_app_version");
    if (stored && stored !== APP_VERSION) {
      setShow(true);
    }
    localStorage.setItem("kp_app_version", APP_VERSION);
  }, []);

  if (!show || dismissed) return null;

  function refresh() {
    window.location.reload();
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20}}>
      <div className="fade-in" style={{background:"#1a1e25",border:"1px solid #232830",borderRadius:16,width:"100%",maxWidth:360,padding:24,textAlign:"center"}}>
        <div style={{width:52,height:52,borderRadius:14,background:"rgba(201,165,92,0.12)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
          <RefreshCw size={24} color="#c9a55c" />
        </div>
        <div style={{fontWeight:700,fontSize:16,marginBottom:8,color:"#e8e6e0"}}>{t.newVersionTitle}</div>
        <div style={{fontSize:13,color:"#8a9199",marginBottom:20,lineHeight:1.5}}>{t.newVersionBody}</div>
        <button onClick={refresh} style={{width:"100%",padding:"12px 0",borderRadius:10,background:"#c9a55c",border:"none",color:"#12151a",fontWeight:700,fontSize:14,marginBottom:8}}>
          {t.refreshNow}
        </button>
        <button onClick={() => setDismissed(true)} style={{width:"100%",padding:"8px 0",background:"none",border:"none",color:"#6b7280",fontSize:12}}>
          <X size={12} style={{display:"inline",verticalAlign:"middle",marginRight:4}} />
          {t.skip}
        </button>
      </div>
    </div>
  );
}
