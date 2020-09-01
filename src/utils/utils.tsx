import { Show, Episode, DriveInfo, Quota } from "./interfaces";

export const DOMAIN = "http://localhost";
export const DL_API = `${DOMAIN}/downloading`;
export const ADD_TO_DL_API = `${DOMAIN}/add_to_download_queue?id=`;
export const CACHE_SIZE_API = `${DOMAIN}/cachesize`;
export const CLEAR_CACHE_API = `${DOMAIN}/clearcache`;
export const JSON_URL =
  "https://vibe-three.vercel.app/data/trimmed-desktop.json";

export const SHOWS_PATH = "https://vibe-three.vercel.app/data/shows/";
export const DL_FOLDER_PATH = `${window.directory}/server/downloaded`;

export const deleteFile = async (id: String) => {
  const res = await fetch(`http://localhost/delete/${id}`);
  return await res.json();
};
export const getQuota = async (): Promise<Quota> => {
  try {
    const res = await fetch("http://localhost/quota");
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const getDrive = async (): Promise<Array<DriveInfo>> => {
  try {
    const res = await fetch("http://localhost/drive");
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const getCatalogue = async (): Promise<Array<Show>> => {
  try {
    const res = await fetch(JSON_URL);
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const fmtName = (s: String): string => {
  return s
    .replace(/\[(.+?)\]/g, "")
    .replace(/\((.+?)\)/g, "")
    .replace("Copy of ", "")
    .replace("-", " ")
    .replace(".mkv", "")
    .trim();
};

export const openFolder = (path: String): void => {
  window.shell.openPath(path);
};

export const openPath = (path: String): void => {
  window.shell.openPath(path);
};

export const getShow = async (id: String): Promise<Show> => {
  try {
    const res = await fetch(SHOWS_PATH + id + ".json");
    const data = await res.json();
    const filtered = {
      ...data,
      episodes: data.episodes.filter((i: Episode) => i.size > 0),
    };
    return filtered;
  } catch (error) {
    throw error;
  }
};

export const getCacheSize = async (): Promise<{ size: string }> => {
  try {
    const res = await fetch(CACHE_SIZE_API);
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const deleteCache = async (): Promise<{ error: boolean }> => {
  try {
    const res = await fetch(CLEAR_CACHE_API);
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const getURL = (id: String): string => {
  return `http://localhost/stream?id=${id}`;
};

export const getImg = (id: String): string => {
  return `http://localhost/img/?url=https://lh3.googleusercontent.com/u/0/d/${id}`;
};

export const getLink = (url: String): string => {
  return `http://localhost/img/?url=${url}`;
};

export const toHHMMSS = (s: number): string => {
  var date = new Date(0);
  date.setSeconds(s);
  return date.toISOString().substr(11, 8);
};

export const preview = (id: String): string => {
  return `https://pownthep-storage.b-cdn.net/previews/${id}.png`;
};

export const stream = (id: String): string => {
  return `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=AIzaSyAv1WgLGclLIlhKvzIiIVOiqZqDA0EM9TI`;
};

export const getPath = (id: String): string => {
  return `${__dirname}/server/download/${id}`;
};

/* View in fullscreen */
export const openFullscreen = (): void => {
  var elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  }
};

/* Close fullscreen */
export const closeFullscreen = (): void => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  }
};

export const toDate = (s: number): string => {
  var t = new Date(s);
  return t.toLocaleString();
};

export const downloadFile = async (id: string): Promise<any> => {
  try {
    const res = await fetch(`${ADD_TO_DL_API + id}`);
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const handleError = (error: any) => {
  console.error(error);
};
