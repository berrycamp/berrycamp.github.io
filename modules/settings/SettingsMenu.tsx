import {BrightnessAuto, DarkMode, GridViewSharp, LightMode, Restore, Settings, ViewListSharp} from "@mui/icons-material";
import {Box, Divider, Icon, IconButton, ListItem, ListItemIcon, Menu, MenuItem, styled, SvgIcon, TextField, Tooltip} from "@mui/material";
import {FC, Fragment, MouseEvent, useState} from "react";
import {EVEREST_ICON} from "~/modules/layout/everest";
import {useCampContext} from "~/modules/provide/CampContext";

export const SettingsMenu: FC = () => {
  const {settings, changeTheme, toggleListMode, toggleCozyMode, setPort} = useCampContext();
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
            width: 200,
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
        {/* <Divider />
        <MenuItem onClick={toggleCozyMode}>
          <ListItemIcon>
            {settings.cozyMode ? <Fireplace fontSize="small" /> : <CropDinSharp sx={{fontSize: "1.4rem", marginLeft: "-1px"}} />}
          </ListItemIcon>
          {settings.cozyMode ? "Cozy mode on" : "Cozy mode off"}
        </MenuItem> */}
        <Divider />
        <ListItem>
          <Tooltip title="Everest Debug RC Port for opening rooms in game" enterDelay={500}>
            <Box display="flex">
              <Icon component="div" sx={{display: "flex", minWidth: 36, height: 20}}>
                <SvgIcon viewBox="615 1135 2776 1743" color="action" fontSize="small">
                  <path d={EVEREST_ICON} strokeWidth="0.1" />
                </SvgIcon>
              </Icon>
              <TextField
                type="number"
                size="small"
                variant="standard"
                placeholder="Custom port"
                value={settings.port ?? ""}
                onChange={event => setPort(Number(event.target.value) || undefined)}
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
                }}
              />
            </Box>
          </Tooltip>
          <IconButton size="small" onClick={() => setPort()}>
            <Restore fontSize="small" />
          </IconButton>
        </ListItem>
      </Menu>
    </Fragment >
  );
}

const StyledIconButton = styled(IconButton)(({theme}) => ({
  ...theme.palette.mode === "light" && {
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
  },
}));