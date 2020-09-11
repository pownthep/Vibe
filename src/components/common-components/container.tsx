import React from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  container: {
    width: "100%",
    height: "calc(100vh - 25px)",
    marginTop: "25px",
    background: theme.palette.background.paper,
    borderTopLeftRadius: 8,
    overflow: "auto",
    boxShadow: theme.shadows[10],
  },
}));

export default function Container({ children }: any) {
  const classes = useStyles();
  return <div className={classes.container}>{children}</div>;
}
