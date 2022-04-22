import {createTheme, darkScrollbar, Theme} from "@mui/material";
import {ThemeProvider} from "@mui/system";
import {FC, useMemo} from "react";
import {useCampContext} from "./CampContext";

/**
 * Provide the MUI theme.
 */
export const CampThemeProvider: FC = ({children}) => {
  const {settings} = useCampContext();

  const theme: Theme = useMemo(() => createTheme({
    palette: {
      mode: settings.theme,
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
            transition: "all 0.1s linear",
            ...settings.theme === "dark" && darkScrollbar(),
          }
        }
      }
    }
  }), [settings.theme]);

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  )
}