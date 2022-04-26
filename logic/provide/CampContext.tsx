import {createContext, FC, useCallback, useContext, useState} from "react";

export interface ICampContext {
  settings: ICampSettings;
  changeTheme: () => void;
  toggleListMode: () => void;
  toggleHideSubrooms: () => void;
  toggleCozyMode: () => void;
  setPort: (port?: number) => void;
  setSettings: (settings: ICampSettings) => void;
}

export interface ICampSettings {
  theme?: "light" | "dark";
  listMode?: true;
  hideSubrooms?: true;
  cozyMode?: true;
  port?: number
}

const CampContext = createContext<ICampContext>({
  settings: {},
  changeTheme: () => undefined,
  toggleListMode: () => undefined,
  toggleHideSubrooms: () => undefined,
  toggleCozyMode: () => undefined,
  setPort: () => undefined,
  setSettings: () => undefined,
});

export const CampContextProvider: FC = ({children}) => {
  const [settings, setSettings] = useState<ICampSettings>({});

  const changeTheme = useCallback(() => {
    setSettings(({theme, ...other}) => ({...other, ...theme !== "dark" && {theme: theme === undefined ? "light" : "dark"}}));
  }, []);

  const toggleListMode = useCallback(() => {
    setSettings(({listMode, ...other}) => ({...other, ...!listMode && {listMode: true}}));
  }, [])

  const toggleHideSubrooms = useCallback(() => {
    setSettings(({hideSubrooms, ...other}) => ({...other, ...!hideSubrooms && {hideSubrooms: true}}));
  }, []);

  const toggleCozyMode = useCallback(() => {
    setSettings(({cozyMode, ...other}) => ({...other, ...!cozyMode && {cozyMode: true}}));
  }, [])

  const setPort = useCallback((port?: number) => {
    setSettings(({port: _, ...other}) => ({...other, ...port !== undefined && {port}}));
  }, [])

  return (
    <CampContext.Provider value={{settings, changeTheme, toggleListMode, toggleHideSubrooms, toggleCozyMode, setPort, setSettings}}>
      {children}
    </CampContext.Provider>
  )
}

export const useCampContext = (): ICampContext => {
  return useContext(CampContext)
}