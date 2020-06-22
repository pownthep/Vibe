import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import CssBaseline from "@material-ui/core/CssBaseline";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
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
import FavoriteIcon from "@material-ui/icons/Favorite";
import HistoryIcon from "@material-ui/icons/History";
import CloudIcon from "@material-ui/icons/Cloud";
import Loader from "./components/loader";
import SearchIcon from "@material-ui/icons/Search";
import PlayerPage from "./components/player";
import Home from "./components/home";
import FavouritePage from "./components/favourites";
import HistoryPage from "./components/history";
import SettingsPage from "./components/settings";
import Titlebar from "./components/titlebar";
import DrivePage from "./components/drive";
import DownloadPage from "./components/download";
import GetAppIcon from '@material-ui/icons/GetApp';

const store = window.store ? new window.store() : false;

const drawerWidth = 55;

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      // Purple and green play nicely together.
      main: "#11cb5f",
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
    height: "100vh",
    overflow: "auto",
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
    borderRight: "0px",
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
      icon: <FavoriteIcon />,
    },
    {
      path: "/downloader",
      exact: true,
      component: DownloadPage,
      label: "Downloader",
      icon: <GetAppIcon />,
    },
    // {
    //   path: "/offline",
    //   exact: true,
    //   component: OfflinePage,
    //   label: "Offline",
    //   icon: <OfflinePinIcon />,
    // },
    {
      path: "/drive",
      exact: true,
      component: DrivePage,
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
  ];

  useEffect(() => {
    if (!store) return;
    const authenticate = async () => {
      const res = await fetch("http://localhost:9001/authenticate");
      const auth = await res.json();
      store.set("auth", auth);
    };
    authenticate();
  }, []);

  return (
    <>
      <Router>
        <React.Suspense fallback={<Loader />}>
          {store ? <Titlebar title="" backgroundColor="inherit"/> : <></>}
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
                  {routes.map((route, index) => (
                    <Link to={route.path} key={index}>
                      <ListItem button>
                        <ListItemIcon classes={{ root: classes.navIcon }}>
                          {route.icon}
                        </ListItemIcon>
                        {/* <ListItemText primary={route.label} /> */}
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
