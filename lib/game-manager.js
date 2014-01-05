"use strict";
var Q = require('Q');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/battleship');
var conn = mongoose.connection;

var games = conn.collection('games');
var insertGame = Q.nfbind(games.insert.bind(games));

function saveGame(game) {
  return insertGame(game);
}

module.exports = {saveGame: saveGame};