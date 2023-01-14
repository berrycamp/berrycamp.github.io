import {BrandingWatermarkSharp, BrightnessAuto, DarkMode, Explore, ExploreOff, GridViewSharp, LightMode, RectangleSharp, Restore, Settings, ViewListSharp} from "@mui/icons-material";
import {Divider, IconButton, ListItem, ListItemIcon, Menu, MenuItem, styled, TextField, Tooltip} from "@mui/material";
import {FC, Fragment, MouseEvent, useState} from "react";
import {useCampContext} from "~/modules/provide/CampContext";

export const SettingsMenu: FC = () => {
  const {settings, changeTheme, toggleListMode, setEverestUrl, toggleShowWatermark, toggleEverest} = useCampContext();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Fragment>
      <StyledIconButton onClick={handleOpen} aria-label="open settings">
        <Settings />
      </StyledIconButton>
      <Menu
        disableScrollLock
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            width: 220,
          }
        }}
      >
        <MenuItem onClick={changeTheme}>
          <ListItemIcon>
            {settings.theme === "light" ? (
              <LightMode fontSize="small" />
            ) : settings.theme === "dark" ? (
              <DarkMode fontSize="small" />
            ) : (
              <BrightnessAuto fontSize="small" />
            )}
          </ListItemIcon>
          {settings.theme === "light" ? "Light theme" : settings.theme === "dark" ? "Dark theme" : "System theme"}
        </MenuItem>
        <MenuItem onClick={toggleListMode}>
          <ListItemIcon>
            {settings.listMode ? <ViewListSharp fontSize="small" /> : <GridViewSharp fontSize="small" />}
          </ListItemIcon>
          {settings.listMode ? "List view" : "Grid view"}
        </MenuItem>
        <MenuItem onClick={toggleShowWatermark}>
          <ListItemIcon>
            {settings.showWatermark ? (
              <BrandingWatermarkSharp fontSize="small"/>
            ) : (
              <RectangleSharp fontSize="small" sx={{transform: "scale(1.1)"}}/>
            )}
          </ListItemIcon>
          {settings.showWatermark ? "Watermark" : "No Watermark"}
        </MenuItem>
        <Divider />
        <MenuItem onClick={toggleEverest}>
          <ListItemIcon>
            {settings.everest ? (
              <Explore fontSize="small"/>
            ) : (
              <ExploreOff fontSize="small"/>
            )}
          </ListItemIcon>
          {settings.everest ? "Allow Teleporting" : "Disable Teleporting"}
        </MenuItem>
        {settings.everest && (
          <ListItem sx={{pr: 0.5}}>
            <Tooltip title="Optionally set a custom Everest debug server URL">
              <TextField
                type="url"
                size="small"
                variant="standard"
                placeholder="Custom Everest URL"
                value={settings.everestUrl ?? ""}
                onChange={event => setEverestUrl(event.target.value)}
                InputProps={{
                  disableUnderline: true,
                }}
                inputProps={{
                  min: 0,
                }}
                sx={{
                  "& .MuiInput-input": {
                    padding: 0,
                    "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                      WebkitAppearance: "none",
                    }
                  },
                  "& .MuiInputBase-input": {
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }
                }}
              />
            </Tooltip>
            <IconButton size="small" onClick={() => setEverestUrl()}>
              <Restore fontSize="small" />
            </IconButton>
          </ListItem>
        )}
      </Menu>
    </Fragment >
  );
}

const StyledIconButton = styled(IconButton)(({theme}) => ({
  ...(theme.palette.mode === "light" && {
    '&.MuiIconButton-root': {
      borderColor: "rgb(255, 255, 255, 0.2)",
      "&:hover": {
        backgroundColor: "rgb(255, 255, 255, 0.2)",
      }
    },
    '&.MuiButtonBase-root': {
      color: "white",
      '&.Mui-selected': {
        color: "white",
        backgroundColor: "rgb(255, 255, 255, 0.3)",
        borderColor: "rgb(255, 255, 255, 0.2)",
        "&:hover": {
          backgroundColor: "rgb(255, 255, 255, 0.4)",
        }
      },
    },
  }),
}));