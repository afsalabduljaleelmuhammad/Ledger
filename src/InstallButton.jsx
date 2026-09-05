import { useState, useEffect } from "react";
import { Download } from "lucide-react";

export default function InstallButton() {
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(
    window.matchMedia("(display-mode: standalone)").matches
  );

  useEffect(() => {
    function handler(e) {
      e.preventDefault();
      setPrompt(e);
    }
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (installed || !prompt) return null;

  async function handleInstall() {
    prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  }

  return (
    <button onClick={handleInstall}
      style={{display:"flex",alignItems:"center",gap:6,background:"#1a1e25",border:"1px solid #2a2f38",borderRadius:8,padding:"6px 10px",color:"#c9a55c",fontSize:12,fontWeight:600}}>
      <Download size={13}/> Install app
    </button>
  );
}
