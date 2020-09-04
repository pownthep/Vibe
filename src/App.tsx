import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core";
import Home from "./components/home";
import FavouritePage from "./components/favourites";
import HistoryPage from "./components/history";
import SettingsPage from "./components/settings";
import DrivePage from "./components/drive";
import DownloadPage from "./components/download";
import HomeRoundedIcon from "@material-ui/icons/HomeRounded";
import FavoriteRoundedIcon from "@material-ui/icons/FavoriteRounded";
import GetAppRoundedIcon from "@material-ui/icons/GetAppRounded";
import CloudRoundedIcon from "@material-ui/icons/CloudRounded";
import HistoryRoundedIcon from "@material-ui/icons/HistoryRounded";
import SettingsRoundedIcon from "@material-ui/icons/SettingsRounded";
import Titlebar from "./components/titlebar";
import Player from "./components/player";
import { NavRoute } from "./utils/interfaces";
import FlashPlayer from "./components/flashplayer";
import { atom, selector, useRecoilState, useRecoilValue } from "recoil";
import AddPage from "./components/add_page";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  content: {
    width: "100%",
  },
}));

export const themeState = atom({
  key: "themeState",
  default: {
    palette: {
      type: "dark",
    },
  },
});

export default function App() {
  const themeStateValue = useRecoilValue(themeState);
  const theme = createMuiTheme(themeStateValue as any);

  const classes = useStyles();

  const routes: Array<NavRoute> = [
    {
      path: "/",
      exact: true,
      component: Home,
      label: "Home",
      icon: <HomeRoundedIcon />,
    },
    {
      path: "/favourites",
      exact: true,
      component: FavouritePage,
      label: "Favourites",
      icon: <FavoriteRoundedIcon />,
    },
    {
      path: "/downloader",
      exact: true,
      component: DownloadPage,
      label: "Downloads",
      icon: <GetAppRoundedIcon />,
    },
    {
      path: "/drive",
      exact: true,
      component: DrivePage,
      label: "Drive",
      icon: <CloudRoundedIcon />,
    },
    {
      path: "/history",
      exact: true,
      component: HistoryPage,
      label: "History",
      icon: <HistoryRoundedIcon />,
    },
    {
      path: "/settings",
      exact: true,
      component: SettingsPage,
      label: "Settings",
      icon: <SettingsRoundedIcon />,
    },
    {
      path: "/add",
      exact: true,
      component: AddPage,
      label: "Add",
      icon: <SettingsRoundedIcon />,
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <CssBaseline />
        <Titlebar routes={routes} backgroundColor="black" />
        <main className={classes.content}>
          <Switch>
            {routes.map((route) => (
              <Route
                key={route.path}
                exact={route.exact}
                path={route.path}
                component={route.component}
              />
            ))}
            <Route
              key={"/watch/:id/:epId?"}
              exact={true}
              path="/watch/:id/:epId?"
              component={window.electron ? Player : FlashPlayer}
            />
            <Route render={() => <Redirect to="/" />} />
          </Switch>
        </main>
      </div>
    </ThemeProvider>
  );
}
