import { Wallet, TrendingUp, PieChart, RotateCcw, Download, FileText, Users, HandCoins, Globe, Smartphone, Mail } from "lucide-react";

const sections = [
  {
    icon: TrendingUp,
    title: "Income & Expenses",
    body: "Tap the + button to log money coming in (income) or going out (expense). Pick a category, add an optional note, and choose the date. Your Overview tab shows totals for the selected month.",
  },
  {
    icon: PieChart,
    title: "Budgets",
    body: "Go to the Budgets tab to set a monthly limit for any category — Food, Rent, Transport, etc. If you go over the limit, the Overview tab shows a warning and how much you're over by.",
  },
  {
    icon: RotateCcw,
    title: "Recurring entries",
    body: "When adding an entry, toggle \"Repeats monthly on this day.\" Salary, rent, or any regular payment will be added automatically every month on the same date.",
  },
  {
    icon: Download,
    title: "CSV export",
    body: "In the Transactions tab, tap \"Export all as CSV\" to download every entry you've ever logged as a spreadsheet file.",
  },
  {
    icon: FileText,
    title: "PDF export",
    body: "Also in Transactions, \"Export PDF\" creates a clean, printable table of that month's expenses only, with a total at the bottom — good for sharing or record-keeping.",
  },
  {
    icon: Users,
    title: "Events (shared expenses)",
    body: "Create an Event (like a trip or celebration) with an optional budget. Share the event's link with anyone — they can view it, and if you allow it, add their own expenses too. Great for splitting costs on a trip.",
  },
  {
    icon: HandCoins,
    title: "Loans (borrow & lend)",
    body: "Track money you've borrowed from or lent to specific people. Each person gets a running balance so you always know who owes what. Mark entries as settled once paid back.",
  },
  {
    icon: Globe,
    title: "Language",
    body: "Switch between English and Malayalam anytime using the language button near the top of the app.",
  },
  {
    icon: Smartphone,
    title: "Install as an app",
    body: "Tap \"Install app\" near the top to add KanakkuPetti to your phone's home screen, so it opens like a regular app.",
  },
];

export default function Help({ onBack }) {
  return (
    <div className="fade-in">
      <button onClick={onBack} style={{background:"none",border:"none",color:"#8a9199",fontSize:13,marginBottom:16,padding:0}}>← Back</button>

      <div style={{marginBottom:20}}>
        <div className="display" style={{fontSize:20,fontWeight:700,color:"#e8e6e0"}}>Help & features</div>
        <div style={{fontSize:13,color:"#8a9199",marginTop:4}}>Everything KanakkuPetti can do.</div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {sections.map((s, i) => (
          <div key={i} style={{background:"#1a1e25",border:"1px solid #232830",borderRadius:12,padding:"14px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{width:32,height:32,borderRadius:8,background:"rgba(201,165,92,0.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <s.icon size={16} color="#c9a55c" />
              </div>
              <div style={{fontSize:14,fontWeight:600,color:"#e8e6e0"}}>{s.title}</div>
            </div>
            <div style={{fontSize:13,color:"#8a9199",lineHeight:1.6}}>{s.body}</div>
          </div>
        ))}
      </div>

      <div style={{marginTop:24,padding:"18px 16px",background:"#1a1e25",border:"1px solid #232830",borderRadius:12,textAlign:"center"}}>
        <div style={{fontSize:13,color:"#8a9199",marginBottom:10}}>Questions, bugs, or feedback?</div>
        <a href="mailto:afsalabduljaleelmuhammad@gmail.com"
          style={{display:"inline-flex",alignItems:"center",gap:6,color:"#c9a55c",fontSize:13,fontWeight:600,textDecoration:"none"}}>
          <Mail size={14}/> afsalabduljaleelmuhammad@gmail.com
        </a>
      </div>
    </div>
  );
    }
