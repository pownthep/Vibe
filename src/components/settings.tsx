import React, { useEffect } from "react";
import { useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import Divider from "@material-ui/core/Divider";
import { getCacheSize, deleteCache } from "../utils/utils";
import { useSetRecoilState } from "recoil";
import { navState } from "../App";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  container: {
    width: "100%",
    height: "calc(100vh - 25px)",
    marginTop: "25px",
    background: theme.palette.background.paper,
    borderTopLeftRadius: 8,
    padding: 10,
  },
}));

export default function Settings() {
  const [size, setSize] = useState("0 B");
  const setNavState = useSetRecoilState(navState);
  const classes = useStyles();
  useEffect(() => {
    setNavState("Settings");
    if (!window.remote) return;
    (async () => {
      const json = await getCacheSize();
      setSize(json.size);
    })();
  }, [setNavState]);

  const clearCache = async (e: any) => {
    if (size === "0 B") return;
    const json = await deleteCache();
    if (!json.error) setSize("0 B");
  };
  if (window.electron) {
    return (
      <div className={classes.container}>
        <IconButton color="secondary" onClick={clearCache}>
          <DeleteIcon style={{ color: "red" }} />
        </IconButton>
        Cache Size: {size}
        <Divider />
      </div>
    );
  } else {
    return (
      <h1 style={{ textAlign: "center", marginTop: 100 }}>
        Only available on Desktop App
      </h1>
    );
  }
}
