const PORT = process.env.PORT || 5000;
const DB_LINK = 'mongodb://beealive:beetches@ds115198.mlab.com:15198/beealive';

const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const beeSchema = new Schema({
  id: Object,
  author: String,
  message: String
});
const Bee = mongoose.model("Bee", beeSchema);

mongoose.connect(DB_LINK);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static("dist"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res) {
  res.sendFile('index.html', { root: __dirname });
});

app.get("/findAll", function(req, res) {
  Bee.find(function(error, result) {
    if (error) {
      res.send(error);
    } else {
      result.length < 1 ? res.send({"message": "Aucuns résultats"}) : res.send(result);
    }
  });
});

app.get("/findOne", function(req, res) {
  Bee.find({
    "_id": req.query._id
  }, function(error, result) {
    if (error) {
      res.send(error);
    } else {
      result.length < 1 ? res.send({"message": "Aucun résultat"}) : res.send(result);
    }
  });
});

app.get("/create", function(req, res) {
  Bee.create({
    "author": req.query.author,
    "message": req.query.message
  }, (error, result) => {
    error ? res.send(error) : res.send(result);
  });
});

server.listen(PORT, function() {
  console.log(`Server servin' from good ol' port ${PORT}`);
});

io.on("connection", function(socket) {
  socket.on("addBee", function(data) {
    Bee.find({
      "_id": data._id
    }, function(error, result) {
      if (error) {
        res.send(error);
      } else {
        result.length < 1 ? res.send({"message": "Aucuns résultats"}) : io.emit("newBee", { bees: result });
      }
    });
  });
});
