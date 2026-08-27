import { useLang } from "./lib/LangContext";

export default function LanguagePicker() {
  const { setLang } = useLang();

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#12151a",padding:20}}>
      <div className="fade-in" style={{width:"100%",maxWidth:380,textAlign:"center"}}>
        <div style={{width:56,height:56,borderRadius:14,background:"#c9a55c",display:"flex",alignItems:"center",justifyContent:"center",color:"#12151a",fontWeight:800,fontSize:26,margin:"0 auto 20px"}}>₹</div>
        <div style={{fontSize:14,color:"#8a9199",marginBottom:32}}>Choose your language / ഭാഷ തിരഞ്ഞെടുക്കൂ</div>

        <button onClick={() => setLang("en")}
          style={{width:"100%",padding:"16px 0",borderRadius:12,background:"#1a1e25",border:"1px solid #2a2f38",color:"#e8e6e0",fontSize:16,fontWeight:600,marginBottom:12}}>
          English
        </button>
        <button onClick={() => setLang("ml")}
          style={{width:"100%",padding:"16px 0",borderRadius:12,background:"#1a1e25",border:"1px solid #2a2f38",color:"#e8e6e0",fontSize:16,fontWeight:600}}>
          മലയാളം
        </button>

        <div style={{fontSize:11,color:"#4b5259",marginTop:24}} className="mono">
          you can change this anytime later
        </div>
      </div>
    </div>
  );
}
