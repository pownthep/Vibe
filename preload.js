const { remote, shell } = require("electron");
window.remote = remote;
window.desktop = true;
window.shell = shell;
window.directory = __dirname;
