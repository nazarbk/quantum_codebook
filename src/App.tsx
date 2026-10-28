import React from 'react';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { usePreferences } from './hooks/usePreferences';
import { CoursePage } from './pages/CoursePage';
import { LoginScreen } from './pages/LoginScreen';

const AppShell: React.FC = () => {
  const { status, user, error, signInWithGoogle, signOut } = useAuth();
  const { lang, setLang, theme, toggleTheme } = usePreferences();

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-400" role="status">⚛</div>;
  }

  if (status === 'signed-out') {
    return <LoginScreen lang={lang} setLang={setLang} theme={theme} onToggleTheme={toggleTheme} onSignIn={signInWithGoogle} error={error} />;
  }

  // signed-in: progress synced with the account · local: Supabase not configured, progress in this browser.
  return (
    <CoursePage
      key={user?.id ?? 'local'}
      user={user}
      onSignOut={status === 'signed-in' ? signOut : undefined}
      lang={lang}
      setLang={setLang}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
