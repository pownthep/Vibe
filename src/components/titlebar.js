import React from "react";
import {
  Container,
} from "../utils/styles";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import clsx from "clsx";
import MenuIcon from "@material-ui/icons/Menu";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  },
  nav: {
    width: "100%",
    backgroundColor: "inherit",
  },
  list: {
    width: 250,
  },
  fullList: {
    width: "auto",
  },
  listItemText: {
    fontWeight: "bold",
  },
  drawerPaper: {
    backgroundColor: "rgba(0,0,0,0.9)",
    backdropFilter: "blur(2px)",
  },
  drawer: {
    WebkitAppRegion: "no-drag",
  },
}));

export default function Titlebar({ backgroundColor, routes }) {
  const classes = useStyles();

  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const history = useHistory();

  const list = (anchor) => (
    <div
      className={clsx(classes.list, {
        [classes.fullList]: anchor === "top" || anchor === "bottom",
      })}
      role="presentation"
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        <ListItem button>
          <ListItemIcon>
            <img
              src="http://vibe-three.vercel.app/icon.ico"
              alt="logo"
              width="35"
            />
          </ListItemIcon>
          <ListItemText primary={<strong>VIBE</strong>} />
        </ListItem>
        <Divider />
        {routes.map((r, index) => (
          <div key={index}>
            <ListItem
              button
              onClick={() => {
                toggleDrawer(anchor, false);
                history.push(r.path);
              }}
            >
              <ListItemIcon>{r.icon}</ListItemIcon>
              <ListItemText
                primary={<strong>{r.label}</strong>}
                classes={{ root: classes.listItemText }}
              />
            </ListItem>
            {index === 4 && <Divider style={{ marginTop: "auto" }} />}
          </div>
        ))}
      </List>
    </div>
  );

  return (
    <Container backgroundColor={backgroundColor}>
      <div
        style={{
          WebkitAppRegion: "no-drag",
          width: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {["left"].map((anchor) => (
          <React.Fragment key={anchor}>
            <IconButton onClick={toggleDrawer(anchor, true)}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor={anchor}
              open={state[anchor]}
              onClose={toggleDrawer(anchor, false)}
              classes={{ root: classes.drawer, paper: classes.drawerPaper }}
            >
              {list(anchor)}
            </Drawer>
          </React.Fragment>
        ))}
        <h1>VIBE</h1>
      </div>
    </Container>
  );
}
