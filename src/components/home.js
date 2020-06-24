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

export default function Home() {
  const [anime, setAnime] = useState([]);
  const [value, setValue] = useState(null);
  const [mounted, setMounted] = useState(true);
  var containerWidth = 480;
  var itemPerRow = 1;

  const Row = ({ index, style }) => {
    var start = index * itemPerRow;
    var end = start + itemPerRow;
    return (
      <div className={index % 2 ? "ListItemOdd" : "ListItemEven"} style={style}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {anime.slice(start, end).map((el) => (
            <MediaCard
              image={el.banner}
              title={el.name}
              description={el.desc}
              rating={el.rating}
              path={el.id}
              key={el.name}
              keywords={el.keywords}
              timeout={800}
              poster={el.poster}
            />
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (value) {
      const result = anime.filter((item) => item.id === value.id);
      if (mounted) setAnime(result);
    } else {
      if (mounted) setAnime(window.data);
    }
    return () => {
      setMounted(false);
    };
  }, [value]);

  return (
    <>
      <Autocomplete
        id="virtualize-demo"
        style={{
          width: 480,
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
          <TextField
            {...params}
            size="small"
            label="Search"
          />
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
      <div
        style={{
          margin: "0 auto",
          width: "100%",
          textAlign: "center",
        }}
      >
        <Tooltip title="List view">
          <IconButton aria-label="delete">
            <ViewListIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Grid view">
          <IconButton aria-label="delete">
            <ViewComfyIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Large view">
          <IconButton aria-label="delete">
            <ViewModuleIcon />
          </IconButton>
        </Tooltip>
      </div>
      {anime ? (
        <div style={{ width: "100%", height: "80vh", borderRadius: 4 }}>
          <AutoSizer>
            {({ height, width }) => {
              containerWidth = width;
              itemPerRow = Math.floor(containerWidth / 480);
              var rowCount = Math.ceil(anime.length / itemPerRow);
              return (
                <List
                  className="List"
                  height={height}
                  itemCount={rowCount}
                  itemSize={275}
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
