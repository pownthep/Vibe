import React, { memo } from "react";
import { Grow, IconButton, Divider } from "@material-ui/core";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import GetAppRoundedIcon from "@material-ui/icons/GetAppRounded";
import prettyBytes from "pretty-bytes";
import { getImg } from "../utils/utils";
import { Episode } from "../utils/interfaces";
import nprogress from "nprogress";

type EpisodeListProps = {
  list: Array<Episode>;
  setId:  any;
  name: string;
  handleDownload?: any
};

export default memo(({ list, setId, name, handleDownload }: EpisodeListProps) => {
  const Row = ({ index, style }: any) => (
    <div style={style}>
      <Grow in={true} timeout={500 + (50 * index%5)}>
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "40% 60%",
              paddingTop: 0,
              height: 130,
            }}
          >
            <img
              onClick={() => {
                setId(list[index].id, list[index].name);
                nprogress.start();
              }}
              src={getImg(list[index].id)}
              alt="thumbnail"
              style={{
                width: "100%",
                height: "inherit",
                objectFit: "cover",
                cursor: "pointer",
              }}
            />
            <div style={{ position: "relative", paddingLeft: 5 }}>
                  <p
                    style={{
                      marginBottom: 4,
                      marginTop: 4,
                      fontSize: 15,
                      fontWeight: "bold",
                      height: 70,
                      overflow: "auto"
                    }}
                  >
                    {list[index].name.replace(".mkv", "")}
                  </p>
              <p
                style={{
                  marginTop: 0,
                  marginBottom: 0,
                  fontSize: 14,
                }}
              >
                {name}
              </p>
              <p style={{ marginTop: 4, fontSize: 12, color: "#eeeeee" }}>
                {prettyBytes(Number(list[index].size))}
              </p>
              <div style={{ position: "absolute", right: 10, bottom: 0 }}>
                <IconButton
                  aria-label="more"
                  aria-controls="long-menu"
                  aria-haspopup="true"
                  onClick={() => handleDownload(list[index].id)}
                >
                  <GetAppRoundedIcon />
                </IconButton>
              </div>
            </div>
          </div>
          <Divider />
        </div>
      </Grow>
    </div>
  );
  return (
    <AutoSizer>
      {({ height, width }) => {
        return (
          <List
            className="List"
            height={height - 66}
            itemCount={list.length}
            itemSize={130}
            width={width}
          >
            {Row}
          </List>
        );
      }}
    </AutoSizer>
  );
});
