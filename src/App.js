import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import CssBaseline from "@material-ui/core/CssBaseline";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import TuneIcon from "@material-ui/icons/Tune";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import HistoryIcon from "@material-ui/icons/History";
import CloudQueueIcon from "@material-ui/icons/CloudQueue";
import Loader from "./components/loader";
import SearchIcon from "@material-ui/icons/Search";
import PlayerPage from "./components/player";
import Home from "./components/home";
import FavouritePage from "./components/favourites";
import HistoryPage from "./components/history";
import SettingsPage from "./components/settings";
import DrivePage from "./components/drive";
import DownloadPage from "./components/download";
import SystemUpdateAltIcon from "@material-ui/icons/SystemUpdateAlt";

const drawerWidth = 55;

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      // Purple and green play nicely together.
      main: "#ffffff",
    },
    secondary: {
      // This is green.A700 as hex.
      main: "#e91e63",
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
    zIndex: 3,
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: "rgba(0,0,0,0.0)",
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    width: "100%",
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
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

export default function PermanentDrawerLeft() {
  const classes = useStyles();
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
      icon: <FavoriteBorderIcon />,
    },
    {
      path: "/downloader",
      exact: true,
      component: DownloadPage,
      label: "Downloader",
      icon: <SystemUpdateAltIcon />,
    },
    {
      path: "/drive",
      exact: true,
      component: DrivePage,
      label: "G Drive",
      icon: <CloudQueueIcon />,
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
      icon: <TuneIcon />,
    },
  ];

  const Titlebar = React.lazy(() => import("./components/titlebar"));

  return (
    <>
      <Router>
        <React.Suspense fallback={<Loader />}>
          {window.store ? (
            <Titlebar title="" backgroundColor="inherit" />
          ) : (
            <></>
          )}
          <ThemeProvider theme={theme}>
            <div className={classes.root}>
              <CssBaseline />
              <Drawer
                className={classes.drawer}
                variant="permanent"
                classes={{
                  paper: classes.drawerPaper,
                  root: classes.drawerBg,
                  paperAnchorDockedLeft: classes.noBorder,
                }}
                anchor="left"
              >
                {" "}
                <div className={classes.padding}></div>
                <List dense={false}>
                  <div style={{ height: 12 }}></div>
                  {routes.map((route, index) => (
                    <Link to={route.path} key={index}>
                      <ListItem button>
                        <ListItemIcon classes={{ root: classes.navIcon }}>
                          {route.icon}
                        </ListItemIcon>
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
