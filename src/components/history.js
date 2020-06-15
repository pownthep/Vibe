import React, { useState } from "react";
import Store from "electron-store";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import ClearAllIcon from "@material-ui/icons/ClearAll";
import Tooltip from "@material-ui/core/Tooltip";
import { Link } from "react-router-dom";
import Fade  from '@material-ui/core/Fade';

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: "inline",
  },
}));

const store = new Store();

export default function History() {
  const classes = useStyles();
  const [history, setHistory] = useState(store.get("history"));
  const [checked] = useState(true);

  return (
    <>
      <h1>History</h1>
      <Tooltip title="Clear history">
        <IconButton
          edge="end"
          aria-label="clear history"
          onClick={(e) => {
            if (history.length > 0) {
              store.set("history", []);
              setHistory(store.get("history"));
            }
          }}
        >
          <ClearAllIcon />
        </IconButton>
      </Tooltip>
      {history ? (
        <Fade  in={checked}>
          <List className={classes.root} subheader={<li />}>
            {history.reverse().map((section, index) => (
              <div key={"listitem-" + section.id + index}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar
                      alt={section.title}
                      src={`http://localhost:9001/img/?url=https://lh3.googleusercontent.com/u/0/d/${section.id}=w200-h190-p-k-nu-iv1`}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={section.title}
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          className={classes.inline}
                          color="textPrimary"
                        >
                          {section.ep}
                        </Typography>
                        {` - ${toHHMMSS(section.currentTime)}`}
                      </React.Fragment>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Link to={"/watch/" + section.index}>
                      <IconButton edge="end" aria-label="comments">
                        <Tooltip title="Continue watching">
                          <PlayArrowIcon />
                        </Tooltip>
                      </IconButton>
                    </Link>
                  </ListItemSecondaryAction>
                </ListItem>
                {index === store.get("history").length - 1 ? (
                  <></>
                ) : (
                  <Divider variant="inset" component="li" />
                )}
              </div>
            ))}
          </List>
        </Fade >
      ) : (
        <></>
      )}
    </>
  );
}

function toHHMMSS(s) {
  var date = new Date(0);
  date.setSeconds(parseInt(s)); // specify value for SECONDS here
  return date.toISOString().substr(11, 8);
}
