import React, { useState, useEffect } from "react";
import MediaCard from "./mediacard";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import ListboxComponent from "./listbox";
import ViewListIcon from "@material-ui/icons/ViewList";
import ViewModuleIcon from "@material-ui/icons/ViewModule";
import ViewComfyIcon from "@material-ui/icons/ViewComfy";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { useHistory } from "react-router-dom";
import Poster from "./poster";
import RowList from "./row";
import Avatar from "@material-ui/core/Avatar";

export default function Home() {
  const [anime, setAnime] = useState([]);
  const [value, setValue] = useState(null);
  const [item, setItem] = useState({
    width: 185,
    height: 265,
    rowHeight: 310,
    viewMode: 1,
  });
  let itemsPerRow = 1;

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
            justifyContent: "center",
            alignItems: "center",
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

  useEffect(() => {
    if (value) {
      const result = anime.filter((item) => item.id === value.id);
      setAnime(result);
    } else {
      setAnime(window.data);
    }
    return () => {};
  }, [value]);

  return (
    <>
      <div
        style={{
          margin: "0 auto",
          width: "100%",
          textAlign: "center",
        }}
      >
        <Autocomplete
          id="virtualize-demo"
          style={{
            width: "80%",
            margin: "0 auto",
            marginBottom: 0,
            marginTop: 20,
          }}
          disableListWrap
          ListboxComponent={ListboxComponent}
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
          options={anime}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField {...params} size="small" label="Search" />
          )}
          renderOption={(option, { inputValue }) => {
            const matches = match(option.name, inputValue);
            const parts = parse(option.name, matches);
            return (
              <div>
                {parts.map((part, index) => (
                  <span
                    key={index}
                    style={{
                      fontWeight: part.highlight ? 700 : 400,
                      color: part.highlight ? "#11cb5f" : "inherit",
                    }}
                  >
                    {part.text}
                  </span>
                ))}
              </div>
            );
          }}
        />
        <Tooltip title="List view">
          <IconButton
            aria-label="view list"
            color={item.viewMode === 2 ? "primary" : "default"}
            onClick={() =>
              setItem({
                width: 0,
                height: 150,
                rowHeight: 150,
                viewMode: 2,
              })
            }
          >
            <ViewListIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Grid view">
          <IconButton
            aria-label="view comfy"
            color={item.viewMode === 1 ? "primary" : "default"}
            onClick={() =>
              setItem({
                width: 185,
                height: 265,
                rowHeight: 310,
                viewMode: 1,
              })
            }
          >
            <ViewComfyIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Large view">
          <IconButton
            aria-label="view module"
            color={item.viewMode === 0 ? "primary" : "default"}
            onClick={() =>
              setItem({
                width: 480,
                height: 270,
                rowHeight: 355,
                viewMode: 0,
              })
            }
          >
            <ViewModuleIcon />
          </IconButton>
        </Tooltip>
      </div>
      {anime ? (
        <div style={{ width: "100%", height: "85vh", borderRadius: 4 }}>
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
      ) : (
        <></>
      )}
    </>
  );
}
