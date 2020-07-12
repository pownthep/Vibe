const { remote, shell } = require("electron");
const Store = require("electron-store");
const fs = require("fs");
window.remote = remote;
window.store = Store;
window.shell = shell;
window.directory = __dirname;
window.access = fs.access;
