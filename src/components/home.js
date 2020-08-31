import React, { useState } from "react";
import MediaCard from "./mediacard";
import Autocomplete from "@material-ui/lab/Autocomplete";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import ListboxComponent from "./listbox";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { useHistory } from "react-router-dom";
import Poster from "./poster";
import RowList from "./row";

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

  function handleClick(e) {
    history.push("/watch/" + e.currentTarget.id);
  }

  function viewGenerator(props) {
    if (item.viewMode === 0)
      return <MediaCard image={props.banner} name={props.name} />;
    else if (item.viewMode === 1)
      return <Poster image={props.poster} name={props.name} />;
    else return <RowList {...props} />;
  }

  const Row = ({ index, style }) => {
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
          {anime.slice(start, end).map((el) => (
            <a
              onClick={handleClick}
              key={el.id}
              id={el.id}
              style={{
                width:
                  item.viewMode === 2
                    ? "100%"
                    : item.viewMode === 0
                    ? "33%"
                    : "auto",
              }}
            >
              {viewGenerator(el)}
            </a>
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
            ListboxComponent={ListboxComponent}
            value={value}
            onChange={(e, v) => {
              history.replace("/watch/" + v.id);
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
                <div style={{marginLeft:20}}>
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
              if (item.viewMode === 0) itemsPerRow = 3;
              else if (item.viewMode === 1)
                itemsPerRow = Math.floor(width / item.width);
              else if (item.viewMode === 2) itemsPerRow = 1;
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
