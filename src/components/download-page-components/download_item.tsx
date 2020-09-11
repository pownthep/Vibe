import React, { memo } from "react";
import { openPath } from "../../utils/utils";
import LinearProgressWithLabel from "../common-components/linear_progress_with_label";
import { getThumbnail, DL_FOLDER_PATH } from "../../utils/api";

type Props = {
  name: string;
  id: string;
  progress?: number;
  path?: string;
};

function DownloadItem({ name, id, progress, path }: Props) {
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
          src={getThumbnail(id)}
          alt="thumbnail"
          style={{
            width: "160px",
            height: "90px",
            cursor: "pointer",
            borderRadius: 4,
          }}
          onClick={() => {
            if (path) openPath(`${DL_FOLDER_PATH}/${path}`);
          }}
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
      {progress && progress > 0 && (
        <div>
          <LinearProgressWithLabel progress={progress} />
        </div>
      )}
    </div>
  );
}

export default memo(DownloadItem);
