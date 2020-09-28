import React, { useState, useEffect } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { useHistory } from "react-router-dom";
import Poster from "../components/common-components/poster";
import nprogress from "nprogress";
import "nprogress/nprogress.css";
import { useSetRecoilState } from "recoil";
import { navState } from "../App";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  container: {
    width: "calc(100vw - 190px)",
    height: "calc(100vh - 136px)",
    marginTop: "25px",
    background: "var(--thumbBG)",
    borderRadius: 8,
    padding: 15,
  },
}));

export default function Home() {
  const setNavState = useSetRecoilState(navState);
  const [showPlayer] = useState(false);
  const [shows] = useState(window.data);
  const classes = useStyles();
  let itemsPerRow = 10;
  let itemWidth = 150;
  let itemHeight = 200;

  const history = useHistory();

  useEffect(() => {
    setNavState("Home");
  }, [setNavState]);

  const handleClick = (id: number): void => {
    nprogress.start();
    setNavState("");
    history.push("/watch/" + id);
  };

  const Row = ({ index, style }: any) => {
    var start = index * itemsPerRow;
    var end = start + itemsPerRow;
    return (
      <div style={style}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {shows.slice(start, end).map(({ id, name, poster }) => (
            <Poster
              width={itemWidth}
              height={itemHeight}
              image={poster}
              name={name}
              key={id}
              onClick={handleClick}
              id={id}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {shows && !showPlayer ? (
        <div className={classes.container}>
          <AutoSizer>
            {({ height, width }) => {
              itemWidth = (width - 200) / itemsPerRow;
              itemHeight = itemWidth * 1.5;
              var rowCount = Math.ceil(shows.length / itemsPerRow);
              return (
                <List
                  className="List"
                  height={height}
                  itemCount={rowCount}
                  itemSize={itemHeight + 35}
                  width={width}
                >
                  {Row}
                </List>
              );
            }}
          </AutoSizer>
        </div>
      ) : null}
    </>
  );
}
