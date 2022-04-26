import {createTheme, darkScrollbar, Theme, useMediaQuery} from "@mui/material";
import {ThemeProvider} from "@mui/system";
import {FC, useMemo} from "react";
import {useCampContext} from "./CampContext";

/**
 * Provide the MUI theme.
 */
export const CampThemeProvider: FC = ({children}) => {
  const {settings} = useCampContext();
  const prefersDarkMode: boolean = useMediaQuery('(prefers-color-scheme: dark)');

  const theme: Theme = useMemo(() => createTheme({
    palette: {
      mode: settings.theme === "light" ? "light" : "dark",
      primary: {
        main: "#c800c8",
      },
      secondary: {
        main: "#cc252c",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: "background 0.1s linear",
            ...(settings.theme === "dark" || (settings.theme === undefined && prefersDarkMode)) && darkScrollbar(),
          }
        }
      }
    }
  }), [prefersDarkMode, settings.theme]);

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  )
}