import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import AuthScreen from "./AuthScreen.jsx";
import Dashboard from "./Dashboard.jsx";

export default function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#12151a",color:"#6b7280"}} className="mono">
        loading…
      </div>
    );
  }

  return session ? <Dashboard session={session} /> : <AuthScreen />;
}
