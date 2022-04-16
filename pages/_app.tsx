import {NextPage} from 'next';
import type {AppProps} from 'next/app';
import {useEffect, useState} from 'react';
import '../styles/globals.css';

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
   * Set the initial theme from the script.
   */
  useEffect(() => {
    setMode(document.documentElement.style.getPropertyValue("--initial-theme") === "dark" ? "dark" : "light")
  }, [])

  /**
   * Get the user or media mode preference. Default to light if not provided.
   */
  useEffect(() => {
    window.localStorage.setItem("theme", mode);
    if (mode === "dark") {
      document.documentElement.setAttribute("data-theme", mode);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [mode])

  useEffect(() => {
    const userView: string | null = window.localStorage.getItem("view");
    if (userView !== null && userView === "list") {
      setView(userView);
    } else {
      setView("grid");
    }
  }, [])

  /**
   * Set the view in local storage.
   */
  useEffect(() => {
    window.localStorage.setItem("view", view);
  }, [view]);

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