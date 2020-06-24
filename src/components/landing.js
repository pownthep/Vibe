import React, { useEffect, useState } from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import DesktopWindowsIcon from "@material-ui/icons/DesktopWindows";
import { makeStyles } from "@material-ui/core/styles";
import AppleIcon from "@material-ui/icons/Apple";
import ComputerIcon from "@material-ui/icons/Computer";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
  flexContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "80vh",
    backgroundColor: theme.palette.background.paper,
  },
  flexIcon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "30vh",
  },
}));

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      // Purple and green play nicely together.
      main: "#11cb5f",
    },
    secondary: {
      // This is green.A700 as hex.
      main: "#e91e63",
    },
  },
});

export default function Landing() {
  const [data, setData] = useState([]);
  const [isMounted, setMounted] = useState(true);
  const classes = useStyles();

  useEffect(() => {
    (async () => {
      const res = await fetch(window.location + "/completed-series.json");
      const json = await res.json();
      if (isMounted) setData(json);
    })();
    return () => {
      setMounted(false);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.flexContainer}>
        <div>
          <div className={classes.flexIcon}>
            <img src={window.location + "/icon.ico"} alt="" />
            <Typography variant="h1" component="h2">
              VIBE
            </Typography>
          </div>
          <Typography variant="h4" style={{ textAlign: "center" }}>
            Stream high-quality 1080p+ videos straight from Google Drive. No
            ads. No bullshit.
          </Typography>
          <div style={{ textAlign: "center", marginTop: 30 }}>
            <Button
              variant="contained"
              color="secondary"
              className={classes.button}
              startIcon={<DesktopWindowsIcon />}
            >
              Windows 10
            </Button>
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
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
