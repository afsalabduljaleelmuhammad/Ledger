import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import AuthScreen from "./AuthScreen.jsx";
import Dashboard from "./Dashboard.jsx";
import ResetPassword from "./ResetPassword.jsx";

export default function App() {
  const [session, setSession] = useState(undefined);
  const [resetMode, setResetMode] = useState(window.location.hash.includes("reset-password"));

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      if (event === "PASSWORD_RECOVERY") setResetMode(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#12151a",color:"#6b7280"}} className="mono">
        loading…
      </div>
    );
  }

  if (resetMode) {
    return <ResetPassword onDone={() => { setResetMode(false); window.location.hash = ""; }} />;
  }

  return session ? <Dashboard session={session} /> : <AuthScreen />;
}
