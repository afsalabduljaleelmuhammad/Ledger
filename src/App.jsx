import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { LangProvider, useLang } from "./lib/LangContext";
import LanguagePicker from "./LanguagePicker.jsx";
import Onboarding from "./Onboarding.jsx";
import AuthScreen from "./AuthScreen.jsx";
import Dashboard from "./Dashboard.jsx";
import ResetPassword from "./ResetPassword.jsx";
import UpdateAlert from "./UpdateAlert.jsx";

function getShareCodeFromHash() {
  const m = window.location.hash.match(/^#event\/([a-zA-Z0-9]+)/);
  return m ? m[1] : null;
}

function AppInner() {
  const { lang } = useLang();
  const [session, setSession] = useState(undefined);
  const [resetMode, setResetMode] = useState(window.location.hash.includes("reset-password"));
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem("kp_onboarded") === "1");
  const [joinCode] = useState(getShareCodeFromHash());

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      if (event === "PASSWORD_RECOVERY") setResetMode(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  function finishOnboarding() {
    localStorage.setItem("kp_onboarded", "1");
    setOnboarded(true);
  }

  if (session === undefined) {
    return (
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#12151a",color:"#6b7280"}} className="mono">
        loading…
      </div>
    );
  }

  if (!lang) return <LanguagePicker />;
  if (!onboarded) return <Onboarding onDone={finishOnboarding} />;

  if (resetMode) {
    return <ResetPassword onDone={() => { setResetMode(false); window.location.hash = ""; }} />;
  }

  return (
    <>
      <UpdateAlert />
      {session ? <Dashboard session={session} joinCode={joinCode} /> : <AuthScreen />}
    </>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppInner />
    </LangProvider>
  );
}
