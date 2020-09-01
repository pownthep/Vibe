import React, { useState } from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import ListboxComponent from "./listbox";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { useHistory } from "react-router-dom";
import Poster from "./poster";
import nprogress from "nprogress";
import "nprogress/nprogress.css";

export default function Home() {
  const [anime] = useState(window.data);
  const item = {
    width: 185,
    height: 265,
    rowHeight: 310,
    viewMode: 1,
  };
  let itemsPerRow = 1;
  const [value] = React.useState(null);

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
            paddingRight: 20,
            paddingLeft: 5,
          }}
        >
          {anime.slice(start, end).map(({ id, name, poster }) => (
              <Poster image={poster} name={name} key={id} onClick={handleClick} id={id}/>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {anime ? (
        <div
          style={{
            width: "100%",
            height: "calc(100vh - 65px)",
            marginTop: "65px",
            padding: 0,
          }}
        >
          <Autocomplete
            id="virtualize-demo"
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 50,
              marginBottom: 5,
              backgroundColor: "#212121",
            }}
            size="small"
            disableListWrap
            ListboxComponent={ListboxComponent as any}
            value={value}
            onChange={(e, v) => {
              if (v) history.replace("/watch/" + v.id);
            }}
            options={anime}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <div ref={params.InputProps.ref}>
                <input
                  placeholder="Search titles..."
                  style={{
                    width: "100vw",
                    height: "50px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    backgroundColor: "#212121",
                    paddingLeft: 30,
                    border: "none",
                    borderBottom: "2px solid #757575",
                    color: "white",
                  }}
                  type="text"
                  {...params.inputProps}
                />
              </div>
            )}
            renderOption={(option, { inputValue }) => {
              const matches = match(option.name, inputValue);
              const parts = parse(option.name, matches);
              return (
                <div style={{ marginLeft: 20 }}>
                  {parts.map((part, index) => (
                    <span
                      key={index}
                      style={{
                        fontWeight: part.highlight ? 700 : 400,
                        color: part.highlight ? "#11cb5f" : "inherit",
                        textDecoration: part.highlight ? "underline" : "none",
                      }}
                    >
                      {part.text}
                    </span>
                  ))}
                </div>
              );
            }}
          />
          <AutoSizer>
            {({ height, width }) => {
              itemsPerRow = Math.floor(width / item.width);
              var rowCount = Math.ceil(anime.length / itemsPerRow);
              return (
                <List
                  className="List"
                  height={height - 55}
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
