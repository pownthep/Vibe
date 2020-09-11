const fs = require("fs");
const googleAuth = require("google-auth-library");
const express = require("express");
const https = require("https");
const app = express();
const cors = require("cors");
const axios = require("axios");
const prettyBytes = require("pretty-bytes");
const store = require("data-store")({ path: __dirname + "/local_store.json" });
const download = require("image-downloader");
const stringHash = require("string-hash");
const bodyParser = require("body-parser");
const HTMLParser = require("node-html-parser");
const { getIMBD, moveFile } = require("./utils");

// Express setup
app.use(cors());
app.use(express.static("img"));
app.use(express.static("downloaded"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// If modifying these scopes, delete your previously saved credentials
const SCOPES = ["https://www.googleapis.com/auth/drive"];
const TOKEN_DIR = __dirname + "/.credentials/";
const TOKEN_PATH = TOKEN_DIR + "googleDriveAPI.json";
const TEMP_DIR = __dirname + "/.temp/";
const CHUNK_SIZE = 10000000;
const PORT = 8080;
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
    redirect_uris: ["http://127.0.0.1:8080/code"],
    javascript_origins: ["http://127.0.0.1:8080"],
  },
};

let authStatus;
let downloaderRunning = false;
let DOWNLOAD_MANAGER = [];

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
    if (store.get(`search.${req.query.text}`)) {
      res.json(store.get(`search.${req.query.text}`));
      return;
    }
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
    store.set(`search.${req.query.text}`, findSection);
    res.json(findSection);
  });

  app.get("/authenticate", (req, res) => {
    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",

      // enabling CORS
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
    });
    let interval = setInterval(() => {
      fs.readFile(TOKEN_PATH, function (err) {
        if (err) {
          const json = {
            authenticated: false,
            url: oauth2Client.generateAuthUrl({
              access_type: "offline",
              scope: SCOPES,
            }),
          };
          res.write(`data: ${JSON.stringify(json)}\n\n`);
        } else {
          const json = { authenticated: true };
          res.write(`data: ${JSON.stringify(json)}\n\n`);
          clearInterval(interval);
        }
      });
    }, 1000);
    req.on("close", () => {
      clearInterval(interval);
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

  app.get("/cache/size", (req, res) => {
    fs.readdir(TEMP_DIR, (err, files) => {
      let bytes = files ? files.length * 20 * 1000000 : 0;
      res.json({ size: prettyBytes(bytes) });
    });
  });

  app.get("/cache/clear", (req, res) => {
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

  app.get("/token", (req, res) => {
    refreshTokenIfNeed(oauth2Client, async (oauth2Client) => {
      res.json(oauth2Client.credentials.access_token);
    });
  });

  app.get("/download/add", (req, res) => {
    DOWNLOAD_MANAGER.push({
      name: req.query.name,
      progress: 0,
      id: req.query.id,
      size: req.query.size,
    });
    if (!downloaderRunning) fileDownloader();
    res.status(200).json({});
  });

  app.get("/download/files", (req, res) => {
    fs.readdir(__dirname + "/downloaded", (err, files) => {
      if (err) res.json([]);
      else
        res.json(
          files
            .map(function (fileName) {
              return {
                name: fileName,
                time: fs
                  .statSync(__dirname + "/downloaded" + "/" + fileName)
                  .mtime.getTime(),
              };
            })
            .sort(function (a, b) {
              return a.time - b.time;
            })
            .map(function (v) {
              return v.name;
            })
            .reverse()
        );
    });
  });

  app.get("/download/progress", (req, res) => {
    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
    });

    let interval = setInterval(() => {
      if (DOWNLOAD_MANAGER)
        res.write(`data: ${JSON.stringify(DOWNLOAD_MANAGER)}\n\n`);
    }, 1000);
    req.on("close", () => {
      clearInterval(interval);
    });
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

  app.get("/file/check", (req, res) => {
    fs.access(
      `${__dirname}/downloaded/${req.query.name}`,
      fs.constants.F_OK,
      (err) => {
        if (err) res.json({ exist: false });
        else res.json({ exist: true });
      }
    );
  });

  app.get("/stream", (req, res) => {
    refreshTokenIfNeed(oauth2Client, async (oauth2Client) => {
      var access_token = oauth2Client.credentials.access_token;
      var fileId = req.query.id;
      var fileSize = req.query.size;
      performRequest_default(req, res, access_token, {
        id: fileId,
        size: fileSize,
      });
    });
  });

  app.listen(PORT);
  console.log("Server started at port: " + PORT);

  async function fileDownloader() {
    if (DOWNLOAD_MANAGER.length === 0) {
      downloaderRunning = false;
      return;
    }
    downloaderRunning = true;
    refreshTokenIfNeed(oauth2Client, async (oauth2Client) => {
      const access_token = oauth2Client.credentials.access_token;
      try {
        const auth = "Bearer ".concat(access_token);
        const currentPath =
          __dirname +
          "/downloading" +
          `/${DOWNLOAD_MANAGER[0].id}@${DOWNLOAD_MANAGER[0].name}`;
        const newPath =
          __dirname +
          "/downloaded" +
          `/${DOWNLOAD_MANAGER[0].id}@${DOWNLOAD_MANAGER[0].name}`;
        const dest = fs.createWriteStream(currentPath);
        const options = {
          host: "www.googleapis.com",
          path: "/drive/v3/files/" + DOWNLOAD_MANAGER[0].id + "?alt=media",
          method: "GET",
          headers: {
            Authorization: auth,
          },
        };
        callback = function (response) {
          let progress = 0;
          response.on("data", function (chunk) {
            progress += chunk.length;
            if (DOWNLOAD_MANAGER[0]) {
              DOWNLOAD_MANAGER[0].progress = progress;
            }
          });
          response.on("end", function () {
            DOWNLOAD_MANAGER.shift();
            fileDownloader();
            moveFile(currentPath, newPath);
          });
          response.pipe(dest);
        };
        var req = https.request(options, callback).end();
      } catch (error) {
        console.log(error);
        DOWNLOAD_MANAGER.shift();
        fileDownloader();
      }
    });
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

  function downloadFile(
    fileId,
    access_token,
    start,
    end,
    pipe,
    onEnd,
    onStart
  ) {
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
      readStream.on("data", () => {});
      readStream.on("end", () => {
        if (end >= (startChunk + 1) * CHUNK_SIZE) {
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
}
