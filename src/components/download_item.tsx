import React, { memo } from "react";
import { getImg, DL_FOLDER_PATH, openPath } from "../utils/utils";
import LinearProgressWithLabel from "./linear_progress_with_label";

type Props = {
  name: string;
  id: string;
  progress?: number;
};

function DownloadItem({ name, id, progress }: Props) {
  return (
    <div>
      <div
        className="animated animatedFadeInUp fadeInUp"
        style={{
          display: "grid",
          gridTemplateColumns: "160px 70%",
          width: "100%",
          height: "95px",
          paddingBottom: 5,
        }}
      >
        <img
          src={getImg(id)}
          alt="thumbnail"
          style={{
            width: "160px",
            height: "90px",
            cursor: "pointer",
            borderRadius: 4,
          }}
          onClick={() => openPath(`${DL_FOLDER_PATH}/${name}`)}
        />
        <div
          style={{
            paddingLeft: 5,
            position: "relative",
          }}
        >
          {name}
        </div>
      </div>
      {progress && progress > 10 && (
        <div>
          <LinearProgressWithLabel progress={progress} />
        </div>
      )}
    </div>
  );
}

export default memo(DownloadItem);
