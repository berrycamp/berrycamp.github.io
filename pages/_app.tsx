import {Theme, ThemeProvider} from '@emotion/react';
import {createTheme, CssBaseline} from '@mui/material';
import {NextPage} from 'next';
import type {AppProps} from 'next/app';
import {useEffect, useMemo, useState} from 'react';
import '../styles/globals.css';

const App = ({Component, pageProps}: AppProps<GlobalAppProps>) => {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [view, setView] = useState<"grid" | "list">("grid");

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

  /**
   * Load the prefered view from local storage or default to grid.
   */
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

  const globalAppProps: GlobalAppProps = useMemo(() => ({
    mode,
    toggleMode: () => setMode(mode === "light" ? "dark" : "light"),
    view,
    setView: (view: "grid" | "list") => setView(view),
  }), [mode, view]);

  const theme: Theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: "#c800c8",
      },
      secondary: {
        main: "#cc252c",
      },
    }
  }), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} {...globalAppProps} />
    </ThemeProvider>
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