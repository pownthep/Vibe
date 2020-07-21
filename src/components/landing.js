import React from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import DesktopWindowsIcon from "@material-ui/icons/DesktopWindows";
import { makeStyles } from "@material-ui/core/styles";
import AppleIcon from "@material-ui/icons/Apple";
import ComputerIcon from "@material-ui/icons/Computer";
import AndroidIcon from "@material-ui/icons/Android";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
  flexContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "black",
  },
  flexIcon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    height: "60px",
  },
}));

export default function Landing() {
  const classes = useStyles();
  return (
    <div className={classes.flexContainer}>
      <div>
        <div className={classes.flexIcon}>
          <img
            src={window.location + "/icon.ico"}
            alt="icon"
            className={classes.logo}
          />
          <h1 style={{ color: "white", letterSpacing: 5 }}>IBE</h1>
        </div>
        <Typography
          variant="h5"
          style={{ textAlign: "center", color: "white", fontSize: "auto" }}
        >
          Stream high-quality shows. No ads. No bullshit.
        </Typography>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: 10,
            marginTop: 10,
          }}
        >
          <img
            src="./capture.PNG"
            alt="app screenshot"
            style={{ maxHeight: "50vh", maxWidth:"100%", borderRadius: 5, margin: 50 }}
            className="box"
          />
          <img
            src="./android.jpg"
            alt="app screenshot"
            style={{ maxHeight: "50vh", maxWidth:"100%", borderRadius: 5, margin: 50 }}
            className="box"
          />
        </div>
        <div style={{ textAlign: "center", marginTop: 30 }}>
          <h1 style={{ color: "white" }}>Available on </h1>
          <a href="https://github.com/pownthep/Vibe/releases/download/v1.0-beta.1/vibe-win32-x64.zip">
            <Button
              variant="contained"
              color="secondary"
              className={classes.button}
              startIcon={<DesktopWindowsIcon />}
            >
              Windows 10
            </Button>
          </a>
          <Button
            variant="contained"
            color="secondary"
            className={classes.button}
            startIcon={<AppleIcon />}
          >
            Mac OS X
          </Button>
          <Button
            variant="contained"
            color="secondary"
            className={classes.button}
            startIcon={<ComputerIcon />}
          >
            Linux
          </Button>
          <a href="https://github.com/pownthep/Vibe-Mobile/releases/download/v1.0-alpha/app-arm64-v8a-debug.apk">
            <Button
              variant="contained"
              color="secondary"
              className={classes.button}
              startIcon={<AndroidIcon />}
            >
              Android
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
