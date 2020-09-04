import React, { memo } from "react";
import { Grow, IconButton, Divider, Typography } from "@material-ui/core";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import GetAppRoundedIcon from "@material-ui/icons/GetAppRounded";
import prettyBytes from "pretty-bytes";
import { getImg } from "../utils/utils";
import { Episode } from "../utils/interfaces";
import nprogress from "nprogress";

type EpisodeListProps = {
  list: Array<Episode>;
  setId: any;
  name: string;
  handleDownload?: any;
};

export default memo(
  ({ list, setId, name, handleDownload }: EpisodeListProps) => {
    var itemsPerRow = 0;
    var item = {
      width: 300,
      height: 260,
    };
    var margin = 5;
    const Row = ({ index, style }: any) => {
      var start = index * itemsPerRow;
      var end = start + itemsPerRow;
      return (
        <div style={style}>
          <div
            style={{
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
            }}
          >
            {list.slice(start, end).map(({ id, name, size }, i) => (
              <div
                style={{
                  width: item.width,
                  height: item.height,
                  marginRight: i < end ? margin : 0,
                }}
                key={id}
              >
                <div
                  style={{
                    cursor: "pointer",
                    height: 169,
                    width: item.width,
                  }}
                  onClick={() => setId(id, name)}
                >
                  <img
                    src={getImg(id)}
                    alt="thumbnail"
                    style={{
                      height: 169,
                      width: item.width,
                      borderRadius: 2,
                    }}
                  />
                </div>
                <div style={{ height: 72 }}>
                  <Typography display="block" gutterBottom noWrap={true}>
                    {name}
                  </Typography>
                  <p style={{ margin: 0 }}>
                    {prettyBytes(Number(size))}
                    <IconButton
                      aria-label="download btn"
                      onClick={() => handleDownload(id)}
                    >
                      <GetAppRoundedIcon />
                    </IconButton>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
    return (
      <AutoSizer>
        {({ height, width }) => {
          itemsPerRow = Math.floor(width / item.width);
          var rowCount = Math.ceil(list.length / itemsPerRow);
          margin = (width - itemsPerRow * item.width) / itemsPerRow;
          return (
            <List
              className="List"
              height={height}
              itemCount={rowCount}
              itemSize={item.height}
              width={width}
            >
              {Row}
            </List>
          );
        }}
      </AutoSizer>
    );
  }
);
