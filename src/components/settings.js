import React, { useEffect } from "react";
import { useState } from "react";
import Button from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/Delete";
import { makeStyles } from "@material-ui/core/styles";
import LinearProgress from "@material-ui/core/LinearProgress";

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
    (async () => {
      const res = await fetch(window.API + "cachesize");
      const json = await res.json();
      setSize(json.size);
    })();
  }, []);

  const clearCache = async () => {
    if (size === "0 B") return;
    setLoading(true)
    const res = await fetch(window.API + "clearcache");
    const json = await res.json();
    if (!json.error) setSize("0 B");
    setLoading(false)
  };

  return (
    <div style={{ marginTop: 55 }}>
      <h2>Cache size</h2>
      {size}
      <Button
        variant="contained"
        color="secondary"
        className={classes.button}
        startIcon={<DeleteIcon />}
        onClick={clearCache}
      >
        Clear cache
      </Button>
      {loading ? <LinearProgress color="secondary" /> : <></>}
    </div>
  );
}
