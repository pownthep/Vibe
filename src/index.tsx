import React from "react";
import { render } from "react-dom";
import App from "./App";
import nprogress from "nprogress";
import "nprogress/nprogress.css";
import "./index.css";
import { Show } from "./utils/interfaces";
import { getCatalogue, handleError } from "./utils/utils";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from "recoil";

declare global {
  interface Window {
    data: Array<Show>;
    electron: boolean;
    shell: any;
    access: any;
    remote: any;
    directory: string;
    imdb: any
  }
  interface HTMLVideoElement {
    audioTracks: any;
  }
}

(async () => {
  try {
    nprogress.start();
    if (localStorage["data"]) {
      window.data = JSON.parse(localStorage["data"]);
      nprogress.done();
      render(
        <Router>
          <RecoilRoot>
            <App />
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
