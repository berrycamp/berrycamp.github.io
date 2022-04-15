import {NextPage} from 'next';
import type {AppProps} from 'next/app';
import {useEffect, useState} from 'react';
import '../styles/globals.css';

const MODE_KEY = "theme";

const App = ({Component, pageProps}: AppProps<GlobalAppProps>) => {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [view, setView] = useState<"grid" | "list">("grid");

  /**
 * Get the prefered mode from the user or the system.
 * @returns The prefered mode.
 */
  const getModePreference = (): "dark" | "light" => {
    const mql: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
    if (typeof mql.matches === "boolean") {
      return mql.matches ? "dark" : "light";
    };
    return "light";
  }

  /**
   * Get the user or media mode preference. Default to light if not provided.
   */
  useEffect(() => {
    const userMode: string | null = window.localStorage.getItem(MODE_KEY);
    if (userMode !== null) {
      setMode("dark");
    } else {
      setMode(getModePreference());
    }
  }, [])

  /**
   * Store mode in local storage.
   */
  useEffect(() => {
    window.localStorage.setItem(MODE_KEY, mode);
  }, [mode]);


  const globalAppProps: GlobalAppProps = {
    mode,
    toggleMode: () => setMode(mode === "light" ? "dark" : "light"),
    view,
    setView: (view: "grid" | "list") => setView(view),
  }

  return (
    <Component {...pageProps} {...globalAppProps} />
  );
}

export interface GlobalAppProps {
  mode: "light" | "dark";
  toggleMode: () => void;
  view: "grid" | "list";
  setView: (view: "grid" | "list") => void;
}

export type AppNextPage<P = {}, IP = P> = NextPage<P & GlobalAppProps, IP>;

export default App;