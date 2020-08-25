const { remote, shell } = require("electron");
const fs = require("fs");
window.remote = remote;
window.desktop = true;
window.shell = shell;
window.directory = __dirname;
window.access = fs.access;
window.API = "http://localhost/";
