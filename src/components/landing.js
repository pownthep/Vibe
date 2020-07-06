import React from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import DesktopWindowsIcon from "@material-ui/icons/DesktopWindows";
import { makeStyles } from "@material-ui/core/styles";
import AppleIcon from "@material-ui/icons/Apple";
import ComputerIcon from "@material-ui/icons/Computer";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
  flexContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  flexIcon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
}));

export default function Landing() {
  const classes = useStyles();
  return (
    <div className={classes.flexContainer}>
      <div>
        <div className={classes.flexIcon}>
          <img src={window.location + "/icon.ico"} alt="" />
        </div>
        <Typography variant="h5" style={{ textAlign: "center" }}>
          Stream high-quality shows. No ads. No bullshit.
        </Typography>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
            marginTop: 10,
          }}
        >
          <img
            src="./capture.PNG"
            alt="app screenshot"
            style={{ width: "60%" }}
            className="box"
          />
        </div>
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
  );
}
