import React, { useEffect } from "react";
import { searchIMDB, getIMDBInfo } from "../utils/utils";
import { IMDBSearchResponse } from "../utils/interfaces";
import nprogress from "nprogress";
import "nprogress/nprogress.css";
import { useParams } from "react-router-dom";

type Params = {
  id: string;
};

export default function AddPage() {
  const [, setResult] = React.useState([] as Array<IMDBSearchResponse>);
  const [details, setDetails] = React.useState({} as any);
  const { id } = useParams() as Params;
  const [show] = React.useState(window.data[Number(id)]);

  console.log(id);

  useEffect(() => {
    return () => {};
  }, []);

  return (
    <div
      style={{
        margin: "100px auto 0px auto",
        width: "70%",
        height: "calc(100vh - 100px)",
      }}
    >
      <div>🆔 ID: {show.id}</div>
      <div>
        name: <input type="text" value={show.name} />
      </div>
      <div>
        banner: <input type="text" value={show.banner} />
      </div>
      <div>
        rating: <input type="text" value={show.rating} />
      </div>
      <div>
        desc: <input type="text" value={show.desc} />
      </div>
      <div>
        keywords: <input type="text" value={show.keywords} />
      </div>
      <div>
        poster: <input type="text" value={show.poster} />
      </div>
      <div>
        episodes:{" "}
        {show.episodes.map((e) => (
          <pre>{JSON.stringify(e)}</pre>
        ))}
      </div>
      <div>
        type: <input type="text" value={show.type} />
      </div>
      <div>
        imdb: <input type="text" value={show.imdb} />
      </div>
      <div>
        trailer: <input type="text" value={show.trailer} />
      </div>
    </div>
  );
}
