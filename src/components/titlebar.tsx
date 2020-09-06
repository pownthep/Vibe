import React from "react";
import { Container } from "../utils/styles";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import { NavRoute } from "../utils/interfaces";
import Darkmode from "./darkmode";
import LoginButton from "./login_btn";

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
          padding: "0px 20px 0px 20px",
        }}
      >
        <div>
          <Darkmode />
        </div>
        <div style={{ margin: "0 auto" }}></div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {routes.map((r, index) => (
            <div key={index} className={classes.navItem}>
              <Link to={r.path}>{r.label}</Link>
            </div>
          ))}
        </div>
        <div style={{ margin: "0 auto" }}></div>
        <LoginButton />
      </div>
    </Container>
  );
}
