import React, { memo } from "react";
import { VariableSizeList as List } from "react-window";
import ShowPageHeader from "./show_page_header";
import AutoSizer from "react-virtualized-auto-sizer";
import ShowPageEpisode from "./show_page_episode";
import { Show } from "../../utils/interfaces";

type Props = {
  show: Show;
  episodeOnClick: (
    showTitle: string,
    episodeTitle: string,
    episodeId: string,
    timePos: number,
    fullscreen: boolean,
    episodeSize: number
  ) => void;
};

function ShowPageVirtualized({ show, episodeOnClick }: Props) {
  const getItemSize = (index: number) => {
    if (index === 0) return 665;
    else return 100;
  };

  const Row = ({ index, style }: any) => {
    if (index === 0) {
      return (
        <div style={style}>
          <ShowPageHeader
            showTitle={show.name}
            poster={show.poster}
            banner={show.banner}
            imdb={show.imdb}
            type={show.type}
          />
        </div>
      );
    } else {
      return (
        <div style={style}>
          <ShowPageEpisode
            index={index}
            episode={show.episodes[index - 1]}
            showTitle={show.name}
            onClick={episodeOnClick}
          />
        </div>
      );
    }
  };
  return (
    <div
      style={{
        height: "inherit",
        width: "100%",
      }}
    >
      <AutoSizer>
        {({ height, width }: any) => {
          return (
            <List
              height={height}
              itemCount={show.episodes.length + 1}
              itemSize={getItemSize}
              width={width}
            >
              {Row}
            </List>
          );
        }}
      </AutoSizer>
    </div>
  );
}

export default memo(ShowPageVirtualized);
