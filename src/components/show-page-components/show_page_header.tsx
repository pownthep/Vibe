import React, { useEffect, useState } from "react";
import { makeStyles, Divider } from "@material-ui/core";
import { API_DOMAIN, getImage } from "../../utils/api";

type Props = {
  showTitle: string;
  poster: string;
  banner: string;
  imdb?: string;
};

const useStyles = makeStyles((theme) => ({
  root: {
    height: "50vh",
    position: "relative",
    width: "100%",
  },
  overlay: {
    background: `linear-gradient(to top, ${theme.palette.background.paper}, rgba(0,0,0,0)),
      linear-gradient(40deg, ${theme.palette.background.paper}, rgba(0,0,0,0))
    `,
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 2,
    width: "100%",
    height: "inherit",
  },
  banner: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 1,
    width: "100%",
    height: "inherit",
    objectFit: "cover",
  },
  content: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 3,
    width: "100%",
    height: "inherit",
  },
  poster: {
    width: "100%",
    borderRadius: 8,
    boxShadow: theme.shadows[3],
  },
  info: {
    position: "absolute",
    bottom: "20%",
    left: 110,
    display: "grid",
    gridTemplateColumns: "1fr 6fr",
  },
  metadata: {
    paddingLeft: 30,
  },
  showTitle: {
    margin: 0,
  },
  desc: {
    maxWidth: 700,
  },
  headers: {
    paddingLeft: 50,
    marginBottom: 5,
    position: "absolute",
    bottom: 0,
    zIndex: 3,
    width: "100%",
  },
  columns: {
    display: "grid",
    gridTemplateColumns: "60px 160px 2fr repeat(3, 1fr)",
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
    overflow: "hidden",
  },
}));

export default function ShowPageHeader({ showTitle, poster, banner }: Props) {
  const [data, setData] = useState<any | null>(null);
  const [mounted, setMounted] = useState(true);

  const classes = useStyles();

  useEffect(() => {
    const setup = async () => {
      const search = await fetch(
        `${API_DOMAIN}/search?text=${showTitle.replace("Season", "")}`
      );
      const result = await search.json();
      if (!result || result.length === 0) return;
      const res = await fetch(
        `${API_DOMAIN}/imdb?url=https://www.imdb.com${result[0].link}`
      );
      const data = await res.json();
      if (mounted) setData(data);
    };
    setup();
    return () => {
      setMounted(false);
    };
  }, [mounted, showTitle]);

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.info}>
          <img src={getImage(poster)} alt="poster" className={classes.poster} />
          <div className={classes.metadata}>
            <h1 className={classes.showTitle}>{showTitle}</h1>
            {data && data.genre && (
              <div className="animated animatedFadeInUp fadeInUp">
                <p>
                  <span role="img" aria-label="stars">
                    ⭐{data.rating}
                  </span>
                </p>
                <p>{data.genre.map((i: string) => `${i} | `)}</p>
                <p className={classes.desc}>{data.desc[0]}</p>
                <p>
                  {data.desc
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
          </div>
        </div>
      </div>
      <img src={getImage(banner)} alt="banner" className={classes.banner} />
      <div className={classes.overlay}></div>
      <div className={classes.headers}>
        <div className={classes.columns}>
          <p className={classes.start}>#</p>
          <p></p>
          <p className={classes.start}>Name</p>
          <p className={classes.centered}>Show</p>
          <p className={classes.centered}>Size</p>
          <p></p>
        </div>
        <Divider style={{ marginRight: 50 }} />
      </div>
    </div>
  );
}
