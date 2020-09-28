import React, { useState, useEffect, memo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import PlayArrowRoundedIcon from "@material-ui/icons/PlayArrowRounded";
import ClearAllIcon from "@material-ui/icons/ClearAll";
import Tooltip from "@material-ui/core/Tooltip";
import { Link } from "react-router-dom";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import LinearProgress from "@material-ui/core/LinearProgress";
import { HistoryItem } from "../utils/interfaces";
import { toHHMMSS } from "../utils/utils";
import { Typography } from "@material-ui/core";
import { useSetRecoilState } from "recoil";
import { navState } from "../App";
import { getImage } from "../utils/api";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "calc(100vh - 81px)",
    background: theme.palette.background.paper,
    padding: 10,
    borderRadius: 4,
  },
  container: {
    width: "calc(100vw - 190px)",
    height: "calc(100vh - 136px)",
    marginTop: "25px",
    background: "var(--thumbBG)",
    borderRadius: 8,
  },
  thumbnailCtn: {
    position: "relative",
    width: "100%",
    height: "inherit",
  },
  thumbnail: {
    width: "100%",
    height: "inherit",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  playBtn: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: " translate(-50%, -50%)",
  },
  listItemContainer: {
    height: 162,
    display: "grid",
    gridTemplateColumns: "300px auto",
  },
  historyInfo: {
    width: "100%",
    height: 162,
    paddingLeft: 10,
  },
  bgIcon: {
    fontSize: "4rem",
    color: "white",
  },
  progress: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  timer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    background: "rgba(0,0,0,0.8)",
    padding: 3,
    borderRadius: 4,
    color: "white",
  },
}));

export default function History() {
  const classes = useStyles();
  const [history, setHistory] = useState([] as Array<HistoryItem>);
  const clearHistory = (): void => {
    if (history.length > 0) {
      localStorage.removeItem("history");
      setHistory([] as Array<HistoryItem>);
    }
  };

  const getHistory = (): void => {
    let localHistory: { [index: string]: HistoryItem } = {};
    const historyString = localStorage.getItem("history");
    if (historyString) localHistory = JSON.parse(historyString);
    const historyArray = Object.values(localHistory).sort((a, b) =>
      a.currentTime < b.currentTime ? 1 : -1
    );
    setHistory(historyArray);
  };
  const setNavState = useSetRecoilState(navState);

  useEffect(() => {
    setNavState("History");
    getHistory();
  }, [setNavState]);

  const Row = memo(
    ({ index, style }: any): JSX.Element => {
      var rowItem = history[index];
      return (
        <div style={style} className="animated animatedFadeInUp fadeInUp">
          {rowItem ? (
            <div
              className={classes.listItemContainer}
              key={"listitem-" + rowItem.id}
            >
              <div className={classes.thumbnailCtn}>
                <img
                  alt={rowItem.title}
                  className={classes.thumbnail}
                  src={getImage(rowItem.id)}
                />
                <div className={classes.playBtn}>
                  <Tooltip title="Continue watching" placement="right-start">
                    <Link to={`/watch/${rowItem.index}/${rowItem.id}`}>
                      <IconButton edge="end" aria-label="comments">
                        <PlayArrowRoundedIcon
                          classes={{ root: classes.bgIcon }}
                        />
                      </IconButton>
                    </Link>
                  </Tooltip>
                </div>
                <div className={classes.progress}>
                  <LinearProgress
                    variant="determinate"
                    value={
                      rowItem.duration
                        ? (rowItem.timePos / rowItem.duration) * 100
                        : 0
                    }
                  />
                </div>
                <div className={classes.timer}>
                  {toHHMMSS(rowItem.timePos).replace("00:", "")}
                </div>
              </div>
              <div className={classes.historyInfo}>
                <Typography
                  display="block"
                  gutterBottom
                  variant="subtitle1"
                  noWrap={true}
                >
                  {rowItem.ep}
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  gutterBottom
                  noWrap={true}
                >
                  {rowItem.title}
                </Typography>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      );
    }
  );

  return (
    <div className={classes.container}>
      <Tooltip title="Clear history" placement="right-start">
        <IconButton
          edge="end"
          aria-label="clear history"
          onClick={clearHistory}
        >
          <ClearAllIcon />
        </IconButton>
      </Tooltip>
      {history.length > 0 ? (
        <div className={classes.root}>
          <AutoSizer>
            {({ height, width }) => {
              return (
                <List
                  className="List"
                  height={height}
                  itemCount={history.length}
                  itemSize={190}
                  width={width}
                >
                  {Row}
                </List>
              );
            }}
          </AutoSizer>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
