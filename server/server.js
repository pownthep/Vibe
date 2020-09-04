const fs = require("fs");
const googleAuth = require("google-auth-library");
const express = require("express");
const https = require("https");
const app = express();
const cors = require("cors");
const axios = require("axios");
const prettyBytes = require("pretty-bytes");
const store = require("data-store")({ path: __dirname + "/store.json" });
const download = require("image-downloader");
const stringHash = require("string-hash");
const bodyParser = require("body-parser");
const HTMLParser = require("node-html-parser");

// Express setup
app.use(cors());
app.use(express.static("img"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// If modifying these scopes, delete your previously saved credentials
const SCOPES = ["https://www.googleapis.com/auth/drive"];
const TOKEN_DIR = __dirname + "/.credentials/";
const TOKEN_PATH = TOKEN_DIR + "googleDriveAPI.json";
const TEMP_DIR = __dirname + "/.temp/";
const CHUNK_SIZE = 10000000;
const PORT = 80;
const IMG_DIR = __dirname + "/img/";
const placeholderImg = IMG_DIR + "placeholder.png";
const DL_DIR = __dirname + "/downloaded/";
const credentials = {
  web: {
    client_id:
      "511377925028-ar09unh2rtfs8h0vh2u08p8nn4i9plqm.apps.googleusercontent.com",
    project_id: "elevated-summer-538",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_secret: "QlADgLswq3Syw3e44OwNS4oa",
    redirect_uris: ["http://127.0.0.1/code"],
    javascript_origins: ["http://127.0.0.1"],
  },
};
let authStatus;

// Check for img dir or create one
fs.access(IMG_DIR, fs.constants.F_OK, (err) => {
  if (err)
    fs.mkdir(IMG_DIR, (err) => {
      if (err) console.error(err);
    });
});

fs.access(DL_DIR, fs.constants.F_OK, (err) => {
  if (err)
    fs.mkdir(DL_DIR, (err) => {
      if (err) console.error(err);
    });
});

authorize(credentials, startLocalServer);

function authorize(credentials, callback) {
  var clientSecret = credentials.web.client_secret;
  var clientId = credentials.web.client_id;
  var redirectUrl = credentials.web.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
      authStatus = {
        authenticated: false,
        url: oauth2Client.generateAuthUrl({
          access_type: "offline",
          scope: SCOPES,
        }),
      };
    } else {
      oauth2Client.credentials = JSON.parse(token);
      refreshTokenIfNeed(oauth2Client, callback);
      authStatus = { authenticated: true };
    }
  });
}

function getNewToken(oauth2Client, callback) {
  callback(oauth2Client);
}

function refreshTokenIfNeed(oauth2Client, callback) {
  var timeNow = new Date().getTime();
  if (oauth2Client.credentials.expiry_date > timeNow) callback(oauth2Client);
  else refreshToken(oauth2Client, callback);
}

function refreshToken(oauth2Client, callback) {
  oauth2Client.refreshAccessToken(function (err, token) {
    if (err) {
      console.log("Error while trying to refresh access token", err);
      return;
    }
    oauth2Client.credentials = token;
    storeToken(token);
    callback(oauth2Client);
  });
}

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != "EEXIST") {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
  });
}

