import React from "react";
import PropTypes from "prop-types";
import CssBaseline from "@material-ui/core/CssBaseline";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { fade, makeStyles, createMuiTheme } from "@material-ui/core/styles";
import { Switch, Route, Redirect, Link } from "react-router-dom";
import Player from "./components/player";
import { NavRoute } from "./utils/interfaces";
import HomeRoundedIcon from "@material-ui/icons/HomeRounded";
import FavoriteRoundedIcon from "@material-ui/icons/FavoriteRounded";
import GetAppRoundedIcon from "@material-ui/icons/GetAppRounded";
import CloudRoundedIcon from "@material-ui/icons/CloudRounded";
import HistoryRoundedIcon from "@material-ui/icons/HistoryRounded";
import SettingsRoundedIcon from "@material-ui/icons/SettingsRounded";
import Home from "./components/home";
import FavouritePage from "./components/favourites";
import HistoryPage from "./components/history";
import SettingsPage from "./components/settings";
import DrivePage from "./components/drive";
import DownloadPage from "./components/download";
import { atom, useRecoilValue, useRecoilState } from "recoil";
import { ThemeProvider } from "@material-ui/styles";
import Darkmode from "./components/darkmode";
import "./App.css";
import LoginButton from "./components/login_btn";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  // necessary for content to be below app bar
  toolbar: {
    height: 36,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 8,
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

export const themeState = atom({
  key: "themeState",
  default: {
    palette: {
      type: "dark",
      primary: {
        main: "#ff3d00",
      },
      secondary: {
        main: "#ff6333",
      },
    },
  },
});

export const navState = atom({
  key: "navState",
  default: "",
});

function ResponsiveDrawer(props: any) {
  const { window } = props;
  const classes = useStyles();
  const themeStateValue = useRecoilValue(themeState);
  const theme = createMuiTheme(themeStateValue as any);

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [navSate] = useRecoilState(navState);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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
      label: "Google Drive",
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

  const drawer = (
    <div>
      <List disablePadding={true} dense={true}>
        <LoginButton />
        <Divider />
        <Link to="/">
          <ListItem button selected={navSate === "Home"}>
            <ListItemIcon>
              <HomeRoundedIcon
                style={
                  {
                    color:
                      navSate === "Home" &&
                      themeStateValue.palette.primary.main,
                  } as any
                }
              />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
        </Link>
        {/* {routes.slice(1, 5).map(({ path, label, icon }) => ( */}
        <Link to="/favourites">
          <ListItem button selected={navSate === "Favourites"}>
            <ListItemIcon>
              <FavoriteRoundedIcon
                style={
                  {
                    color:
                      navSate === "Favourites" &&
                      themeStateValue.palette.primary.main,
                  } as any
                }
              />
            </ListItemIcon>
            <ListItemText primary="Favourites" />
          </ListItem>
        </Link>
        <Link to="/downloader">
          <ListItem button selected={navSate === "Downloads"}>
            <ListItemIcon>
              <GetAppRoundedIcon
                style={
                  {
                    color:
                      navSate === "Downloads" &&
                      themeStateValue.palette.primary.main,
                  } as any
                }
              />
            </ListItemIcon>
            <ListItemText primary="Downloads" />
          </ListItem>
        </Link>
        <Link to="/drive">
          <ListItem button selected={navSate === "Google Drive"}>
            <ListItemIcon>
              <CloudRoundedIcon
                style={
                  {
                    color:
                      navSate === "Google Drive" &&
                      themeStateValue.palette.primary.main,
                  } as any
                }
              />
            </ListItemIcon>
            <ListItemText primary="Google Drive" />
          </ListItem>
        </Link>
        <Link to="/history">
          <ListItem button selected={navSate === "History"}>
            <ListItemIcon>
              <HistoryRoundedIcon
                style={
                  {
                    color:
                      navSate === "History" &&
                      themeStateValue.palette.primary.main,
                  } as any
                }
              />
            </ListItemIcon>
            <ListItemText primary="History" />
          </ListItem>
        </Link>
        {/* ))} */}
        <Divider />
        <Link to={routes[5].path}>
          <ListItem
            button
            key={routes[5].path}
            selected={navSate === "Settings"}
          >
            <ListItemIcon>{routes[5].icon}</ListItemIcon>
            <ListItemText primary={routes[5].label} />
          </ListItem>
        </Link>
        <Darkmode />
      </List>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <ThemeProvider theme={theme}>
      <div className={`${themeStateValue.palette.type}`}>
        <CssBaseline />
        <nav className={classes.drawer} aria-label="mailbox folders">
          {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
          <Hidden smUp implementation="css">
            <Drawer
              container={container}
              variant="temporary"
              anchor={theme.direction === "rtl" ? "right" : "left"}
              open={mobileOpen}
              onClose={handleDrawerToggle}
              classes={{
                paper: classes.drawerPaper,
              }}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
          <Hidden xsDown implementation="css">
            <Drawer
              classes={{
                paper: classes.drawerPaper,
              }}
              variant="permanent"
              open
            >
              {drawer}
            </Drawer>
          </Hidden>
        </nav>
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
              component={Player}
            />
            <Route render={() => <Redirect to="/" />} />
          </Switch>
        </main>
      </div>
    </ThemeProvider>
  );
}

ResponsiveDrawer.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default ResponsiveDrawer;
