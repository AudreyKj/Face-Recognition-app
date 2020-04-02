const spicePg = require("spiced-pg");

const db = spicePg(
  process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/database-imageboard"
);

function getImage() {
  return db.query(`SELECT * FROM images
      ORDER BY id DESC
      LIMIT 3; `);
}

function addImage(url, username, title, description) {
  return db.query(
    `INSERT INTO images (url, username, title, description) VALUES($1, $2, $3, $4)
        RETURNING *`,
    [url, username, title, description]
  );
}

function getImageClicked(id) {
  return db.query(
    `SELECT  url, username, title, description FROM images WHERE id=$1`,
    [id]
  );
}

function getCommentOnImg(image_id) {
  return db.query(
    `SELECT comment, username FROM comments WHERE image_id=$1
        ORDER BY id DESC`,
    [image_id]
  );
}

function insertComment(username, comment, image_id) {
  return db.query(
    `INSERT INTO comments (username, comment, image_id) VALUES($1,$2,$3)
        RETURNING *`,
    [username, comment, image_id]
  );
}

function fetchNextResults(cutoff) {
  return db.query(
    `SELECT url, title, id, (
    SELECT id FROM images
    ORDER BY id ASC
    LIMIT 1
) AS "lowestId" FROM images
WHERE id < $1
ORDER BY id DESC
LIMIT 10;`,
    [cutoff]
  );
}

function cleanImagesDb() {
  return db.query(`DELETE FROM images WHERE id > 4`);
}

function cleanCommentsDb() {
  return db.query(`DELETE FROM comments WHERE image_id > 4`);
}

exports.getImage = getImage;
exports.addImage = addImage;
exports.getImageClicked = getImageClicked;
exports.getCommentOnImg = getCommentOnImg;
exports.insertComment = insertComment;
exports.fetchNextResults = fetchNextResults;
exports.cleanImagesDb = cleanImagesDb;
exports.cleanCommentsDb = cleanCommentsDb;
