import React from "react";
import { render } from "react-dom";
import App from "./App";
import nprogress from "nprogress";
import "nprogress/nprogress.css";
import "./index.css";
import "./css/animation.css";
import "./css/nprogress.css";
import "./css/seekbar.css";
import "./css/utils.css";
import { Show } from "./utils/interfaces";
import { handleError } from "./utils/utils";
import { BrowserRouter as Router } from "react-router-dom";
import { RecoilRoot } from "recoil";
import ResponsiveDrawer from "./App";
import { getCatalogue } from "./utils/api";

declare global {
  interface Window {
    data: Array<Show>;
    electron: boolean;
    openExternal: any;
    openPath: any;
    access: any;
    remote: any;
    directory: string;
    imdb: any;
    readFile: any;
    writeFile: any;
    os: any;
  }
  interface HTMLVideoElement {
    audioTracks: any;
  }
}

(async () => {
  try {
    nprogress.configure({ easing: "ease", speed: 700 });
    nprogress.start();
    if (localStorage["data"]) {
      window.data = JSON.parse(localStorage["data"]);
      nprogress.done();
      render(
        <Router>
          <RecoilRoot>
            <ResponsiveDrawer />
          </RecoilRoot>
        </Router>,
        document.getElementById("root")
      );
      const json = await getCatalogue();
      window.data = json;
      localStorage["data"] = JSON.stringify(json);
    } else {
      const json = await getCatalogue();
      window.data = json;
      localStorage["data"] = JSON.stringify(json);
      nprogress.done();
      render(
        <Router>
          <RecoilRoot>
            <App />
          </RecoilRoot>
        </Router>,
        document.getElementById("root")
      );
    }
  } catch (error) {
    handleError(error);
  }
})();
