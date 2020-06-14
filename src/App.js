import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import CssBaseline from "@material-ui/core/CssBaseline";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import VideoLibraryIcon from "@material-ui/icons/VideoLibrary";
import SettingsIcon from "@material-ui/icons/Settings";
import Player from "./components/player";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core";
import Titlebar from "react-electron-titlebar";
import Home from "./components/home";
import FavoriteIcon from "@material-ui/icons/Favorite";
import HistoryIcon from "@material-ui/icons/History";
import Avatar from "@material-ui/core/Avatar";
import Divider from '@material-ui/core/Divider';

const drawerWidth = 200;

const theme = createMuiTheme({
  palette: {
    type: "dark",
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
}));

export default function PermanentDrawerLeft() {
  const classes = useStyles();
  const navItem = [
    <VideoLibraryIcon />,
    <FavoriteIcon />,
    <HistoryIcon />,
    <SettingsIcon />,
  ];
  const routesList = ["/", "/favourites", "/history", "/settings"];

  return (
    <Router>
      <Titlebar title="App Title" backgroundColor="#ffff" />
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
            <List>
              <ListItem button>
                <ListItemIcon>
                  <Avatar src="https://scontent.fnak3-1.fna.fbcdn.net/v/t1.0-9/12661956_948461535208076_774709796530671292_n.jpg?_nc_cat=104&_nc_sid=85a577&_nc_eui2=AeHXuLgPaPv-p2aW64NXWcoO7UQ1t09Hw1HtRDW3T0fDURrCjSmiUhRg_dCJFX2qWOhbA3j1iAZqpFxph8rKIGP-&_nc_ohc=6gpEgtfaB3cAX-i4q11&_nc_ht=scontent.fnak3-1.fna&oh=27875adbca764c230c3a0f6492874f73&oe=5F0A8E01" />
                </ListItemIcon>
                <ListItemText primary="Pownthep" />
              </ListItem>
              <Divider />
              {["Library", "Favourites", "History", "Setting"].map(
                (text, index) => (
                  <Link to={routesList[index]} key={text}>
                    <ListItem button>
                      <ListItemIcon>{navItem[index]}</ListItemIcon>
                      <ListItemText primary={text} />
                    </ListItem>
                  </Link>
                )
              )}
            </List>
          </Drawer>
          <main className={classes.content}>
            <Switch>
              <Route path="/watch/:id">
                <Player />
              </Route>
              <Route path="/favourites">
                <h1>Favourites</h1>
              </Route>
              <Route path="/history">
                <h1>History</h1>
              </Route>
              <Route path="/settings">
                <h1>Settings</h1>
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </main>
        </div>
      </ThemeProvider>
    </Router>
  );
}


