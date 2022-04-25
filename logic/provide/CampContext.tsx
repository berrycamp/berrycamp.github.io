import {createContext, FC, useCallback, useContext, useState} from "react";

export interface ICampContext {
  settings: ICampSettings;
  toggleTheme: () => void;
  toggleView: () => void;
  toggleSubrooms: () => void;
  toggleCozy: () => void;
  setPort: (port?: number) => void;
  setSettings: (settings: ICampSettings) => void;
}

export interface ICampSettings {
  theme: "light" | "dark";
  view: "grid" | "list"
  subrooms: boolean;
  cozy: boolean;
  port?: number | undefined
}

const CampContext = createContext<ICampContext>({
  settings: {
    theme: "light",
    view: "grid",
    subrooms: true,
    cozy: false,
  },
  toggleTheme: () => undefined,
  toggleView: () => undefined,
  toggleSubrooms: () => undefined,
  toggleCozy: () => undefined,
  setPort: () => undefined,
  setSettings: () => undefined,
});

export const CampContextProvider: FC = ({children}) => {
  const [settings, setSettings] = useState<ICampSettings>({
    theme: "light",
    view: "grid",
    subrooms: true,
    cozy: false,
  });

  const toggleTheme = useCallback(() => {
    setSettings(prev => ({...prev, theme: prev.theme === "light" ? "dark" : "light"}));
  }, []);

  const toggleView = useCallback(() => {
    setSettings(prev => ({...prev, view: prev.view === "grid" ? "list" : "grid"}));
  }, [])

  const toggleSubrooms = useCallback(() => {
    setSettings(prev => ({...prev, subrooms: !prev.subrooms}));
  }, []);

  const toggleCozy = useCallback(() => {
    setSettings(prev => ({...prev, cozy: !prev.cozy}));
  }, [])

  const setPort = useCallback((port?: number) => {
    setSettings(prev => ({...prev, port}));
  }, [])

  return (
    <CampContext.Provider value={{settings, toggleTheme, toggleView, toggleSubrooms, toggleCozy, setPort, setSettings}}>
      {children}
    </CampContext.Provider>
  )
}

export const useCampContext = (): ICampContext => {
  return useContext(CampContext)
}