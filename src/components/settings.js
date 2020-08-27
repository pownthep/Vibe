import React, { useEffect } from "react";
import { useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import { makeStyles } from "@material-ui/core/styles";
import Divider from "@material-ui/core/Divider";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
  inline: {
    display: "inline-block",
  },
}));

export default function Settings() {
  const [size, setSize] = useState("0 B");
  const [loading, setLoading] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    if (!window.remote) return;
    (async () => {
      const res = await fetch(window.API + "cachesize");
      const json = await res.json();
      setSize(json.size);
    })();
  }, []);

  const clearCache = async () => {
    if (size === "0 B") return;
    setLoading(true);
    const res = await fetch(window.API + "clearcache");
    const json = await res.json();
    if (!json.error) setSize("0 B");
    setLoading(false);
  };
  if (window.remote) {
    return (
      <div style={{ marginTop: 70, diplay: "flex", justifyContent: "center", fontWeight: "bold" }}>
        {/* <StorageIcon /> */}
        <IconButton
          variant="contained"
          color="secondary"
          className={classes.button}
          onClick={clearCache}
        >
          <DeleteIcon />
        </IconButton>
        Cache Size: {size}
        <Divider light />
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
