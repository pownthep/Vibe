import React, { useEffect, useState } from "react";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Avatar,
  makeStyles,
} from "@material-ui/core";
import AccountCircleRoundedIcon from "@material-ui/icons/AccountCircleRounded";
import { getQuota, DOMAIN } from "../utils/utils";

const useStyles = makeStyles((theme) => ({
  orange: {
    color: theme.palette.getContrastText(theme.palette.primary.main),
    backgroundColor: theme.palette.primary.main,
    fontFamily: "'Times New Roman', Times, serif",
  },
  cta: {
    background: theme.palette.primary.main,
  },
}));

export default function LoginButton() {
  const [user, setUser] = useState(null as any);
  const [profile, setProfile] = useState(null as any);
  const classes = useStyles();

  useEffect(() => {
    let eventSource = new EventSource(`${DOMAIN}/authenticate`);
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
        className={user && !user.authenticated ? classes.cta : ""}
        button
        onClick={() => {
          if (user && !user.authenticated) window.openExternal(user.url);
        }}
        style={{ margin: 5, borderRadius: 4, width: "auto" }}
      >
        {profile && (
          <ListItemAvatar>
            <Avatar className={classes.orange}>V</Avatar>
          </ListItemAvatar>
        )}
        {user && !user.authenticated && (
          <ListItemIcon>
            <AccountCircleRoundedIcon />
          </ListItemIcon>
        )}
        <ListItemText
          primary={
            profile ? (
              <strong>{profile.name}</strong>
            ) : (
              <strong>Authenticate app</strong>
            )
          }
        />
      </ListItem>
    </>
  );
}
