import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import ClearAllIcon from "@material-ui/icons/ClearAll";
import Tooltip from "@material-ui/core/Tooltip";
import { Link } from "react-router-dom";
import Grow from "@material-ui/core/Grow";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import LinearProgress from "@material-ui/core/LinearProgress";
import { HistoryItem } from "../utils/interfaces";
import { getImg, toHHMMSS, toDate } from "../utils/utils";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "80vh",
  },
  thumbnailCtn: {
    marginRight: 5,
    position: "relative",
    width: "100%",
    height: "inherit",
    padding: 5,
  },
  thumbnail: {
    marginRight: 5,
    width: "100%",
    height: "inherit",
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
    paddingTop: 5,
  },
  bgIcon: {
    fontSize: "4rem",
  },
}));

export default function History() {
  const classes = useStyles();
  const [history, setHistory] = useState([] as Array<HistoryItem>);
  const clearHistory = (e: any) : void => {
    if (history.length > 0) {
      localStorage.removeItem("history");
      setHistory([] as Array<HistoryItem>);
    }
  };

  const getHistory = () : void => {
    let localHistory: { [index: string]: HistoryItem } = {};
    const historyString = localStorage.getItem("history");
    if (historyString) localHistory = JSON.parse(historyString);
    const historyArray = Object.values(localHistory).sort((a, b) =>
      a.currentTime < b.currentTime ? 1 : -1
    );
    setHistory(historyArray);
  };

  useEffect(() => {
    getHistory();
  }, []);

  const Row = ({ index, style }: any) : JSX.Element => {
    var rowItem = history[index];
    return (
      <div style={style}>
        {rowItem ? (
          <Grow in={true} timeout={600} key={"listitem-" + rowItem.id}>
            <div className={classes.listItemContainer}>
              <div className={classes.thumbnailCtn}>
                <img
                  alt={rowItem.title}
                  className={classes.thumbnail}
                  src={getImg(rowItem.id)}
                  style={{ borderRadius: "5px" }}
                />
                <div className={classes.playBtn}>
                  <Tooltip title="Continue watching" placement="right-start">
                    <Link to={`/watch/${rowItem.index}/${rowItem.id}`}>
                      <IconButton edge="end" aria-label="comments">
                        <PlayCircleOutlineIcon
                          classes={{ root: classes.bgIcon }}
                        />
                      </IconButton>
                    </Link>
                  </Tooltip>
                </div>
                <LinearProgress
                  variant="determinate"
                  value={
                    rowItem.duration
                      ? (rowItem.timePos / rowItem.duration) * 100
                      : 0
                  }
                />
              </div>
              <div className={classes.historyInfo}>
                <h2 style={{ margin: 0 }}>
                  {rowItem.title +
                    " - " +
                    ` Episode: ${rowItem.ep} - ${toHHMMSS(rowItem.timePos)}`}
                </h2>
                {toDate(rowItem.currentTime)}
              </div>
            </div>
          </Grow>
        ) : (
          <></>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 65px)",
        marginTop: "65px",
        padding: 5,
        overflow: "auto",
      }}
    >
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
