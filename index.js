const { app, BrowserWindow } = require("electron");
const path = require("path");
const { getPluginEntry } = require("mpv.js");

// Absolute path to the plugin directory.
const pluginDir = path.join(
  path.dirname(require.resolve("mpv.js")),
  "build",
  "Release"
);
// See pitfalls section for details.
if (process.platform !== "linux") {
  process.chdir(pluginDir);
}
// Fix for latest Electron.
app.commandLine.appendSwitch("no-sandbox");
// To support a broader number of systems.
app.commandLine.appendSwitch("ignore-gpu-blacklist");
app.commandLine.appendSwitch(
  "register-pepper-plugins",
  getPluginEntry(pluginDir)
);

require("./server/app.js");

function createWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      plugins: true,
    },
  });

  // and load the index.html of the app.
  //win.loadURL("http://localhost:3000");
  //if(isDev) win.loadURL("http://localhost:3000");
  //else
  win.loadFile("./build/index.html");
}

app.whenReady().then(createWindow);
