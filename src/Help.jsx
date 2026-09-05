import { Wallet, TrendingUp, PieChart, RotateCcw, Download, FileText, Users, HandCoins, Globe, Smartphone, Mail } from "lucide-react";
import { useLang } from "./lib/LangContext";

const sectionsByLang = {
  en: [
    { icon: TrendingUp, title: "Income & Expenses", body: "Tap the + button to log money coming in (income) or going out (expense). Pick a category, add an optional note, and choose the date. Your Overview tab shows totals for the selected month." },
    { icon: PieChart, title: "Budgets", body: "Go to the Budgets tab to set a monthly limit for any category — Food, Rent, Transport, etc. If you go over the limit, the Overview tab shows a warning and how much you're over by." },
    { icon: RotateCcw, title: "Recurring entries", body: "When adding an entry, toggle \"Repeats monthly on this day.\" Salary, rent, or any regular payment will be added automatically every month on the same date." },
    { icon: Download, title: "CSV export", body: "In the Transactions tab, tap \"Export all as CSV\" to download every entry you've ever logged as a spreadsheet file." },
    { icon: FileText, title: "PDF export", body: "Also in Transactions, \"Export PDF\" creates a clean, printable table of that month's expenses only, with a total at the bottom — good for sharing or record-keeping." },
    { icon: Users, title: "Events (shared expenses)", body: "Create an Event (like a trip or celebration) with an optional budget. Share the event's link with anyone — they can view it, and if you allow it, add their own expenses too. Great for splitting costs on a trip." },
    { icon: HandCoins, title: "Loans (borrow & lend)", body: "Track money you've borrowed from or lent to specific people. Each person gets a running balance so you always know who owes what. Mark entries as settled once paid back." },
    { icon: Globe, title: "Language", body: "Switch between English and Malayalam anytime using the language button near the top of the app." },
    { icon: Smartphone, title: "Install as an app", body: "Tap \"Install app\" near the top to add KanakkuPetti to your phone's home screen, so it opens like a regular app." },
  ],
  ml: [
    { icon: TrendingUp, title: "വരവും ചെലവും", body: "വരുന്ന പണം (വരവ്) അല്ലെങ്കിൽ പോകുന്ന പണം (ചെലവ്) രേഖപ്പെടുത്താൻ + ബട്ടൺ അമർത്തുക. ഒരു വിഭാഗം തിരഞ്ഞെടുക്കുക, ഒരു കുറിപ്പ് ചേർക്കുക, തീയതി തിരഞ്ഞെടുക്കുക. തിരഞ്ഞെടുത്ത മാസത്തിലെ ആകെ തുക അവലോകനം ടാബിൽ കാണാം." },
    { icon: PieChart, title: "ബഡ്ജറ്റുകൾ", body: "ഏതെങ്കിലും വിഭാഗത്തിന് ഒരു മാസ പരിധി വെക്കാൻ ബഡ്ജറ്റുകൾ ടാബിലേക്ക് പോകുക — ഭക്ഷണം, വാടക, യാത്ര മുതലായവ. പരിധി കടന്നാൽ, അവലോകനം ടാബ് ഒരു മുന്നറിയിപ്പ് കാണിക്കും." },
    { icon: RotateCcw, title: "ആവർത്തന എൻട്രികൾ", body: "ഒരു എൻട്രി ചേർക്കുമ്പോൾ \"ഈ ദിവസം എല്ലാ മാസവും ആവർത്തിക്കും\" എന്നത് ഓണാക്കുക. ശമ്പളം, വാടക, അല്ലെങ്കിൽ ഏതെങ്കിലും സ്ഥിരം പേയ്‌മെന്റ് എല്ലാ മാസവും ഒരേ തീയതിയിൽ സ്വയമേവ ചേർക്കപ്പെടും." },
    { icon: Download, title: "CSV എക്സ്പോർട്ട്", body: "ഇടപാടുകൾ ടാബിൽ, നിങ്ങൾ രേഖപ്പെടുത്തിയ എല്ലാ എൻട്രികളും ഒരു സ്പ്രെഡ്ഷീറ്റ് ഫയലായി ഡൗൺലോഡ് ചെയ്യാൻ \"എല്ലാം CSV ആയി എക്സ്പോർട്ട് ചെയ്യൂ\" അമർത്തുക." },
    { icon: FileText, title: "PDF എക്സ്പോർട്ട്", body: "ഇടപാടുകളിൽ തന്നെ, \"Export PDF\" ആ മാസത്തെ ചെലവുകൾ മാത്രം ഉള്ള ഒരു വൃത്തിയുള്ള, പ്രിന്റ് ചെയ്യാവുന്ന ടേബിൾ ഉണ്ടാക്കും, താഴെ ആകെ തുകയോടെ." },
    { icon: Users, title: "ഇവന്റുകൾ (പങ്കിട്ട ചെലവുകൾ)", body: "ഒരു യാത്ര അല്ലെങ്കിൽ ആഘോഷത്തിനായി ഒരു ഇവന്റ് ഉണ്ടാക്കുക, ഒരു ബഡ്ജറ്റോടെ. ഇവന്റിന്റെ ലിങ്ക് ആർക്കും പങ്കിടുക — അവർക്ക് കാണാം, നിങ്ങൾ അനുവദിച്ചാൽ അവരുടെ സ്വന്തം ചെലവുകളും ചേർക്കാം." },
    { icon: HandCoins, title: "കടങ്ങൾ (വാങ്ങലും കൊടുക്കലും)", body: "പ്രത്യേക വ്യക്തികളിൽ നിന്ന് വാങ്ങിയതോ കൊടുത്തതോ ആയ പണം ട്രാക്ക് ചെയ്യുക. ഓരോ വ്യക്തിക്കും ഒരു ബാലൻസ് ഉണ്ടാകും, ആരാണ് എന്ത് തരാനുള്ളത് എന്ന് എപ്പോഴും അറിയാം." },
    { icon: Globe, title: "ഭാഷ", body: "ആപ്പിന്റെ മുകളിലുള്ള ഭാഷാ ബട്ടൺ ഉപയോഗിച്ച് എപ്പോൾ വേണമെങ്കിലും ഇംഗ്ലീഷിനും മലയാളത്തിനും ഇടയിൽ മാറാം." },
    { icon: Smartphone, title: "ആപ്പായി ഇൻസ്റ്റാൾ ചെയ്യുക", body: "കണക്കുപെട്ടി നിങ്ങളുടെ ഫോണിന്റെ ഹോം സ്ക്രീനിലേക്ക് ചേർക്കാൻ മുകളിലുള്ള \"Install app\" അമർത്തുക." },
  ],
};

