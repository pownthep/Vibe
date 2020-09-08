import React from "react";
import { useRecoilState } from "recoil";
import { themeState } from "../App";
import Brightness4RoundedIcon from "@material-ui/icons/Brightness4Rounded";
import Brightness7RoundedIcon from "@material-ui/icons/Brightness7Rounded";
import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";

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
    <ListItem
      style={{ margin: 5, borderRadius: 4, width: "auto" }}
      button
      onClick={() => {
        setTheme((old) => ({
          palette: {
            ...old.palette,
            type: old.palette.type === "light" ? "dark" : "light",
          },
        }));
      }}
    >
      <ListItemIcon>{Button()}</ListItemIcon>
      <ListItemText
        primary={theme.palette.type === "light" ? "Dark Mode" : "Light Mode"}
      />
    </ListItem>
  );
}

export default Darkmode;
