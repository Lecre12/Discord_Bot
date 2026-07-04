const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");

function copyDirectory(source, target) {
    if (!fs.existsSync(source)) return;

    fs.cpSync(source, target, { recursive: true, force: true });
}

copyDirectory(path.resolve(rootDir, "yt-dlp"), path.resolve(rootDir, "build", "yt-dlp"));

const linuxYtDlp = path.resolve(rootDir, "build", "yt-dlp", "yt-dlp");
if (process.platform !== "win32" && fs.existsSync(linuxYtDlp)) {
    fs.chmodSync(linuxYtDlp, 0o755);
}
