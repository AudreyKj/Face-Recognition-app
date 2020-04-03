const express = require("express");
const app = express();
const server = require("http").Server(app);
const db = require("./db.js");
const cloudinary = require("cloudinary");
const cron = require("node-cron");

//multer for file upload
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const diskStorage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, "./public" + "/uploads");
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
    fileSize: 800000
  }
});

app.use(express.static("./public"));

app.use(express.json());

//get images
app.get("/images", (req, res) => {
  db.getImage()
    .then(function(result) {
      return res.json(result);
    })
    .catch(function(err) {
      console.log("err in getImages", err);
    });
});

//file upload
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

app.post("/upload", (req, res) => {
  uploader.single("file")(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.json({ error: true });
    } else if (err) {
      return res.json({ error: true });
    }

    if (req.file) {
      let username = req.body.username;
      let title = req.body.title;
      let description = req.body.description;

      cloudinary.uploader.upload(req.file.path, function(result) {
        console.log(result);
        const url = result.url;

        db.addImage(url, username, title, description)
          .then(function(result) {
            return res.json(result.rows[0]);
          })
          .catch(function(err) {
            return res.json({ error: true });
          });
      });
    } else {
      return res.json({ error: true });
    }
  });
});

//cleaning images in the database every 15min
cron.schedule("0,15,30,45 * * * *", function() {
  db.cleanCommentsDb()
    .then(function(result) {
      db.cleanImagesDb()
        .then(function(result) {})
        .catch(function(err) {
          console.log(err, "error in cron task");
        });
    })
    .catch(function(err) {
      console.log(err, "error in cron task");
    });
});

//get clicked image
app.get("/images/:id", (req, res) => {
  let id = req.params.id;

  db.getImageClicked(id)
    .then(function(result) {
      return res.json(result.rows);
    })
    .catch(function(err) {
      console.log("err inside get image's id", err);
    });
});

//get clicked image's comments
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

//send comments
app.post("/comment/sendComments", (req, res) => {
  let username = req.body.username;
  let comment = req.body.comment;
  let image_id = req.body.image_id;

  db.insertComment(username, comment, image_id)
    .then(function(result) {
      return res.json(result.rows[0]);
    })
    .catch(function(err) {
      return res.status(400);
    });
});

//fetch next results
app.get("/pagination/:cutoff", (req, res) => {
  //cutoff is the lowest id on screen
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

server.listen(process.env.PORT || 8080, function() {
  console.log("I'm listening.");
});
