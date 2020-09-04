import React, { memo } from "react";
import { useRecoilState } from "recoil";
import { themeState } from "../App";
import Brightness4RoundedIcon from "@material-ui/icons/Brightness4Rounded";
import Brightness7RoundedIcon from "@material-ui/icons/Brightness7Rounded";
import { IconButton } from "@material-ui/core";

function Darkmode() {
  const [theme, setTheme] = useRecoilState(themeState);

  const Button = () => {
    return theme.palette.type === "light" ? (
      <Brightness4RoundedIcon />
    ) : (
      <Brightness7RoundedIcon />
    );
  };

  return (
    <IconButton
      style={{ WebKitRegion: "no-drag" } as any}
      onClick={() => {
        setTheme((old) => ({
          palette: {
            ...old.palette,
            type: old.palette.type === "light" ? "dark" : "light",
          },
        }));
      }}
    >
      {Button()}
    </IconButton>
  );
}

export default Darkmode;
