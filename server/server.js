var fs = require("fs");
var google = require("googleapis");
var googleAuth = require("google-auth-library");
var express = require("express");
var https = require("https");
var endMw = require("express-end");
var stream = require("stream");
var app = express();
var cors = require("cors");
const axios = require("axios");
const prettyBytes = require("pretty-bytes");
const store = require("data-store")({ path: __dirname + "/store.json" });
const download = require("image-downloader");
const stringHash = require("string-hash");
//var FlexSearch = require("flexsearch");
//const searchData = require("./completed-series.json");
//console.log(searchData);

// Express setup
app.use(cors());
app.use(express.static("img"));
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// If modifying these scopes, delete your previously saved credentials
var SCOPES = ["https://www.googleapis.com/auth/drive"];
var TOKEN_DIR = __dirname + "/.credentials/";
var TOKEN_PATH = TOKEN_DIR + "googleDriveAPI.json";
var TEMP_DIR = __dirname + "/.temp/";
var CHUNK_SIZE = 20000000;
var PORT = 9001;
var data = {};
const IMG_DIR = __dirname + "/img/";
const placeholderImg = IMG_DIR + "placeholder.png";
let authStatus;
let isLatest = false;
// var index = new FlexSearch("speed");

// console.time("creating index");
// searchData.map((item) => {
//   index.add(item.id, item.name);
// });
// console.timeEnd("creating index");

// console.time("searching index");
// index.search("hero", function (result) {
//   //result.map((id) => console.log(searchData[id]));
//   console.log(result.length);
// });
// console.timeEnd("searching index");

// console.time("searching json");
// const result = searchData.filter((item) => item.name.toLowerCase().includes("hero"));
// console.log(result.length);
// console.timeEnd("searching json");

// Check for img dir or create one
fs.access(IMG_DIR, fs.constants.F_OK, (err) => {
  if (err)
    fs.mkdir(IMG_DIR, (err) => {
      if (err) console.error(err);
    });
});

