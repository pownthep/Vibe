import React from "react";
import { Container } from "../utils/styles";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import { NavRoute } from "../utils/interfaces";
import Darkmode from "./darkmode";
import LoginButton from "./login_btn";
import { Divider } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  navItem: {
    margin: "5px 20px 5px 20px",
    fontWeight: "bold",
  },
  logo: {
    height: 30,
  },
  navText: {
    fontFamily: "'Inter var', sans-serif",
  },
}));

type Props = {
  backgroundColor: string;
};

export default function Titlebar({ backgroundColor }: Props) {
  const classes = useStyles();
  console.log(backgroundColor);

  return <Container backgroundColor={backgroundColor}></Container>;
}
