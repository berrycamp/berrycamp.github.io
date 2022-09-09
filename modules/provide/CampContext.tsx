import {createContext, FC, useCallback, useContext, useState} from "react";

export interface ICampContext {
  settings: ICampSettings;
  changeTheme: () => void;
  setPrefersDark: (prefersDark: boolean) => void;
  toggleListMode: () => void;
  toggleShowWatermark: () => void;
  toggleEverest: () => void;
  setPort: (port?: number) => void;
  setSettings: (settings: ICampSettings) => void;
}

export interface ICampSettings {
  theme?: "light" | "dark";
  prefersDark?: true;
  listMode?: true;
  showWatermark: boolean;
  everest: boolean;
  port?: number;
}

const CampContext = createContext<ICampContext>({
  settings: {
    everest: true,
    showWatermark: true,
  },
  changeTheme: () => undefined,
  setPrefersDark: () => undefined,
  toggleListMode: () => undefined,
  toggleShowWatermark: () => undefined,
  toggleEverest: () => undefined,
  setPort: () => undefined,
  setSettings: () => undefined,
});

export const CampContextProvider: FC = ({children}) => {
  const [settings, setSettings] = useState<ICampSettings>({showWatermark: true, everest: true});

  const changeTheme = useCallback(() => {
    setSettings(({theme, ...other}) => ({...other, ...theme !== "dark" && {theme: theme === undefined ? "light" : "dark"}}));
  }, []);

  const setPrefersDark = useCallback((prefersDark: boolean) => {
    setSettings(({prefersDark: _, ...other}) => ({...other, ...prefersDark && {prefersDark}}));
  }, []);

  const toggleListMode = useCallback(() => {
    setSettings(({listMode, ...other}) => ({...other, ...!listMode && {listMode: true}}));
  }, [])

  const toggleShowWatermark = useCallback(() => {
    setSettings(({showWatermark, ...other}) => ({...other, showWatermark: !showWatermark}));
  }, []);

  const toggleEverest = useCallback(() => {
    setSettings(({everest, ...other}) => ({...other, everest: !everest}));
  }, []);

  const setPort = useCallback((port?: number) => {
    setSettings(({port: _, ...other}) => ({...other, ...port !== undefined && {port}}));
  }, [])

  return (
    <CampContext.Provider
      value={{
        settings,
        changeTheme,
        setPrefersDark,
        toggleListMode,
        toggleEverest,
        toggleShowWatermark,
        setPort,
        setSettings
      }}
    >
      {children}
    </CampContext.Provider>
  )
}

export const useCampContext = (): ICampContext => {
  return useContext<ICampContext>(CampContext)
}