import {FC, Fragment, PropsWithChildren, useEffect} from "react";
import {ICampSettings, useCampContext} from "./CampContext";

const THEME_KEY = "theme";
const LIST_MODE_KEY = "listMode";
const EVEREST_KEY = "everest";

export const CampPreferencesProvider: FC<PropsWithChildren> = ({children}) => {
  const {settings, setSettings} = useCampContext();

  /**
  * Retrieve and validate user settings from localstorage.
  */
  useEffect(() => {
    const everest: boolean = /Windows|Linux|Macintosh/i.test(navigator.userAgent);

    const storageSettings: ICampSettings = {
      showWatermark: true,
      everest,
    };

    const theme: string | null = localStorage.getItem(THEME_KEY);
    if (theme !== null) {
      storageSettings.theme = theme === "dark" ? "dark" : "light";
    }

    const listMode: string | null = localStorage.getItem(LIST_MODE_KEY);
    if (listMode !== null) {
      storageSettings.listMode = true;
    }

    const port: string | null = localStorage.getItem(EVEREST_KEY);
    if (port !== null) {
      storageSettings.everestUrl = Number(port);
    }

    setSettings(storageSettings);
  }, [setSettings]);

  /**
   * Set user settings in localstorage.
   */
  useEffect(() => {
    [THEME_KEY, LIST_MODE_KEY, EVEREST_KEY].forEach(key => localStorage.removeItem(key));

    const {theme, listMode, everestUrl: port} = settings;

    if (theme !== undefined) {
      localStorage.setItem(THEME_KEY, theme);
    }

    if (listMode) {
      localStorage.setItem(LIST_MODE_KEY, String(true));
    }

    if (port !== undefined) {
      localStorage.setItem(EVEREST_KEY, String(port));
    }
  }, [settings]);

  return (
    <Fragment>
      {children}
    </Fragment>
  )
}