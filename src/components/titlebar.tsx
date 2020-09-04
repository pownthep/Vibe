import React from "react";
import { Container } from "../utils/styles";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import { NavRoute } from "../utils/interfaces";
import { useSetRecoilState } from "recoil";
import { themeState } from "../App";
import { Divider, IconButton } from "@material-ui/core";
import Darkmode from "./darkmode";

const useStyles = makeStyles(() => ({
  navItem: {
    margin: "5px 20px 5px 20px",
  },
  logo: {
    margin: "0 0 0 20px",
    height: 30,
  },
  navText: {
    fontFamily: "'Inter var', sans-serif",
  },
}));

type Props = {
  backgroundColor: string;
  routes: Array<NavRoute>;
};

export default function Titlebar({ backgroundColor, routes }: Props) {
  const classes = useStyles();

  return (
    <Container backgroundColor={backgroundColor}>
      <div
        style={{
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src="https://vibe-three.vercel.app/icon.ico"
          alt="logo"
          className={classes.logo}
        />
        {routes.map((r, index) => (
          <div key={index} className={classes.navItem}>
            <Link to={r.path}>{r.label}</Link>
          </div>
        ))}
        <div style={{ margin: "0 auto" }}></div>
        {/* <div className={classes.navItem}>
          <Darkmode />
        </div> */}
      </div>
    </Container>
  );
}
