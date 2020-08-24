import React from "react";
import {
  Container,
  Controls,
  ButtonMacMaximize,
  ButtonMacClose,
  ButtonMacMinimize,
  ButtonWindows,
  CloseButtonWindows,
} from "../utils/styles";
import { Link } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import ListboxComponent from "./listbox";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    outline: "none",
  },
}));

const currentWindow = window.remote.getCurrentWindow();

export default function Titlebar({ backgroundColor, routes }) {
  const [isMaximized, setMaximized] = React.useState(
    currentWindow.isMaximized()
  );
  const [anime, setAnime] = React.useState(window.data);
  const [value, setValue] = React.useState(null);
  const classes = useStyles();

  const isWindows = window.clientInformation.platform === "Win32";
  const history = useHistory();

  const handleClose = () => {
    currentWindow.close();
  };

  const handleMinimize = () => {
    currentWindow.minimize();
  };

  const handleMaximize = () => {
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
      <Controls key="title-controls">
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
      </Controls>
    );
  };

  const renderWindows = () => {
    return (
      <Controls key="title-controls">
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
      </Controls>
    );
  };
  const elements = [];

  if (isWindows) {
    elements.push(
      <div key={"item"}>
        {routes.map((route, index) => (
          <Link to={route.path} key={index}>
            <IconButton aria-label={route.label} color="primary">
              {route.icon}
            </IconButton>
          </Link>
        ))}
      </div>
    );
    elements.push(renderWindows());
  } else {
    elements.push(renderMac());
    elements.push(
      <div key={"item"}>
        {routes.map((route, index) => (
          <Link to={route.path} key={index}>
            <IconButton aria-label={route.label} color="primary">
              {route.icon}
            </IconButton>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <Container isWin={isWindows} backgroundColor={backgroundColor}>
      <div style={{ WebkitAppRegion: "no-drag", width: "30%", display: "flex", justifyContent: "space-evenly"}}>
        <img src="https://vibe-three.vercel.app/icon.ico" alt="" width="40" height="40" style={{
          marginTop:5
        }}/>
        {routes.map((route, index) => (
          <Link to={route.path} key={index}>
            <IconButton aria-label={route.label} color="primary">
              {route.icon}
            </IconButton>
          </Link>
        ))}
      </div>
      <Autocomplete
        id="virtualize-demo"
        style={{
          width: "30%",
          WebkitAppRegion: "no-drag",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
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
            <div>
              {parts.map((part, index) => (
                <span
                  key={index}
                  style={{
                    fontWeight: part.highlight ? 700 : 400,
                    color: part.highlight ? "#11cb5f" : "inherit",
                  }}
                >
                  {part.text}
                </span>
              ))}
            </div>
          );
        }}
      />
      {renderWindows()}
    </Container>
  );
}
