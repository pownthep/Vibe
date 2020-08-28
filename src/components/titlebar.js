import React from "react";
import {
  Container,
  ControlsMac,
  ControlsWindows,
  ButtonMacMaximize,
  ButtonMacClose,
  ButtonMacMinimize,
  ButtonWindows,
  CloseButtonWindows,
} from "../utils/styles";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import ListboxComponent from "./listbox";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import Chip from "@material-ui/core/Chip";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import clsx from "clsx";
import MenuIcon from "@material-ui/icons/Menu";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  },
  nav: {
    width: "100%",
    backgroundColor: "inherit",
  },
  list: {
    width: 250,
  },
  fullList: {
    width: "auto",
  },
  listItemText: {
    fontWeight: "bold",
  },
  drawerPaper: {
    backgroundColor: "rgba(0,0,0,0.9)",
    backdropFilter: "blur(2px)",
  },
  drawer: {
    WebkitAppRegion: "no-drag",
  },
}));

export default function Titlebar({ backgroundColor, routes }) {
  const [anime] = React.useState(window.data);
  const [value] = React.useState(null);
  const classes = useStyles();

  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const history = useHistory();

  const isWindows = window.clientInformation.platform === "Win32";
  const currentWindow = window.remote ? window.remote.getCurrentWindow() : null;
  const [isMaximized, setMaximized] = React.useState(
    window.remote ? currentWindow.isMaximized() : null
  );
  const handleClose = () => {
    if (currentWindow) currentWindow.close();
  };

  const handleMinimize = () => {
    if (currentWindow) currentWindow.minimize();
  };

  const handleMaximize = () => {
    if (!currentWindow) return;
    if (isWindows) {
      if (currentWindow.isMaximizable()) {
        if (currentWindow.isMaximized()) {
          currentWindow.unmaximize();
          setMaximized(false);
        } else {
          currentWindow.maximize();
          setMaximized(true);
        }
      }
    } else {
      currentWindow.setFullScreen(!currentWindow.isFullScreen());
    }
  };

  const renderMac = () => {
    return (
      <ControlsMac key="title-controls">
        <ButtonMacClose tabIndex="-1" onClick={handleClose}>
          <svg x="0px" y="0px" viewBox="0 0 6.4 6.4">
            <polygon
              fill="#4d0000"
              points="6.4,0.8 5.6,0 3.2,2.4 0.8,0 0,0.8 2.4,3.2 0,5.6 0.8,6.4 3.2,4 5.6,6.4 6.4,5.6 4,3.2"
            ></polygon>
          </svg>
        </ButtonMacClose>
        <ButtonMacMinimize tabIndex="-1" onClick={handleMinimize}>
          <svg x="0px" y="0px" viewBox="0 0 8 1.1">
            <rect fill="#995700" width="8" height="1.1"></rect>
          </svg>
        </ButtonMacMinimize>
        <ButtonMacMaximize tabIndex="-1" onClick={handleMaximize}>
          <svg className="fullscreen-svg" x="0px" y="0px" viewBox="0 0 6 5.9">
            <path
              fill="#006400"
              d="M5.4,0h-4L6,4.5V0.6C5.7,0.6,5.3,0.3,5.4,0z"
            ></path>
            <path
              fill="#006400"
              d="M0.6,5.9h4L0,1.4l0,3.9C0.3,5.3,0.6,5.6,0.6,5.9z"
            ></path>
          </svg>
          <svg className="maximize-svg" x="0px" y="0px" viewBox="0 0 7.9 7.9">
            <polygon
              fill="#006400"
              points="7.9,4.5 7.9,3.4 4.5,3.4 4.5,0 3.4,0 3.4,3.4 0,3.4 0,4.5 3.4,4.5 3.4,7.9 4.5,7.9 4.5,4.5"
            ></polygon>
          </svg>
        </ButtonMacMaximize>
      </ControlsMac>
    );
  };

  const renderWindows = () => {
    return (
      <ControlsWindows key="title-controls">
        <ButtonWindows
          aria-label="minimize"
          tabIndex="-1"
          onClick={handleMinimize}
        >
          <svg version="1.1" aria-hidden="true" width="10" height="10">
            <path d="M 0,5 10,5 10,6 0,6 Z" />
          </svg>
        </ButtonWindows>

        <ButtonWindows
          aria-label="maximize"
          tabIndex="-1"
          onClick={handleMaximize}
        >
          {isMaximized ? (
            <svg version="1.1" aria-hidden="true" width="10" height="10">
              <path d="m 2,1e-5 0,2 -2,0 0,8 8,0 0,-2 2,0 0,-8 z m 1,1 6,0 0,6 -1,0 0,-5 -5,0 z m -2,2 6,0 0,6 -6,0 z" />
            </svg>
          ) : (
            <svg version="1.1" aria-hidden="true" width="10" height="10">
              <path d="M 0,0 0,10 10,10 10,0 Z M 1,1 9,1 9,9 1,9 Z" />
            </svg>
          )}
        </ButtonWindows>
        <CloseButtonWindows
          aria-label="close"
          tabIndex="-1"
          onClick={handleClose}
        >
          <svg aria-hidden="true" version="1.1" width="10" height="10">
            <path d="M 0,0 0,0.7 4.3,5 0,9.3 0,10 0.7,10 5,5.7 9.3,10 10,10 10,9.3 5.7,5 10,0.7 10,0 9.3,0 5,4.3 0.7,0 Z" />
          </svg>
        </CloseButtonWindows>
      </ControlsWindows>
    );
  };

  const list = (anchor) => (
    <div
      className={clsx(classes.list, {
        [classes.fullList]: anchor === "top" || anchor === "bottom",
      })}
      role="presentation"
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        <ListItem button>
          <ListItemIcon>
            <img
              src="http://vibe-three.vercel.app/icon.ico"
              alt="logo"
              width="35"
            />
          </ListItemIcon>
          <ListItemText primary={"Vibe"} />
        </ListItem>
        <Divider />
        {routes.map((r, index) => (
          <div key={index}>
            <ListItem
              button
              onClick={(e) => {
                toggleDrawer(anchor, false);
                history.push(r.path);
              }}
            >
              <ListItemIcon>{r.icon}</ListItemIcon>
              <ListItemText
                primary={r.label}
                classes={{ root: classes.listItemText }}
              />
            </ListItem>
            {index === 4 && <Divider style={{ marginTop: "auto" }} />}
          </div>
        ))}
      </List>
    </div>
  );

  return (
    <Container backgroundColor={backgroundColor}>
      {window.remote && !isWindows ? renderMac() : null}
      <div
        style={{
          WebkitAppRegion: "no-drag",
          width: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {[isWindows ? "left" : "right"].map((anchor) => (
          <React.Fragment key={anchor}>
            <IconButton onClick={toggleDrawer(anchor, true)}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor={anchor}
              open={state[anchor]}
              onClose={toggleDrawer(anchor, false)}
              classes={{ root: classes.drawer, paper: classes.drawerPaper }}
            >
              {list(anchor)}
            </Drawer>
          </React.Fragment>
        ))}
      </div>
      <Autocomplete
        id="virtualize-demo"
        style={{
          width: "100%",
          minWidth: "40vw",
          maxWidth: "40vw",
          WebkitAppRegion: "no-drag",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        size="small"
        disableListWrap
        ListboxComponent={ListboxComponent}
        value={value}
        onChange={(e, v) => {
          history.replace("/watch/" + v.id);
        }}
        options={anime}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            label="Search..."
            variant="outlined"
            classes={{
              root: classes.root,
            }}
          />
        )}
        renderOption={(option, { inputValue }) => {
          const matches = match(option.name, inputValue);
          const parts = parse(option.name, matches);
          return (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "100px auto",
                height: 150,
              }}
            >
              <div
                style={{
                  backgroundImage: `url(${option.poster})`,
                  backgroundSize: "cover",
                }}
              ></div>
              <div style={{ marginLeft: "10px" }}>
                {parts.map((part, index) => (
                  <span
                    key={index}
                    style={{
                      fontWeight: part.highlight ? 700 : 400,
                      color: part.highlight ? "#11cb5f" : "inherit",
                      textDecoration: part.highlight ? "underline" : "none",
                    }}
                  >
                    {part.text}
                  </span>
                ))}
                <br />
                {option.keywords.split(",").map((word) => (
                  <Chip
                    key={word}
                    label={word}
                    style={{ marginRight: 2, marginTop: 5 }}
                  />
                ))}
              </div>
            </div>
          );
        }}
      />
      {window.remote && isWindows ? renderWindows() : null}
    </Container>
  );
}
