const express = require("express");
const http = require("http");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const unzipper = require("unzipper");
const fs = require("fs");

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("wellcome to file_upload");
});

app.post("/upload", upload.single("resumes"), async (req, res) => {
  const buffer = req.file.buffer;
  const directory = await unzipper.Open.buffer(buffer);
  const results = await directory.files.filter(({ path, type }) => {
    const reqpath = directory.files[0].path;
    const match = new RegExp("^" + reqpath, "gi");
    return type === "File" && match.test(path);
  });
  console.log({ results });
  results.forEach(async result => {
    const buffer = await result.buffer();
    console.log(result.path);
    const dir = "./tmp";

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    var wstream = fs.createWriteStream(`./tmp/${result.path.split("/").pop()}`);
    wstream.write(buffer);
    wstream.end();
  });
  res.send("done");
});

http.createServer(app).listen(PORT);
