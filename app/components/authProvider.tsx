"use client";
import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "./authModal";
type AuthContextValue = {
  username: string | null;
  requestAuth: (afterLogin?: () => void | Promise<void>, mode?: "login" | "signup") => void;
  signOut: () => void;
};
const AuthContext = createContext<AuthContextValue | null>(null);
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth requires AuthProvider");
  return context;
}
export default function AuthProvider({ initialUsername, children }: { initialUsername: string | null; children: ReactNode }) {
  const router = useRouter();
  const [override, setOverride] = useState<{ initial: string | null; value: string | null } | null>(null);
  const username = override?.initial === initialUsername ? override.value : initialUsername;
  const [mode, setMode] = useState<"login" | "signup" | null>(null);
  const pendingAction = useRef<(() => void | Promise<void>) | undefined>(undefined);
  function close() {
    pendingAction.current = undefined;
    setMode(null);
  }
  function authenticated(name: string) {
    setOverride({ initial: initialUsername, value: name });
    const action = pendingAction.current;
    pendingAction.current = undefined;
    setMode(null);
    router.refresh();
    void action?.();
  }
  return (
    <AuthContext.Provider value={{
      username,
      requestAuth: (action, nextMode = "login") => { pendingAction.current = action; setMode(nextMode); },
      signOut: () => { setOverride({ initial: initialUsername, value: null }); router.refresh(); },
    }}>
      {children}
      {mode && <AuthModal key={mode} mode={mode} onClose={close} onSwitch={setMode} onSuccess={authenticated} />}
    </AuthContext.Provider>
  );
}
