import {createContext, FC, useCallback, useContext, useState} from "react";

export interface ICampContext {
  settings: ICampSettings;
  setView: (view: "grid" | "list") => void;
  toggleTheme: () => void;
  toggleSubrooms: () => void;
}

export interface ICampSettings {
  theme: "light" | "dark";
  view: "grid" | "list"
  subrooms: boolean;
}

const CampContext = createContext<ICampContext>({
  settings: {
    theme: "light",
    view: "grid",
    subrooms: true,
  },
  setView: () => undefined,
  toggleTheme: () => undefined,
  toggleSubrooms: () => undefined,
});

export const CampContextProvider: FC = ({children}) => {
  const [settings, setSettings] = useState<ICampSettings>({
    view: "grid",
    theme: "light",
    subrooms: true,
  });

  const setView = useCallback((view: "grid" | "list") => {
    setSettings(prev => ({...prev, view}));
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings(prev => ({...prev, theme: prev.theme === "light" ? "dark" : "light"}));
  }, []);

  const toggleSubrooms = useCallback(() => {
    setSettings(prev => ({...prev, subrooms: !prev.subrooms}));
  }, []);

  return (
    <CampContext.Provider value={{settings, setView, toggleTheme, toggleSubrooms}}>
      {children}
    </CampContext.Provider>
  )
}

export const useCampContext = (): ICampContext => {
  return useContext(CampContext)
}