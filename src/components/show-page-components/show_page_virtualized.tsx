import React, { memo } from "react";
import { VariableSizeList as List } from "react-window";
import ShowPageHeader from "./show_page_header";
import AutoSizer from "react-virtualized-auto-sizer";
import { useRecoilValue } from "recoil";
import ShowPageEpisode from "./show_page_episode";
import { playerState } from "../player-ui-components/player_bar";
import { vh } from "../../utils/utils";
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
  const barVisible = useRecoilValue(playerState);

  const getItemSize = (index: number) => {
    if (index === 0) return vh(50);
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
          />
        </div>
      );
    } else {
      return (
        <div style={style} className="padding-left-50">
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
        paddingBottom: barVisible ? 90 : 0,
        height: "calc(100vh - 25px)",
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
