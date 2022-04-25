import {FC, Fragment, useEffect} from "react";
import {ICampSettings, useCampContext} from "./CampContext";

const SETTINGS_KEY = "settings";

export const CampPreferencesProvider: FC = ({children}) => {
  const {settings, setSettings} = useCampContext();

  /**
   * Load user preferences.
   */
  useEffect(() => {
    setSettings({
      theme: document.documentElement.style.getPropertyValue("--initial-theme") === "dark" ? "dark" : "light",
      view: window.localStorage.getItem("view") === "list" ? "list" : "grid",
      subrooms: window.localStorage.getItem("subrooms") !== "false",
      cozy: false,
    });
  }, [setSettings]);

  /**
   * Retrieve user settings from localstorage.
   */
  useEffect(() => {
    try {
      const unsafeSettings: ICampSettings = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) ?? "");
      if (typeof unsafeSettings.cozy !== "boolean"
        || (typeof unsafeSettings.port !== "number" && typeof unsafeSettings.port !== "undefined")
        || typeof unsafeSettings.subrooms !== "boolean"
        || typeof unsafeSettings.theme !== "string"
        || typeof unsafeSettings.view !== "string") {
        return;
      }
      setSettings(unsafeSettings);
    } catch (err) {
      // Don't care.
    }
  }, [setSettings]);

  /**
   * Set user settings in localstorage.
   */
  useEffect(() => {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  /**
   * Get the user or media mode preference. Default to light if not provided.
   */
  useEffect(() => {
    window.localStorage.setItem("theme", settings.theme);
    if (settings.theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [settings.theme])

  return (
    <Fragment>
      {children}
    </Fragment>
  )
}