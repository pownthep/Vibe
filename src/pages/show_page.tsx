import React, { useEffect, useState } from "react";
import Container from "../components/common-components/container";
import { handleError } from "../utils/utils";
import { Show } from "../utils/interfaces";
import { useSetRecoilState } from "recoil";
import { playerState } from "../components/player-ui-components/player_bar";
import nProgress from "nprogress";
import { getShow } from "../utils/api";
import ShowPageVirtualized from "../components/show-page-components/show_page_virtualized";

type Props = {
  showId: number;
  episodeId?: string;
  timePos?: number;
  episodeTitle?: string;
  episodeSize?: string;
};

export default function ShowPage({
  showId,
  episodeId,
  timePos,
  episodeTitle,
  episodeSize,
}: Props) {
  const setPlayerState = useSetRecoilState(playerState);
  const [mounted, setMounted] = useState(true);
  const [show, setShow] = useState<Show | null>(null);

  const replay = (
    showTitle: string,
    episodeTitle: string,
    episodeId: string,
    timePos: number,
    fullscreen: boolean,
    episodeSize: number
  ) => {
    setPlayerState({
      showTitle: showTitle,
      episodeId: episodeId,
      episodeTitle: episodeTitle,
      timePos: timePos,
      fullscreen: fullscreen,
      episodeSize: episodeSize,
    } as any);
  };

  useEffect(() => {
    const setup = async () => {
      try {
        nProgress.start();
        const data = await getShow(showId);
        if (mounted) setShow(data);
        if (episodeId && timePos && episodeTitle && data) {
          setPlayerState({
            showTitle: data.name,
            episodeId: episodeId,
            episodeTitle: episodeTitle,
            timePos: timePos,
            fullscreen: false,
            episodeSize: episodeSize,
          } as any);
        }
        nProgress.done();
      } catch (error) {
        handleError(error);
      }
    };
    setup();
    return () => {
      setMounted(false);
    };
  }, [
    mounted,
    episodeId,
    timePos,
    episodeTitle,
    showId,
    setPlayerState,
    episodeSize,
  ]);

  return (
    <Container>
      {show && <ShowPageVirtualized show={show} episodeOnClick={replay} />}
    </Container>
  );
}
