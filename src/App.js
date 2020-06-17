import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import CssBaseline from "@material-ui/core/CssBaseline";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import SettingsIcon from "@material-ui/icons/Settings";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core";
import Titlebar from "react-electron-titlebar";
import FavoriteIcon from "@material-ui/icons/Favorite";
import HistoryIcon from "@material-ui/icons/History";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import OfflinePinIcon from "@material-ui/icons/OfflinePin";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import CloudIcon from "@material-ui/icons/Cloud";
import Store from "electron-store";
import Loader from "./components/loader";
import SearchIcon from "@material-ui/icons/Search";
import PlayerPage from "./components/player";

const store = new Store();

const drawerWidth = 170;

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      // Purple and green play nicely together.
      main: "#11cb5f",
    },
    secondary: {
      // This is green.A700 as hex.
      main: "#11cb5f",
    },
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    opacity: "0.95",
  },
  drawerPaper: {
    width: drawerWidth,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    width: "100%",
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  titlebar: {
    textAlign: "center",
    zIndex: 10000,
    color: "white",
  },
}));

export default function PermanentDrawerLeft() {
  const classes = useStyles();
  const ReactLazyPreload = (importStatement) => {
    const Component = React.lazy(importStatement);
    Component.preload = importStatement;
    return Component;
  };

  const Home = ReactLazyPreload(() => import("./components/home"));
  const FavouritePage = ReactLazyPreload(() =>
    import("./components/favourites")
  );
  const HistoryPage = ReactLazyPreload(() => import("./components/history"));
  const SettingsPage = ReactLazyPreload(() => import("./components/settings"));
  //const PlayerPage = ReactLazyPreload(() => import("./components/player"));

  const routes = [
    {
      path: "/",
      exact: true,
      component: Home,
      label: "Search",
      icon: <SearchIcon />,
    },
    {
      path: "/favourites",
      exact: true,
      component: FavouritePage,
      label: "Favourites",
      icon: <FavoriteIcon />,
    },
    {
      path: "/downloader",
      exact: true,
      component: FavouritePage,
      label: "Downloader",
      icon: <CloudDownloadIcon />,
    },
    {
      path: "/offline",
      exact: true,
      component: FavouritePage,
      label: "Offline",
      icon: <OfflinePinIcon />,
    },
    {
      path: "/drive",
      exact: true,
      component: FavouritePage,
      label: "G Drive",
      icon: <CloudIcon />,
    },
    {
      path: "/history",
      exact: true,
      component: HistoryPage,
      label: "History",
      icon: <HistoryIcon />,
    },
    {
      path: "/settings",
      exact: true,
      component: SettingsPage,
      label: "Settings",
      icon: <SettingsIcon />,
    },
    // { path: "/watch/:id/:epId?", exact: true, component: PlayerPage },
  ];

  Home.preload();
  FavouritePage.preload();
  HistoryPage.preload();
  SettingsPage.preload();
  //PlayerPage.preload();

  useEffect(() => {
    const authenticate = async () => {
      const res = await fetch("http://localhost:9001/authenticate");
      const auth = await res.json();
      store.set("auth", auth);
    };
    authenticate();
  }, []);

  return (
    <>
      <div className={classes.titlebar}>
        <Titlebar title="" backgroundColor="#11cb5f" />
      </div>
      <Router>
        {" "}
        <React.Suspense fallback={<Loader />}>
          <ThemeProvider theme={theme}>
            <div className={classes.root}>
              <CssBaseline />
              <Drawer
                className={classes.drawer}
                variant="permanent"
                classes={{
                  paper: classes.drawerPaper,
                }}
                anchor="left"
              >
                <List dense={true}>
                  <ListItem button>
                    <ListItemIcon>
                      <Avatar src="http://localhost:9001/icon" />
                    </ListItemIcon>
                    <ListItemText primary="VIBE" />
                  </ListItem>
                  <Divider />
                  {routes.map((route, index) => (
                    <Link to={route.path} key={index}>
                      <ListItem button>
                        <ListItemIcon>{route.icon}</ListItemIcon>
                        <ListItemText primary={route.label} />
                      </ListItem>
                    </Link>
                  ))}
                </List>
              </Drawer>
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
