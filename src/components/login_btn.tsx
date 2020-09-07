import React, { useEffect, useState } from "react";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from "@material-ui/core";
import AccountCircleRoundedIcon from "@material-ui/icons/AccountCircleRounded";
import { getQuota } from "../utils/utils";

export default function LoginButton() {
  const [user, setUser] = useState(null as any);
  const [profile, setProfile] = useState(null as any);

  useEffect(() => {
    let eventSource = new EventSource("http://localhost:8080/authenticate");
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
        button
        onClick={() => {
          if (user && !user.authenticated) window.openExternal(user.url);
        }}
        style={{ marginTop: "auto" }}
      >
        {profile && (
          <ListItemAvatar>
            <Avatar
              alt={profile.name}
              src={profile.user.picture.url as string}
            />
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
              <strong>Authenticate</strong>
            )
          }
        />
      </ListItem>
    </>
  );
}
