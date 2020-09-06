import React, { useState, useEffect } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { useHistory } from "react-router-dom";
import Poster from "./poster";
import nprogress from "nprogress";
import "nprogress/nprogress.css";
import { useSetRecoilState } from "recoil";
import { navState } from "../App";

export default function Home() {
  const setNavState = useSetRecoilState(navState);
  const [shows] = useState(window.data);
  const item = {
    width: 185,
    height: 265,
    rowHeight: 310,
    viewMode: 1,
  };
  let itemsPerRow = 1;

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
            paddingRight: 5,
            paddingLeft: 5,
          }}
        >
          {shows.slice(start, end).map(({ id, name, poster }) => (
            <Poster
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
      {shows ? (
        <div
          style={{
            width: "100%",
            height: "100vh",
            paddingTop: 20,
          }}
        >
          <AutoSizer>
            {({ height, width }) => {
              itemsPerRow = Math.floor(width / item.width);
              var rowCount = Math.ceil(shows.length / itemsPerRow);
              return (
                <List
                  className="List"
                  height={height}
                  itemCount={rowCount}
                  itemSize={item.rowHeight}
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
