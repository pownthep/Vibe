import React, { useEffect } from "react";
import { useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import Divider from "@material-ui/core/Divider";
import { getCacheSize, deleteCache } from "../utils/utils";

export default function Settings() {
  const [size, setSize] = useState("0 B");

  useEffect(() => {
    if (!window.remote) return;
    (async () => {
      const json = await getCacheSize();
      setSize(json.size);
    })();
  }, []);

  const clearCache = async (e: any) => {
    if (size === "0 B") return;
    const json = await deleteCache();
    if (!json.error) setSize("0 B");
  };
  if (window.electron) {
    return (
      <div
        style={{
          marginTop: "70px",
          display: "flex",
          justifyContent: "flex-start",
          alignItems:"center",
          fontWeight: "bold",
        }}
      >
        <IconButton color="secondary" onClick={clearCache}>
          <DeleteIcon />
        </IconButton>
        Cache Size: {size}
        <Divider/>
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
