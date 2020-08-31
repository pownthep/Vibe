import * as fs from "tauri/api/fs";
import stringHash from "string-hash";

const SHOWS_PATH = "https://vibe-three.vercel.app/data/shows/";

export const authenticate = async () => {
  const res = await fetch(window.API + "authenticate");
  const data = await res.json();
  return data;
};

export const toDataURL = async (url) => {
  let fileID = stringHash(url);
  // if (!localStorage.getItem(fileID)) {
  //   return await fs.readTextFile(fileID + "");
  // } else {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    var reader = new FileReader();
    reader.onloadend = async function () {
      //localStorage.setItem(fileID, 1);
      // var file = {
      //   path: fileID + "",
      //   contents: reader.result,
      // };
      // fs.writeFile(file, { dir: fs.Dir.Download });
      //console.log(reader.result);
      return reader.result;
    };
    reader.readAsDataURL(xhr.response);
  };
  xhr.open("GET", url);
  xhr.responseType = "blob";
  xhr.send();
  //}
  
};

export const getShow = async (id) => {
  const res = await fetch(SHOWS_PATH + id + ".json");
  const data = await res.json();
  const filtered = {
    ...data,
    episodes: data.episodes.filter((i) => i.size > 0),
  };
  return filtered;
};

export const getURL = (id) => {
  return `http://localhost/stream?id=${id}`;
};

export const getImg = (id) => {
  return `http://localhost/img/?url=https://lh3.googleusercontent.com/u/0/d/${id}`;
};

export const getLink = (url) => {
  return `http://localhost/img/?url=${url}`;
};

export const toHHMMSS = (s) => {
  var date = new Date(0);
  date.setSeconds(s);
  return date.toISOString().substr(11, 8);
};

export const preview = (id) => {
  return `https://pownthep-storage.b-cdn.net/previews/${id}.png`;
};


export const stream = (id) => {
  return `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=AIzaSyAv1WgLGclLIlhKvzIiIVOiqZqDA0EM9TI`;
}