export default function Help({ onBack }) {
  const { lang, t } = useLang();
  const sections = sectionsByLang[lang] || sectionsByLang.en;

  return (
    <div className="fade-in">
      <button onClick={onBack} style={{background:"none",border:"none",color:"#8a9199",fontSize:13,marginBottom:14,padding:0}}>← {t.overview}</button>

      <div style={{marginBottom:18}}>
        <div className="display" style={{fontSize:18,fontWeight:700,color:"#e8e6e0",marginBottom:6}}>{t.helpTitle}</div>
        <div style={{fontSize:13,color:"#8a9199"}}>{t.helpSubtitle}</div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {sections.map((s, i) => (
          <div key={i} style={{background:"#1a1e25",border:"1px solid #232830",borderRadius:10,padding:"12px 14px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{width:30,height:30,borderRadius:8,background:"rgba(201,165,92,0.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <s.icon size={15} color="#c9a55c" />
              </div>
              <div style={{fontSize:14,fontWeight:600,color:"#e8e6e0"}}>{s.title}</div>
            </div>
            <div style={{fontSize:13,color:"#8a9199",lineHeight:1.55}}>{s.body}</div>
          </div>
        ))}
      </div>

      <div style={{marginTop:18,padding:"16px 14px",background:"#1a1e25",border:"1px solid #232830",borderRadius:10,textAlign:"center"}}>
        <div style={{fontSize:13,color:"#8a9199",marginBottom:8}}>{t.helpContact}</div>
        <a href="mailto:afsalabduljaleelmuhammad@gmail.com"
          style={{display:"inline-flex",alignItems:"center",gap:6,color:"#c9a55c",fontSize:13,fontWeight:600,textDecoration:"none"}}>
          <Mail size={15}/> afsalabduljaleelmuhammad@gmail.com
        </a>
      </div>
    </div>
  );
}
