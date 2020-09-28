import React from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  container: {
    width: "calc(100vw - 190px)",
    height: "calc(100vh - 136px)",
    marginTop: "25px",
    background: "var(--thumbBG)",
    borderRadius: 8,
    overflow: "hidden",
  },
}));

export default function Container({ children }: any) {
  const classes = useStyles();
  return <div className={classes.container}>{children}</div>;
}
