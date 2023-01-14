import {createContext, FC, PropsWithChildren, useCallback, useContext, useState} from "react";

export interface ICampContext {
  settings: ICampSettings;
  changeTheme: () => void;
  setPrefersDark: (prefersDark: boolean) => void;
  toggleListMode: () => void;
  toggleShowWatermark: () => void;
  toggleEverest: () => void;
  setEverestUrl: (url?: string) => void;
  setSettings: (settings: ICampSettings) => void;
}

export interface ICampSettings {
  theme?: "light" | "dark";
  prefersDark?: true;
  listMode?: true;
  showWatermark: boolean;
  everest: boolean;
  everestUrl?: string;
}

const CampContext = createContext<ICampContext>({
  settings: {
    everest: false,
    showWatermark: true,
  },
  changeTheme: () => undefined,
  setPrefersDark: () => undefined,
  toggleListMode: () => undefined,
  toggleShowWatermark: () => undefined,
  toggleEverest: () => undefined,
  setEverestUrl: () => undefined,
  setSettings: () => undefined,
});

export const CampContextProvider: FC<PropsWithChildren> = ({children}) => {
  const [settings, setSettings] = useState<ICampSettings>({showWatermark: true, everest: true});

  const changeTheme = useCallback(() => {
    setSettings(({theme, ...other}) => ({...other, ...(theme !== "dark" && {theme: theme === undefined ? "light" : "dark"})}));
  }, []);

  const setPrefersDark = useCallback((prefersDark: boolean) => {
    setSettings(({prefersDark: _, ...other}) => ({...other, ...(prefersDark && {prefersDark})}));
  }, []);

  const toggleListMode = useCallback(() => {
    setSettings(({listMode, ...other}) => ({...other, ...(!listMode && {listMode: true})}));
  }, [])

  const toggleShowWatermark = useCallback(() => {
    setSettings(({showWatermark, ...other}) => ({...other, showWatermark: !showWatermark}));
  }, []);

  const toggleEverest = useCallback(() => {
    setSettings(({everest, ...other}) => ({...other, everest: !everest}));
  }, []);

  const setEverestUrl = useCallback((everestUrl?: string) => {
    setSettings(({everestUrl: _, ...other}) => ({...other, ...(everestUrl !== undefined && {everestUrl})}));
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
        setEverestUrl,
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