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
import { NavRoute } from "./utils/interfaces";
import HomeRoundedIcon from "@material-ui/icons/HomeRounded";
import FavoriteRoundedIcon from "@material-ui/icons/FavoriteRounded";
import GetAppRoundedIcon from "@material-ui/icons/GetAppRounded";
import CloudRoundedIcon from "@material-ui/icons/CloudRounded";
import HistoryRoundedIcon from "@material-ui/icons/HistoryRounded";
import SettingsRoundedIcon from "@material-ui/icons/SettingsRounded";
import Home from "./pages/home";
import FavouritePage from "./pages/favourites";
import HistoryPage from "./pages/history";
import SettingsPage from "./pages/settings";
import DrivePage from "./pages/drive";
import DownloadPage from "./pages/download";
import { atom, useRecoilValue, useRecoilState } from "recoil";
import { ThemeProvider } from "@material-ui/styles";
import Darkmode from "./components/sidebar-components/darkmode";
import LoginButton from "./components/sidebar-components/login_btn";
import Titlebar from "./components/common-components/titlebar";
import Upload from "./pages/upload";
import CloudUploadRoundedIcon from "@material-ui/icons/CloudUploadRounded";
import PlayerBar from "./components/player-ui-components/player_bar";
import ShowPage from "./pages/show_page";

const drawerWidth = 180;

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
  drawerPaperLight: {
    width: drawerWidth,
    borderRight: "none",
    "-webkit-app-region": "no-drag",
    background: "#fafafa",
    zIndex: 1,
  },
  drawerPaperDark: {
    width: drawerWidth,
    borderRight: "none",
    "-webkit-app-region": "no-drag",
    background: "#303030",
    zIndex: 1,
  },
  content: {
    flexGrow: 1,
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
  listItem: {
    width: "auto",
    margin: 5,
    borderRadius: 4,
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
        main: "#2196F3",
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

export const playerNode = atom({
  key: "miniplayer",
  default: null,
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
      path: "/upload",
      exact: true,
      component: Upload,
      label: "Upload",
      icon: <CloudUploadRoundedIcon />,
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
        {/* <div className="margin-top-36"></div> */}
        <Link to="/">
          <ListItem
            button
            selected={navSate === "Home"}
            classes={{
              root: classes.listItem,
            }}
          >
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
        <Link to="/upload">
          <ListItem
            button
            selected={navSate === "Upload"}
            classes={{
              root: classes.listItem,
            }}
          >
            <ListItemIcon>
              <CloudUploadRoundedIcon
                style={
                  {
                    color:
                      navSate === "Upload" &&
                      themeStateValue.palette.primary.main,
                  } as any
                }
              />
            </ListItemIcon>
            <ListItemText primary="Upload" />
          </ListItem>
        </Link>
        <Link to="/favourites">
          <ListItem
            button
            selected={navSate === "Favourites"}
            classes={{
              root: classes.listItem,
            }}
          >
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
          <ListItem
            button
            selected={navSate === "Downloads"}
            classes={{
              root: classes.listItem,
            }}
          >
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
          <ListItem
            button
            selected={navSate === "Google Drive"}
            classes={{
              root: classes.listItem,
            }}
          >
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
          <ListItem
            button
            selected={navSate === "History"}
            classes={{
              root: classes.listItem,
            }}
          >
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
        <Divider style={{ margin: 10 }} />
        <Link to="/settings">
          <ListItem
            button
            selected={navSate === "Settings"}
            classes={{
              root: classes.listItem,
            }}
          >
            <ListItemIcon>
              <SettingsRoundedIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
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
      <Titlebar
        backgroundColor={
          themeStateValue.palette.type === "dark" ? "#212121" : "#f5f5f5"
        }
      />
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
                paper:
                  themeStateValue.palette.type === "dark"
                    ? classes.drawerPaperDark
                    : classes.drawerPaperLight,
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
                paper:
                  themeStateValue.palette.type === "dark"
                    ? classes.drawerPaperDark
                    : classes.drawerPaperLight,
              }}
              variant="permanent"
              open
            >
              {drawer}
            </Drawer>
          </Hidden>
        </nav>
        <main className={classes.content} id="main">
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
              key={"/watch/:id/:epId?/:timePos?"}
              exact={true}
              path="/watch/:id/:epId?/:timePos?"
              render={(props) => <ShowPage showId={props.match.params.id} />}
            />
            <Route render={() => <Redirect to="/" />} />
          </Switch>
        </main>
        <PlayerBar />
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
