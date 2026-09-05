import { useState } from "react";
import { TrendingUp, PieChart, Lock, RotateCcw, Users } from "lucide-react";
import { useLang } from "./lib/LangContext";

export default function Onboarding({ onDone }) {
  const { t } = useLang();
  const [step, setStep] = useState(0);

  const slides = [
    { icon: <TrendingUp size={36} color="#c9a55c" />, title: t.onboard1Title, body: t.onboard1Body },
    { icon: <PieChart size={36} color="#c9a55c" />, title: t.onboard2Title, body: t.onboard2Body },
    { icon: <Lock size={36} color="#c9a55c" />, title: t.onboard3Title, body: t.onboard3Body },
    { icon: <RotateCcw size={36} color="#c9a55c" />, title: t.onboard4Title, body: t.onboard4Body },
    { icon: <Users size={36} color="#c9a55c" />, title: t.onboard5Title, body: t.onboard5Body },
  ];

  const isLast = step === slides.length - 1;

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:"#12151a",padding:20}}>
      <div style={{display:"flex",justifyContent:"flex-end",paddingTop:10}}>
        {!isLast && (
          <button onClick={onDone} style={{background:"none",border:"none",color:"#6b7280",fontSize:13}}>{t.skip}</button>
        )}
      </div>

      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",maxWidth:380,margin:"0 auto",width:"100%"}}>
        <div key={step} className="fade-in">
          <div style={{width:88,height:88,borderRadius:22,background:"#1a1e25",border:"1px solid #232830",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 28px"}}>
            {slides[step].icon}
          </div>
          <div className="display" style={{fontSize:22,fontWeight:700,marginBottom:12,color:"#e8e6e0"}}>{slides[step].title}</div>
          <div style={{fontSize:14,color:"#8a9199",lineHeight:1.6}}>{slides[step].body}</div>
        </div>
      </div>

      <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:24}}>
        {slides.map((_, i) => (
          <div key={i} style={{width: i===step ? 20 : 6,height:6,borderRadius:3,background: i===step ? "#c9a55c" : "#2a2f38",transition:"width 0.2s"}} />
        ))}
      </div>

      <button
        onClick={() => isLast ? onDone() : setStep(s => s + 1)}
        style={{width:"100%",maxWidth:380,margin:"0 auto",padding:"14px 0",borderRadius:12,background:"#c9a55c",border:"none",color:"#12151a",fontWeight:700,fontSize:15}}>
        {isLast ? t.getStarted : t.next}
      </button>
    </div>
  );
}
