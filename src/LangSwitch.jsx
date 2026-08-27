import { useLang } from "./lib/LangContext";

export default function LangSwitch() {
  const { lang, setLang } = useLang();
  return (
    <button onClick={() => setLang(lang === "en" ? "ml" : "en")}
      style={{background:"#1a1e25",border:"1px solid #2a2f38",borderRadius:8,padding:"6px 10px",color:"#8a9199",fontSize:12,fontWeight:600}}>
      {lang === "en" ? "മലയാളം" : "English"}
    </button>
  );
}
