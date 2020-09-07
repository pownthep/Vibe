import React, { memo } from "react";
import { IconButton, Typography } from "@material-ui/core";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import GetAppRoundedIcon from "@material-ui/icons/GetAppRounded";
import prettyBytes from "pretty-bytes";
import { getImg } from "../utils/utils";
import { Episode } from "../utils/interfaces";

type EpisodeListProps = {
  list: Array<Episode>;
  setId: any;
  name: string;
  handleDownload?: any;
};

export default memo(
  ({ list, setId, name, handleDownload }: EpisodeListProps) => {
    const Row = ({ index, style }: any) => {
      return (
        <div style={style}>
          <div
            className="box animated animatedFadeInUp fadeInUp"
            style={{
              display: "grid",
              gridTemplateColumns: "40% 60%",
            }}
          >
            <img
              src={getImg(list[index].id)}
              alt="thumbnail"
              style={{
                cursor: "pointer",
                objectFit: "cover",
                width: "95%",
                height: 100,
                borderRadius: 4,
              }}
              onClick={() => setId(list[index].id, list[index].name)}
            />
            <div style={{ position: "relative" }}>
              <Typography
                display="block"
                gutterBottom
                variant="subtitle2"
                noWrap={true}
              >
                {list[index].name}
              </Typography>
              <Typography
                variant="caption"
                display="block"
                gutterBottom
                noWrap={true}
              >
                {name}
              </Typography>
              <Typography
                variant="caption"
                display="block"
                gutterBottom
                noWrap={true}
              >
                {prettyBytes(Number(list[index].size))}
              </Typography>
              <IconButton
                aria-label="Download button"
                onClick={() => {
                  handleDownload(list[index].id);
                }}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                }}
              >
                <GetAppRoundedIcon />
              </IconButton>
            </div>
          </div>
        </div>
      );
    };
    return (
      <AutoSizer>
        {({ height, width }) => {
          return (
            <List
              className="List"
              height={height - 55}
              itemCount={list.length}
              itemSize={120}
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
