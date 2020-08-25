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
import Loader from "./components/loader";
import PlayerPage from "./components/player";
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

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      // Purple and green play nicely together.
      main: "#11cb5f",
    },
    secondary: {
      // This is green.A700 as hex.
      main: "#ffffff",
    },
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    width: "100%",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    marginTop: 28,
  },
  titlebar: theme.palette.background.paper,
  padding: {
    height: 20,
  },
  navIcon: {
    minWidth: "100%",
  },
  drawerBg: {},
  noBorder: {
    borderRight: "1px",
  },
}));

export default function App() {
  const classes = useStyles();
  
  const routes = [
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
      label: "Downloader",
      icon: <GetAppRoundedIcon />,
    },
    {
      path: "/drive",
      exact: true,
      component: DrivePage,
      label: "My Drive",
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
  ];

  const Titlebar = React.lazy(() => import("./components/titlebar"));

  return (
    <>
      <Router>
        <React.Suspense fallback={<Loader />}>
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
                    component={PlayerPage}
                  />
                  <Route render={() => <Redirect to="/" />} />
                </Switch>
              </main>
            </div>
          </ThemeProvider>
        </React.Suspense>
      </Router>
    </>
  );
}
