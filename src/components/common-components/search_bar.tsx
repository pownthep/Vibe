import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: "100%",
    background: "var(--thumbBG)",
    boxShadow: "none",
    borderRadius: 0,
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
}));

type Props = {
  onChangeHandler?: (e: any) => void;
  onKeyHandler?: (e: any) => void;
};

export default function SearchBar({ onChangeHandler, onKeyHandler }: Props) {
  const classes = useStyles();

  return (
    <Paper component="form" className={classes.root}>
      <IconButton className={classes.iconButton} aria-label="menu">
        <SearchIcon />
      </IconButton>
      <InputBase
        onChange={onChangeHandler}
        onKeyDown={onKeyHandler}
        className={classes.input}
        placeholder="Search Drive"
        inputProps={{ "aria-label": "search drive" }}
      />
    </Paper>
  );
}