function startLocalServer(oauth2Client) {
  app.get("/imdb", async (req, res) => {
    try {
      if (store.get(req.query.url)) {
        res.json(store.get(req.query.url));
        return;
      }
      const data = await getIMBD(req.query.url);
      store.set(req.query.url, data);
      res.json(data);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  });

  app.get("/search", async (req, res) => {
    const response = await axios.get(
      `https://www.imdb.com/find?q=${req.query.text}`
    );
    const html = await response.data;
    const DOM = HTMLParser.parse(html);
    const findSection = DOM.querySelectorAll(".findResult").map((d) => ({
      img: d.querySelector(".primary_photo")
        ? d
            .querySelector(".primary_photo")
            .querySelector("img")
            .getAttribute("src")
        : "",
      link: d
        .querySelector(".result_text")
        .querySelector("a")
        .getAttribute("href"),
      title: d.querySelector(".result_text").text,
    }));
    res.json(findSection);
  });

  app.get("/authenticate", (req, res) => {
    fs.readFile(TOKEN_PATH, function (err) {
      if (err) {
        res.json({
          authenticated: false,
          url: oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: SCOPES,
          }),
        });
      } else {
        res.json({ authenticated: true });
      }
    });
  });

  app.get("/img", async (req, res) => {
    let fileID = stringHash(req.query.url);
    fs.access(IMG_DIR + fileID, fs.F_OK, (err) => {
      if (err) {
        const options = {
          url: req.query.url,
          dest: IMG_DIR + fileID,
          extractFilename: false,
        };
        download
          .image(options)
          .then(({ filename }) => {
            res.sendFile(filename);
          })
          .catch(() => {
            res.sendFile(placeholderImg);
          });
        return;
      } else res.sendFile(IMG_DIR + fileID);
    });
  });

  app.get("/cachesize", (req, res) => {
    fs.readdir(TEMP_DIR, (err, files) => {
      let bytes = files ? files.length * 20 * 1000000 : 0;
      res.json({ size: prettyBytes(bytes) });
    });
  });

  app.get("/dash", async () => {
    try {
    } catch (error) {
      console.log(error);
    }
  });

  app.get("/clearcache", (req, res) => {
    fs.rmdir(TEMP_DIR, { recursive: true }, (err) => {
      if (err) {
        console.error(err);
        res.json({ error: true });
        return;
      }
      res.json({ error: false });
    });
  });

  app.get("/quota", (req, res) => {
    refreshTokenIfNeed(oauth2Client, async (oauth2Client) => {
      var access_token = oauth2Client.credentials.access_token;
      var auth = "Bearer ".concat(access_token);
      var url = "https://www.googleapis.com/drive/v2/about";
      try {
        const about = await axios.get(url, {
          headers: { Authorization: auth, Accept: "application/json" },
        });
        res.json({
          ...about.data,
          usedNumber: Number(about.data.quotaBytesUsed),
          totalNumber: Number(about.data.quotaBytesTotal),
          usedString: prettyBytes(Number(about.data.quotaBytesUsed)),
          totalString: prettyBytes(Number(about.data.quotaBytesTotal)),
        });
      } catch (error) {
        console.log(error);
        res.send({ error: true, message: error });
      }
    });
  });

  app.get("/drive", (req, res) => {
    refreshTokenIfNeed(oauth2Client, (oauth2Client) => {
      var access_token = oauth2Client.credentials.access_token;
      var options = {
        host: "www.googleapis.com",
        path: `/drive/v3/files?&fields=nextPageToken,files(name,id,size,ownedByMe,mimeType)&pageSize=1000&orderBy=quotaBytesUsed%20desc`,
        method: "GET",
        headers: {
          Authorization: "Bearer " + access_token,
          Accept: "application/json",
        },
      };

      callback = function (response) {
        var allData = "";
        response.on("data", function (chunk) {
          allData += chunk;
        });
        response.on("end", function () {
          var info = JSON.parse(allData);
          if (!info.error) {
            var files = info.files.filter(
              (file) =>
                file.size > 0 &&
                file.ownedByMe &&
                file.mimeType.includes("video")
            );
            store.set("files", files);
            isLatest = true;
            res.json(files);
          } else console.log(info.error);
        });
      };

      https.request(options, callback).end();
    });
  });

  app.get("/delete/:id", (req, res) => {
    refreshTokenIfNeed(oauth2Client, (oauth2Client) => {
      var access_token = oauth2Client.credentials.access_token;
      var fileId = req.params.id;
      httpDeleteFile(fileId, access_token, res);
    });
  });

  function checkFile(fileId, token) {
    return new Promise(async (resolve, reject) => {
      try {
        var headers = {
          headers: {
            Authorization: "Bearer " + token,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        };
        var searchUrl = `https://www.googleapis.com/drive/v3/files?q=name%20contains%20%22${fileId}%22&fields=files(name%2Cid%2CmimeType%2Csize)`;
        const searchRes = await axios.get(searchUrl, headers);
        resolve(searchRes.data.files);
      } catch (error) {
        reject(error);
      }
    });
  }

  app.get("/add_to_download_queue", (req, res) => {
    refreshTokenIfNeed(oauth2Client, async (oauth2Client) => {
      let file = null;
      try {
        const files = await checkFile(
          req.query.id,
          oauth2Client.credentials.access_token
        );
        console.log(files);
        if (files.length === 1) {
          console.log("file exist in drive");
          file = files[0];
        } else {
          console.log("copying file to drive");
          const newFile = await httpCopyFile(
            req.query.id,
            oauth2Client.credentials.access_token,
            `${req.query.id}.mp4`
          );
          file = newFile;
        }
        if (file) {
          store.set("downloads." + req.query.id, {
            id: file.id,
            name: file.name,
            size: file.size,
            progress: 0,
          });
          if (!downloaderRunning) fileDownloader();
          res.json(file);
        }
      } catch (error) {
        console.log(error);
        res.json({ error: JSON.stringify(error) });
      }
    });
  });

  let downloaderRunning = false;
  async function fileDownloader() {
    if (!store.get("downloads")) {
      console.log("Downloading");
      downloaderRunning = false;
      return;
    }
    let toDownloadList = Object.entries(store.get("downloads")).filter(
      ([, value]) => value.progress === 0
    );
    if (toDownloadList.length === 0) {
      downloaderRunning = false;
      return;
    }
    downloaderRunning = true;
    let firstItemKey = toDownloadList[0][0];
    let firstItemValue = toDownloadList[0][1];
    refreshTokenIfNeed(oauth2Client, async (oauth2Client) => {
      var access_token = oauth2Client.credentials.access_token;
      try {
        var auth = "Bearer ".concat(access_token);
        var folder = __dirname + "/downloaded";
        var dest = fs.createWriteStream(folder + `/${firstItemValue.name}`);
        var options = {
          host: "www.googleapis.com",
          path: "/drive/v3/files/" + firstItemValue.id + "?alt=media",
          method: "GET",
          headers: {
            Authorization: auth,
          },
        };
        callback = function (response) {
          var progress = 0;
          const interval = setInterval(() => {
            store.set(`downloads.${firstItemKey}.progress`, progress);
          }, 1000);
          response.on("data", function (chunk) {
            progress += chunk.length;
          });
          response.on("end", function () {
            store.set(`downloads.${firstItemKey}.progress`, progress);
            clearInterval(interval);
            fileDownloader();
          });
          response.pipe(dest);
        };
        var req = https.request(options, callback).end();
      } catch (error) {
        console.log(error);
      }
    });
  }

  app.get("/download/:index", (req, res) => {
    var errorList = [];
    fs.readFile(
      "../public/data/shows/" + req.params.index + ".json",
      async (err, data) => {
        if (err) res.status(500).json(err);
        else {
          const json = JSON.parse(data);
          const episodes = json.episodes.filter((e) => e.size);
          for (ep of episodes) {
            try {
              console.log(`Downloading: `, ep.name);
              await downloadVideo(ep.id);
              console.log("Done: ", ep.name);
            } catch (error) {
              errorList.push(ep);
              console.log(error);
            }
          }
          console.log("Errors: ", errorList);
          res.json(errorList);
        }
      }
    );
  });

  app.get("/downloaded", (req, res) => {
    fs.readdir(__dirname + "/downloaded", (err, files) => {
      if (err) res.json([]);
      else res.json(files);
    });
  });

  app.get("/downloading", (req, res) => {
    fileDownloader();
    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",

      // enabling CORS
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
    });
    if (store.get("downloads"))
      res.write(`data: ${JSON.stringify(store.get("downloads"))}\n\n`);
    else res.write(`data: ${JSON.stringify({})}\n\n`);
    setInterval(() => {
      if (store.get("downloads"))
        res.write(`data: ${JSON.stringify(store.get("downloads"))}\n\n`);
    }, 1000);
  });

  app.get("/code", function (req, res) {
    if (req.query.code) {
      oauth2Client.getToken(req.query.code, function (err, token) {
        if (err) {
          console.log("Error while trying to retrieve access token", err);
          return;
        }
        if (!token.refresh_token) {
          console.log("No refresh token found.");
          return;
        }
        oauth2Client.credentials = token;
        storeToken(token);
      });
      res.send("Successfully authenticated!");
      authStatus = { authenticated: true };
    }
  });

  app.get("/stream", (req, res) => {
    refreshTokenIfNeed(oauth2Client, async (oauth2Client) => {
      var access_token = oauth2Client.credentials.access_token;
      var fileId = req.query.id;
      try {
        const files = await checkFile(fileId, access_token);
        if (files.length === 1) {
          console.log("file exist in drive");
          var fileInfo = files[0];
          performRequest_default(req, res, access_token, fileInfo);
        } else {
          console.log("copying file to drive");
          const copiedFile = await httpCopyFile(
            fileId,
            access_token,
            `${req.query.id}.mp4`
          ).catch((error) => {
            console.log(error);
            throw error;
          });
          performRequest_default(req, res, access_token, copiedFile);
        }
      } catch (error) {
        res.status(500).json(error);
        console.log(error);
      }
    });
  });

  app.get("/stream2", (req, res) => {
    const range = req.headers.range;
    downloadVideo(req.query.id, res, req, range, req.query.size);
  });

  function downloadVideo(id, res, req, range, fileSize) {
    console.log(id, range, fileSize);
    refreshTokenIfNeed(oauth2Client, async (oauth2Client) => {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(206, head);
      var access_token = oauth2Client.credentials.access_token;
      try {
        var auth = "Bearer ".concat(access_token);
        const response = await axios({
          url: `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
          method: "GET",
          responseType: "stream",
          headers: {
            Authorization: auth,
          },
        });
        response.data.pipe(res);
        var progress = 0;
        var interval = setInterval(() => {
          console.log(prettyBytes(progress));
        }, 1000);
        response.data.on("data", (data) => {
          progress += data.length;
        });
        response.data.on("end", function () {
          console.log("data", "end");
          if (!req.aborted) {
            res.end();
          }
          clearInterval(interval);
        });
        res.once("close", function () {
          console.log("closed");
          clearInterval(interval);
          if (typeof response.abort === "function") response.abort();
          if (typeof response.destroy === "function") response.destroy();
        });
      } catch (error) {
        console.log(error);
      }
    });
  }

  app.get("/video/:id", (req, res) => {
    refreshTokenIfNeed(oauth2Client, async (oauth2Client) => {
      var access_token = oauth2Client.credentials.access_token;
      var fileId = req.params.id;
      try {
        const files = await checkFile(fileId, access_token);
        if (files.length === 1) {
          console.log("file exist in drive");
          var fileInfo = files[0];
          performRequest_default(req, res, access_token, fileInfo);
        } else {
          console.log("copying file to drive");
          const copiedFile = await httpCopyFile(
            fileId,
            access_token,
            `[${req.params.id}]-${req.params.serieName}-${req.params.episodeName}`
          );
          performRequest_default(req, res, access_token, copiedFile);
        }
      } catch (error) {
        res.status(500);
      }
    });
  });

  app.listen(PORT);
  console.log("Server started at port: " + PORT);
}

function performRequest_default(req, res, access_token, fileInfo) {
  var fileSize = fileInfo.size;
  var fileId = fileInfo.id;
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      //'Content-Type': 'video/mp4',
      "Content-Type": "video/mp4",
    };
    //console.log(chunksize);
    res.writeHead(206, head);
    downloadFile(
      fileId,
      access_token,
      start,
      end,
      res,
      () => {
        res.end();
      },
      (richiesta) => {
        res.once("close", function () {
          if (typeof richiesta.abort === "function") richiesta.abort();
          if (typeof richiesta.destroy === "function") richiesta.destroy();
        });
      }
    );
  } else {
    console.log("No requested range");
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    downloadFile(
      fileId,
      access_token,
      0,
      fileSize - 1,
      res,
      () => {
        res.end();
      },
      (richiesta) => {
        res.once("close", function () {
          if (typeof richiesta.abort === "function") richiesta.abort();
          if (typeof richiesta.destroy === "function") richiesta.destroy();
        });
      }
    );
  }
}

function downloadFile(fileId, access_token, start, end, pipe, onEnd, onStart) {
  var startChunk = Math.floor(start / CHUNK_SIZE);
  var chunkName = TEMP_DIR + fileId + "@" + startChunk;
  if (fs.existsSync(chunkName)) {
    console.log("req: " + start + " / " + end + "   offline");
    var relativeStart =
      start > startChunk * CHUNK_SIZE ? start - startChunk * CHUNK_SIZE : 0;
    var relativeEnd =
      end > (startChunk + 1) * CHUNK_SIZE
        ? CHUNK_SIZE
        : end - startChunk * CHUNK_SIZE;
    let readStream = fs.createReadStream(chunkName, {
      start: relativeStart,
      end: relativeEnd,
    });
    readStream.pipe(pipe, { end: false });
    readStream.on("data", () => {
      //onData(chunk)
    });
    readStream.on("end", () => {
      if (end >= (startChunk + 1) * CHUNK_SIZE) {
        //Da rivedere
        console.log("->");
        downloadFile(
          fileId,
          access_token,
          (startChunk + 1) * CHUNK_SIZE,
          end,
          pipe,
          onEnd,
          onStart
        );
      } else {
        onEnd();
      }
    });
    readStream.on("close", () => {});
    readStream.on("error", (err) => {
      console.log(err);
    });
    onStart(readStream);
  } else {
    console.log("req: " + start + " / " + end + "   online");
    httpDownloadFile(fileId, access_token, start, end, pipe, onEnd, onStart);
  }
}

function httpDownloadFile(
  fileId,
  access_token,
  start,
  end,
  pipe,
  onEnd,
  onStart
) {
  var options = {
    host: "www.googleapis.com",
    path: "/drive/v3/files/" + fileId + "?alt=media",
    method: "GET",
    headers: {
      Authorization: "Bearer " + access_token,
      Range: "bytes=" + start + "-" + end,
    },
  };

  callback = function (response) {
    var arrBuffer = [];
    var arrBufferSize = 0;
    response.pipe(pipe, { end: false });
    response.on("data", function (chunk) {
      var buffer = Buffer.from(chunk);
      arrBuffer.push(buffer);
      arrBufferSize += buffer.length;
      var nextChunk = Math.floor((start + arrBufferSize) / CHUNK_SIZE);
      var chunkName = TEMP_DIR + fileId + "@" + nextChunk;
      if (fs.existsSync(chunkName) && start + arrBufferSize < end) {
        req.abort();
        downloadFile(
          fileId,
          access_token,
          start + arrBufferSize,
          end,
          pipe,
          onEnd,
          onStart
        );
      } else {
        if (arrBufferSize >= CHUNK_SIZE * 2) {
          arrBuffer = [Buffer.concat(arrBuffer, arrBufferSize)];
          arrBuffer = flushBuffers(arrBuffer, fileId, start);
          arrBufferSize = arrBuffer[0].length;
          var offset = Math.ceil(start / CHUNK_SIZE) * CHUNK_SIZE - start;
          start += CHUNK_SIZE + offset;
        }
      }
    });
    response.on("end", function () {
      //Aggiungere il controllo se c'è un errore
      if (!req.aborted) {
        onEnd();
      }
    });
  };

  var req = https.request(options, callback);
  req.on("error", function () {});
  req.end();
  onStart(req);
}

function httpCopyFile(fileId, access_token, fileName) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      name: fileName,
    });
    var options = {
      host: "www.googleapis.com",
      path: "/drive/v3/files/" + fileId + "/copy?fields=name,id,mimeType,size",
      method: "POST",
      headers: {
        Authorization: "Bearer " + access_token,
        Accept: "application/json",
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };
    var req = https.request(options, async (res) => {
      var body = "";
      res.on("data", function (chunk) {
        body += chunk;
      });
      res.on("end", function () {
        let json = JSON.parse(body);
        isLatest = false;
        resolve(json);
      });
    });
    req.on("error", function (err) {
      console.log(error);
      reject(err);
    });
    req.write(data);
    req.end();
  });
}

function httpDeleteFile(fileId, access_token, response) {
  var options = {
    host: "www.googleapis.com",
    path: "/drive/v3/files/" + fileId,
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + access_token,
      Accept: "application/json",
    },
  };
  var req = https.request(options, async (res) => {
    var body = "";
    res.on("data", function (chunk) {
      body += chunk;
    });
    res.on("end", function () {
      if (body.length === 0) {
        var pairId = store.get(`drive.${fileId}`);
        store.del(`drive.${pairId}`);
        store.del(`drive.${fileId}`);
        response.json({ deleted: true });
        isLatest = false;
      } else response.json({ deleted: false });
    });
  });
  req.on("error", function () {
    response.json({ deleted: false });
  });
  req.end();
}

function flushBuffers(arrBuffer, fileId, startByte) {
  var dirtyBuffer = Buffer.alloc(CHUNK_SIZE);
  var offset = Math.ceil(startByte / CHUNK_SIZE) * CHUNK_SIZE - startByte;
  arrBuffer[0].copy(dirtyBuffer, 0, offset, offset + CHUNK_SIZE);
  var chunkName =
    TEMP_DIR + fileId + "@" + Math.floor((offset + startByte) / CHUNK_SIZE);
  try {
    fs.mkdirSync(TEMP_DIR);
  } catch (err) {
    if (err.code != "EEXIST") {
      throw err;
    }
  }
  fs.writeFile(chunkName, dirtyBuffer, (err) => {
    if (err) throw err;
    console.log("The chunk has been saved!");
  });
  var remainBufferSize = arrBuffer[0].length - CHUNK_SIZE - offset;
  var remainBuffer = Buffer.alloc(remainBufferSize);
  if (remainBuffer.length > 0) {
    arrBuffer[0].copy(
      remainBuffer,
      0,
      CHUNK_SIZE + offset,
      arrBuffer[0].length
    );
  }
  return [remainBuffer];
}

const getIMBD = (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await axios.get(url);
      const html = await res.data;
      const DOM = HTMLParser.parse(html);
      const rating = DOM.querySelector(".ratingValue").querySelector("strong")
        .rawText;
      const genre = DOM.querySelector(".title_wrapper")
        .querySelector(".subtext")
        .text.split("|")
        .map((i) => i.trim().replace(/\n/gm, ""));
      const desc = DOM.querySelector(".plot_summary")
        .text.split("\n")
        .map((i) => i.replace("|", "").trim())
        .filter((i) => i.length > 0);

      resolve({
        rating: Number(rating),
        genre: genre,
        desc: desc,
      });
    } catch (error) {
      reject(error);
    }
  });
};
