import React, { useEffect, useState } from "react";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from "@material-ui/core";
import AccountCircleRoundedIcon from "@material-ui/icons/AccountCircleRounded";
import { getQuota, API_DOMAIN } from "../../utils/api";

const useStyles = makeStyles((theme) => ({
  orange: {
    color: theme.palette.getContrastText(theme.palette.primary.main),
    // backgroundColor: theme.palette.primary.main,
    fontFamily: "'Times New Roman', Times, serif",
    boxShadow: theme.shadows[3],
  },
  cta: {
    background: theme.palette.primary.main,
    "-webkit-app-region": "no-drag",
  },
}));

export default function LoginButton() {
  const [user, setUser] = useState(null as any);
  const [profile, setProfile] = useState(null as any);
  const classes = useStyles();

  useEffect(() => {
    let eventSource = new EventSource(`${API_DOMAIN}/authenticate`);
    eventSource.onmessage = async (e) => {
      const user = JSON.parse(e.data);
      setUser(user);
      if (user.authenticated) {
        eventSource.close();
        const data = await getQuota();
        setProfile(data as any);
      }
    };
    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <>
      <ListItem
        className={classes.cta}
        button
        onClick={() => {
          if (user && !user.authenticated) window.openExternal(user.url);
        }}
        style={{
          width: "auto",
          marginTop: window.os === "darwin" ? 25 : 5,
          marginRight: 5,
          background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
          border: 0,
          borderTopRightRadius: 40,
          borderBottomRightRadius: 40,
          boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
          color: "white",
        }}
      >
        {/* {profile && (
          <ListItemAvatar>
            <Avatar className={classes.orange}>{profile.name[0]}</Avatar>
          </ListItemAvatar>
        )} */}
        <ListItemIcon>
          <AccountCircleRoundedIcon />
        </ListItemIcon>
        <ListItemText
          primary={
            profile ? (
              <strong>{profile.user.displayName.split(" ")[0]}</strong>
            ) : (
              <strong>Authenticate app</strong>
            )
          }
        />
      </ListItem>
    </>
  );
}