// Load client secrets from a local file.
fs.readFile(__dirname + "/client_secret.json", function processClientSecrets(
  err,
  content
) {
  if (err) {
    console.log("Error loading client secret file: " + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Drive API.
  authorize(JSON.parse(content), startLocalServer);
});

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
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  // console.log("Authorize this app by visiting this url: ");
  // console.log(authUrl);
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
  app.get("/icon", (req, res) =>
    res.sendFile(__dirname + "/img/app_icon2.png")
  );

  app.get("/authenticate", (req, res) => {
    fs.readFile(TOKEN_PATH, function (err, token) {
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

  app.get("/redirect", async (req, res) => {
    res.redirect("https://google.com");
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
          .catch((err) => {
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

  app.get("/data", async (req, res) => {
    res.json(data.anime);
  });

  app.get("/data/:id", async (req, res) => {
    res.json(data.anime[req.params.id]);
  });

  app.get("/ready", (req, res) => {
    res.json(oauth2Client.credentials);
  });

  app.get("/list/:id", async (req, res) => {
    try {
      if (store.get(req.params.id)) {
        res.json(store.get(req.params.id));
        return;
      }
      let resp = await axios.get(
        "https://drive.google.com/drive/folders/" + req.params.id
      );
      let data = await resp.data;
      let start = data.indexOf(`window['_DRIVE_ivd'] = '`);
      let sm = data.substring(start);
      let end = sm.indexOf(";");
      let assignment = sm.substring(0, end + 1);
      let code = assignment.replace(`window['_DRIVE_ivd']`, "var driveData");
      eval(code);
      let json = JSON.parse(driveData);
      let final = json[0].map((item) => {
        return {
          id: item[0],
          name: item[2],
        };
      });
      res.json(final);
      store.set(req.params.id, final);
    } catch (error) {
      console.log(error);
      console.log("https://drive.google.com/drive/folders/" + req.params.id);
    }
  });

  app.get("/listfolder/:id", async (req, res) => {
    try {
      if (store.get(req.params.id)) {
        res.json(store.get(req.params.id));
        return;
      }
      let resp = await axios.get(
        "https://drive.google.com/drive/folders/" + req.params.id
      );
      let data = await resp.data;
      let start = data.indexOf(`window['_DRIVE_ivd'] = '`);
      let sm = data.substring(start);
      let end = sm.indexOf(";");
      let assignment = sm.substring(0, end + 1);
      let code = assignment.replace(`window['_DRIVE_ivd']`, "var driveData");
      eval(code);
      let json = JSON.parse(driveData);
      let final = json[0].map((item) => {
        return item[0];
      });
      res.json(final);
      store.set(req.params.id, final);
    } catch (error) {
      console.log(error);
      console.log("https://drive.google.com/drive/folders/" + req.params.id);
    }
  });

  app.get("/quota", (req, res) => {
    refreshTokenIfNeed(oauth2Client, (oauth2Client) => {
      var access_token = oauth2Client.credentials.access_token;
      var auth = "Bearer ".concat(access_token);
      var url = "https://www.googleapis.com/drive/v2/about";
      axios
        .get(url, {
          headers: { Authorization: auth, Accept: "application/json" },
        })
        .then((json) => {
          res.json({
            ...json.data,
            usedNumber: Number(json.data.quotaBytesUsed),
            totalNumber: Number(json.data.quotaBytesTotal),
            usedString: prettyBytes(Number(json.data.quotaBytesUsed)),
            totalString: prettyBytes(Number(json.data.quotaBytesTotal)),
          });
        })
        .catch((err) => {
          console.log(err);
          res.send({ error: true, message: err });
        });
    });
  });

  app.get("/drive", (req, res) => {
    if (store.get("files") && isLatest) {
      res.json(store.get("files"));
      return;
    }
    refreshTokenIfNeed(oauth2Client, (oauth2Client) => {
      var access_token = oauth2Client.credentials.access_token;
      var options = {
        host: "www.googleapis.com",
        path: "/drive/v3/files?&fields=*&pageSize=1000",
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
            var files = info.files
              .filter(
                (file) =>
                  file.size > 0 &&
                  file.ownedByMe &&
                  file.mimeType.includes("video")
              )
              .sort((a, b) => (a.size < b.size ? 1 : -1))
              .map((file) => {
                return {
                  id: file.id,
                  name: file.name,
                  size: file.size ? prettyBytes(parseInt(file.size)) : 0,
                  thumbnail: file.hasThumbnail
                    ? file.thumbnailLink
                    : file.iconLink,
                };
              });
            store.set("files", files);
            isLatest = true;
            res.json(files);
          } else console.log(info.error);
        });
      };

      https.request(options, callback).end();
    });
  });

  app.get("/copy/:id", async (req, res) => {
    refreshTokenIfNeed(oauth2Client, (oauth2Client) => {
      var access_token = oauth2Client.credentials.access_token;
      var fileId = req.params.id;
      httpCopyFile(fileId, access_token, res);
    });
  });

  app.get("/delete/:id", (req, res) => {
    refreshTokenIfNeed(oauth2Client, (oauth2Client) => {
      var access_token = oauth2Client.credentials.access_token;
      var fileId = req.params.id;
      httpDeleteFile(fileId, access_token, res);
    });
  });

  app.get("/downloading", async (req, res) => {
    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",

      // enabling CORS
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
    });

    const oAuth2Client2 = new google.auth.OAuth2(
      "519553454727-mshgdg5g4qefcsds2motl4vr41p6cs5i.apps.googleusercontent.com",
      "Ft3zpfO6dFdM9TfO0bmT4_8e",
      "urn:ietf:wg:oauth:2.0:oob"
    );

    try {
      fs.readFile(TOKEN_PATH, (err, tokenJson) => {
        var token = JSON.parse(tokenJson);
        oAuth2Client2.setCredentials(token);
        var fileId = "1QIR8HYdDXjnGAisLCUi1SQuz7jzplfaW";
        const drive = google.drive({ version: "v3", oAuth2Client2 });
        drive.files
          .get({ fileId, alt: "media" }, { responseType: "stream" })
          .then((res) => {
            return new Promise(async (resolve, reject) => {
              let progress = 0;
              res.data
                .on("end", () => {
                  console.log("Done downloading file.");
                  resolve("Done");
                })
                .on("error", (err) => {
                  console.log(err);
                })
                .on("data", (d) => {
                  progress += d.length;
                  res.write(`data: ${progress}\n\n`);
                });
            });
          })
          .catch((err) => console.log(err));
      });
    } catch (error) {
      console.log(error);
    }
  });

  app.get(/\/code/, function (req, res) {
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

  app.get("/stream/:id", (req, res) => {
    refreshTokenIfNeed(oauth2Client, (oauth2Client) => {
      var access_token = oauth2Client.credentials.access_token;
      var fileId = req.params.id;
      if (store.get(`drive.${fileId}`)) {
        var item = store.get(`drive.${fileId}`);
        var fileInfo = getInfoFromId(item.id);
        var action = null;
        if (fileInfo) {
          performRequest(fileInfo);
        } else {
          getFileInfo(item.id, access_token, (info) => {
            addInfo(item.id, info, oauth2Client);
            var fileInfo = getInfoFromId(item.id);
            performRequest(fileInfo);
          });
        }
        function performRequest(fileInfo) {
          var skipDefault = false;
          if (action == "download") {
            performRequest_download_start(req, res, access_token, fileInfo);
            skipDefault = true;
          }
          if (action == "download_stop") {
            performRequest_download_stop(req, res, access_token, fileInfo);
            skipDefault = true;
          }

          if (!skipDefault) {
            performRequest_default(req, res, access_token, fileInfo);
          }
        }
        return;
      }
      var options = {
        host: "www.googleapis.com",
        path: "/drive/v3/files/" + fileId + "/copy",
        method: "POST",
        headers: {
          Authorization: "Bearer " + access_token,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      };
      var httpReq = https.request(options, async (response) => {
        var body = "";
        response.on("data", function (chunk) {
          body += chunk;
        });
        response.on("end", function () {
          var item = JSON.parse(body);
          store.set(`drive.${req.params.id}`, item);
          store.set(`drive.${item.id}`, req.params.id);
          isLatest = false;
          var fileInfo = getInfoFromId(item.id);
          var action = null;
          if (fileInfo) {
            performRequest(fileInfo);
          } else {
            getFileInfo(item.id, access_token, (info) => {
              addInfo(item.id, info, oauth2Client);
              var fileInfo = getInfoFromId(item.id);
              performRequest(fileInfo);
            });
          }
          function performRequest(fileInfo) {
            var skipDefault = false;
            if (action == "download") {
              performRequest_download_start(req, res, access_token, fileInfo);
              skipDefault = true;
            }
            if (action == "download_stop") {
              performRequest_download_stop(req, res, access_token, fileInfo);
              skipDefault = true;
            }

            if (!skipDefault) {
              performRequest_default(req, res, access_token, fileInfo);
            }
          }
        });
      });
      httpReq.on("error", function (err) {
        console.log(err);
      });
      httpReq.end();
    });
  });

  app.get(/\/.{15,}/, function (req, res) {
    refreshTokenIfNeed(oauth2Client, (oauth2Client) => {
      var access_token = oauth2Client.credentials.access_token;
      var urlSplitted = req.url.match("^[^?]*")[0].split("/");
      var fileId = urlSplitted[1];
      var action = null;
      console.log(fileId);
      if (urlSplitted[2]) action = urlSplitted[2];
      var fileInfo = getInfoFromId(fileId);
      if (fileInfo) {
        performRequest(fileInfo);
      } else {
        getFileInfo(fileId, access_token, (info) => {
          addInfo(fileId, info, oauth2Client);
          var fileInfo = getInfoFromId(fileId);
          performRequest(fileInfo);
        });
      }

      function performRequest(fileInfo) {
        var skipDefault = false;
        if (action == "download") {
          performRequest_download_start(req, res, access_token, fileInfo);
          skipDefault = true;
        }
        if (action == "download_stop") {
          performRequest_download_stop(req, res, access_token, fileInfo);
          skipDefault = true;
        }

        if (!skipDefault) {
          performRequest_default(req, res, access_token, fileInfo);
        }
      }
    });
  });

  app.listen(PORT);
  console.log("Server started at port: " + PORT);
}

function performRequest_default(req, res, access_token, fileInfo) {
  var fileSize = fileInfo.info.size;
  var fileMime = fileInfo.info.mimeType;
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
      "Content-Type": fileMime,
    };
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
    const head = {
      "Content-Length": fileSize,
      "Content-Type": fileMime,
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

function performRequest_download_start(req, res, access_token, fileInfo) {
  var fileSize = fileInfo.info.size;
  var fileId = fileInfo.id;
  var status = getDownloadStatus(fileId);
  if (!status) {
    status = addDownloadStatus(fileId);
    var lastTime = new Date().getTime();
    var downloadedSize = 0;
    var downloadSize = 0;
    var startChunk = 0;
    if (req.query.p && req.query.p >= 0 && req.query.p <= 100)
      startChunk = Math.floor(((fileSize / CHUNK_SIZE) * req.query.p) / 100);
    if (
      req.query.c &&
      req.query.c >= 0 &&
      req.query.c <= Math.floor(fileSize / CHUNK_SIZE)
    )
      startChunk = req.query.c;
    downloadSize = fileSize - startChunk * CHUNK_SIZE;

    var videoDuration = null;
    fileInfo.getVideoLength
      .then((data) => {
        videoDuration = data;
      })
      .catch((error) => {
        console.log(error);
      });

    var echoStream = new stream.Writable();
    var chunkSizeSinceLast = 0;
    echoStream._write = function (chunk, encoding, done) {
      chunkSizeSinceLast += chunk.length;
      var nowTime = new Date().getTime();

      //update status
      if (nowTime - lastTime > 2000) {
        var speedInMBit =
          (chunkSizeSinceLast * 8) / (nowTime - lastTime) / 1000;
        var speedInByte = (speedInMBit / 8) * 1000000;
        downloadedSize += chunkSizeSinceLast;
        status.status = ((downloadedSize / downloadSize) * 100).toFixed(3);
        status.speedMbit = speedInMBit.toFixed(3);
        status.speedByte = speedInByte;
        if (videoDuration) {
          var timeLeftBeforeStreaming = Math.max(
            Math.round(
              (downloadSize - downloadedSize) / speedInByte -
                (videoDuration * downloadSize) / fileSize
            ),
            0
          );
          status.timeLeftBeforeStreaming = timeLeftBeforeStreaming;
        }
        lastTime = nowTime;
        chunkSizeSinceLast = 0;
      }

      done();
    };

    downloadFile(
      fileId,
      access_token,
      startChunk * CHUNK_SIZE,
      fileSize - 1,
      echoStream,
      () => {
        removeDownloadStatus(fileId);
      },
      (richiesta) => {
        status.onClose = () => {
          if (typeof richiesta.abort === "function") richiesta.abort();
          if (typeof richiesta.destroy === "function") richiesta.destroy();
          removeDownloadStatus(fileId);
        };
      }
    );
  }
  res.writeHead(200);
  res.write(JSON.stringify(status));
  res.end();
}

function performRequest_download_stop(req, res, access_token, fileInfo) {
  var fileId = fileInfo.id;
  var status = getDownloadStatus(fileId);
  if (status) {
    status.onClose();
  }
  res.writeHead(200);
  res.end();
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
    readStream.on("data", (chunk) => {
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
  req.on("error", function (err) {});
  req.end();
  onStart(req);
}

function httpCopyFile(fileId, access_token, response) {
  var options = {
    host: "www.googleapis.com",
    path: "/drive/v3/files/" + fileId + "/copy",
    method: "POST",
    headers: {
      Authorization: "Bearer " + access_token,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  var req = https.request(options, async (res) => {
    var body = "";
    res.on("data", function (chunk) {
      body += chunk;
    });
    res.on("end", function () {
      let json = JSON.parse(body);
      store.set(fileId, json);
      store.set(json.id, fileId);
      response.json(JSON.parse(body));
    });
  });
  req.on("error", function (err) {
    console.log(err);
  });
  req.end();
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
  req.on("error", function (err) {
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

function getFileInfo(fileId, access_token, onData) {
  var options = {
    host: "www.googleapis.com",
    path: "/drive/v3/files/" + fileId + "?alt=json&fields=*",
    method: "GET",
    headers: {
      Authorization: "Bearer " + access_token,
    },
  };

  callback = function (response) {
    var allData = "";
    response.on("data", function (chunk) {
      allData += chunk;
    });
    response.on("end", function () {
      var info = JSON.parse(allData);
      if (!info.error) onData(info);
      else console.log(info.error);
    });
  };

  https.request(options, callback).end();
}

//File info
var filesInfo = [];

function getInfoFromId(fileId) {
  var result = null;
  filesInfo.forEach((data) => {
    if (data.id == fileId) {
      result = data;
    }
  });
  return result;
}

function addInfo(fileId, fileInfo, oauth2Client) {
  var info = { id: fileId, info: fileInfo };
  info.getVideoLength = new Promise((resolve, reject) => {
    if (!info.videoLength) {
      refreshTokenIfNeed(oauth2Client, (oauth2Client) => {
        var access_token = oauth2Client.credentials.access_token;
        var auth = "Bearer ".concat(access_token);
        var url =
          "https://www.googleapis.com/drive/v3/files/" +
          fileId +
          "?fields=videoMediaMetadata";
        axios
          .get(url, {
            headers: { Authorization: auth, Accept: "application/json" },
          })
          .then((metadata) => {
            var duration = Number(metadata.durationMillis) / 1000;
            info.videoLength = duration;
            resolve(duration);
          })
          .catch((err) => {
            console.log(err);
            reject(err);
          });
      });
      // getVideoDurationInSeconds("http://127.0.0.1:" + PORT + "/" + fileId)
      //   .then((duration) => {
      //     info.videoLength = duration;
      //     console.log(duration);
      //     resolve(duration);
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //     reject(error);
      //   });
    } else {
      resolve(info.videoLength);
    }
  });

  filesInfo.push(info);
}

//Downloads status
var downloadStatus = [];

function getDownloadStatus(fileId) {
  var result = null;
  downloadStatus.forEach((data) => {
    if (data.id == fileId) {
      result = data;
    }
  });
  return result;
}

function addDownloadStatus(fileId) {
  var status = { id: fileId };
  status.onClose = () => {};
  downloadStatus.push(status);
  return status;
}

function removeDownloadStatus(fileId) {
  for (var i = 0; i < downloadStatus.length; i++) {
    if (downloadStatus[i].id == fileId) {
      downloadStatus.splice(i, 1);
    }
  }
}
