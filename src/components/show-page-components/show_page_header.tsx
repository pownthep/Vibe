import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core";
import { API_DOMAIN, getAnilistInfo, getImage } from "../../utils/api";
import parse from "html-react-parser";
import Skeleton from "@material-ui/lab/Skeleton";

type Props = {
  showTitle: string;
  poster: string;
  banner: string;
  imdb?: string;
  type?: string;
};

const useStyles = makeStyles((theme) => ({
  root: {
    height: "60vh",
    position: "relative",
    width: "100%",
  },
  banner: {
    width: "100%",
    height: "300px",
    objectFit: "cover",
  },
  content: {
    width: "100%",
    height: "inherit",
  },
  poster: {
    width: "100%",
    height: 340,
    boxShadow: theme.shadows[2],
    objectFit: "cover",
    borderRadius: 4,
    marginTop: -115,
  },
  info: {
    display: "grid",
    gridTemplateColumns: "220px auto",
    height: 300,
    paddingLeft: 60,
    paddingRight: 50,
  },
  metadata: {
    paddingLeft: 30,
    overflow: "auto",
  },
  showTitle: {
    margin: 0,
  },
  desc: {
    marginBottom: 0,
    position: "absolute",
    bottom: 0,
    maxWidth: "70%",
    maxHeight: 155,
    overflow: "auto",
    // display: "flex",
    // justifyContent: "flex-start",
    // alignItems: "flex-end",
  },
  headers: {
    width: "calc(100% - 110px)",
    background: "var(--scrollbarBG)",
    fontWeight: "bold",
    marginLeft: 60,
    marginRight: 50,
    borderRadius: 50,
  },
  columns: {
    display: "grid",
    gridTemplateColumns: "160px 2fr repeat(3, 1fr)",
  },
  centered: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 10,
  },
  end: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  start: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingLeft: 30,
    paddingRight: 30,
  },
}));

export default function ShowPageHeader({
  showTitle,
  poster,
  banner,
  type,
}: Props) {
  const [imdb, setIMDB] = useState<any | null>(null);
  const [anilist, setAnilist] = useState<any | null>(null);
  const [mounted, setMounted] = useState(true);

  const classes = useStyles();

  useEffect(() => {
    const setup = async () => {
      if (type) {
        const search = await fetch(
          `${API_DOMAIN}/search?text=${showTitle.replace("Season", "")}`
        );
        const result = await search.json();
        if (!result || result.length === 0) return;
        const res = await fetch(
          `${API_DOMAIN}/imdb?url=https://www.imdb.com${result[0].link}`
        );
        const data = await res.json();
        if (mounted) setIMDB(data);
      } else {
        const info = await getAnilistInfo(showTitle);
        setAnilist(info.data.Page.media[0]);
      }
    };
    setup();
    return () => {
      setMounted(false);
    };
  }, [mounted, showTitle, type]);

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div style={{ height: 300 }}>
          {!type ? (
            <>
              {anilist ? (
                <img
                  src={anilist && getImage(anilist.bannerImage)}
                  alt="banner"
                  className={classes.banner}
                />
              ) : (
                <Skeleton variant="rect" width="100%" height={300} />
              )}
            </>
          ) : (
            <img
              src={getImage(banner)}
              alt="banner"
              className={classes.banner}
            />
          )}
        </div>
        <div className={classes.info}>
          <img src={getImage(poster)} alt="poster" className={classes.poster} />
          <div className={classes.metadata}>
            <h1 className={classes.showTitle}>{showTitle}</h1>
            {imdb && imdb.genre && (
              <div
                className="animated animatedFadeInUp fadeInUp"
                style={{ position: "relative", height: 185 }}
              >
                <p style={{ margin: 0 }}>
                  <span role="img" aria-label="stars">
                    ⭐{imdb.rating} | {imdb.genre.map((i: string) => `${i} | `)}
                  </span>
                </p>
                <p className={classes.desc}>
                  {imdb.desc[0]}
                  {imdb.desc
                    .slice(1)
                    .filter(
                      (i: string) =>
                        !i.includes("See full") && !i.includes("more credit")
                    )
                    .map((i: string, index: number) =>
                      index % 2 === 0 ? (
                        <strong key={i}>
                          <br />
                          {i + " "}
                        </strong>
                      ) : (
                        i
                      )
                    )}
                </p>
              </div>
            )}
            {anilist && (
              <div
                className="animated animatedFadeInUp fadeInUp"
                style={{ position: "relative", height: 185 }}
              >
                <p style={{ margin: 0 }}>
                  <span role="img" aria-label="stars">
                    ⭐{anilist.averageScore / 10}
                    {" | "}
                    {anilist.genres.map((i: string) => `${i} | `)}{" "}
                    {anilist.status}
                  </span>
                </p>
                <div className={classes.desc}>{parse(anilist.description)}</div>
              </div>
            )}
            {!anilist && !imdb && (
              <div>
                <Skeleton variant="rect" height={17} width={400} />
                <br />
                <Skeleton variant="rect" height={151} width="70%" />
              </div>
            )}
          </div>
        </div>
        <div className={classes.headers}>
          <div className={classes.columns}>
            {/* <p className={classes.start}>#</p> */}
            <p className={classes.start}> Thumbnail</p>
            <p className={classes.start}>Name</p>
            <p className={classes.centered}>Show</p>
            <p className={classes.centered}>Size</p>
            <p className={classes.centered}> Action</p>
          </div>
        </div>
      </div>
    </div>
  );
}
