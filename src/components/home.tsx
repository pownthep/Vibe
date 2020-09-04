import React, { useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { useHistory } from "react-router-dom";
import Poster from "./poster";
import nprogress from "nprogress";
import "nprogress/nprogress.css";
import AutoComplete from "./autocomplete";

export default function Home() {
  const [shows, setShows] = useState(window.data);
  const item = {
    width: 185,
    height: 265,
    rowHeight: 310,
    viewMode: 1,
  };
  let itemsPerRow = 1;
  const [] = React.useState(null);

  const history = useHistory();

  const handleClick = (id: number): void => {
    nprogress.start();
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

  const filterList = (text: string) => {
    if (!text || text.length === 0) {
      setShows(window.data);
      nprogress.done();
      return;
    }
    const filteredList = window.data.filter((s) =>
      JSON.stringify(s).toLowerCase().includes(text)
    );
    setShows(filteredList);
    nprogress.done();
  };

  return (
    <>
      {shows ? (
        <div style={{
          width: "100%",
          height: "calc(100vh - 65px)",
          marginTop: "65px",
          padding: 0,
        }}>
          <AutoComplete list={shows} filterList={filterList} />
          <div
            style={{
              width: "100%",
              height: "calc(90vh - 65px)",
              padding: 0,
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
        </div>
      ) : null}
    </>
  );
}
