const express = require("express");
const app = express();
const db = require("./db.js");
const s3 = require("./s3.js");

//////////FILE UPLOAD BOILERPLATE CODE /////////////////
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const diskStorage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, __dirname + "/uploads");
  },
  filename: function(req, file, callback) {
    uidSafe(24).then(function(uid) {
      callback(null, uid + path.extname(file.originalname));
    });
  }
});

const uploader = multer({
  storage: diskStorage,
  limits: {
    fileSize: 2097152
  }
});
//////////FILE UPLOAD BOILERPLATE CODE ENDS HERE/////////////////

app.use(express.static("./public"));

app.use(express.json());

app.get("/images", (req, res) => {
  db.getImage()
    .then(function(result) {
      return res.json(result);
    })
    .catch(function(err) {
      console.log("err in getImages", err);
    });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
  if (req.file) {
    console.log("req.file.filename", req.file.filename);
    let username = req.body.username;
    let title = req.body.title;
    let description = req.body.description;

    const name1 = "https://s3.amazonaws.com/retina-imageboard/";
    const url = name1.concat(req.file.filename);

    db.addImage(url, username, title, description)
      .then(function(result) {
        return res.json(result.rows[0]);
      })
      .catch(function(error) {
        console.log("error in addImage", error);
      });
  } else {
    res.json({ success: false });
  }
});

app.get("/images/:id", (req, res) => {
  let id = req.params.id;

  db.getImageClicked(id)
    .then(function(result) {
      return res.json(result.rows);
    })
    .catch(function(err) {
      console.log("err inside image", err);
    });
});

app.get("/comment/:id", (req, res) => {
  let id = req.params.id;

  db.getCommentOnImg(id)
    .then(function(result) {
      return res.json(result.rows);
    })
    .catch(function(err) {
      console.log("err inside get comment", err);
    });
});

app.post("/comment/sendComments", (req, res) => {
  let username = req.body.username;
  let comment = req.body.comment;
  let image_id = req.body.image_id;

  db.insertComment(username, comment, image_id)
    .then(function(result) {
      return res.json(result.rows[0]);
    })
    .catch(function(err) {
      console.log("err inside send comment", err);
    });
});

app.get("/pagination/:cutoff", (req, res) => {
  //cutoff is the lowest id on screen //
  //lowestId is the lowest id in the database
  let cutoff = req.params.cutoff;

  db.fetchNextResults(cutoff)
    .then(function(result) {
      return res.json(result.rows);
    })
    .catch(function(err) {
      console.log("err inside fetchNextResults", err);
    });
});

app.listen(8080, () => console.log("server listening on port 8080"));
