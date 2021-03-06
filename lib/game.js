"use strict";

var Opponent = require('./opponent');
var Board = require('./board');
var uuid = require('node-uuid');

function Game() {
  // Keep the board instance classes private to maintain
  // fine grain control over JSON structure.
  var primaryBoard = new Board();
  var trackingBoard = new Board();
  var self = this;


  this.trackingGrid = trackingBoard.grid;
  this.primaryGrid = primaryBoard.grid;
  this.opponent = new Opponent();
  this.status = "setup";
  this.id = uuid.v4();

  this.setPrimaryGrid = function(grid) {
    primaryBoard.grid = grid;
    self.primaryGrid = grid;
    return self;
  };

  this.shoot = function(x, y) {
    var result = trackingBoard.shoot(x, y);
    self.opponent.shoot(primaryBoard);
    return result;
  };

  this.placeAiShip = function() {
    trackingBoard.place3SpotShip(0, 0);
    return self;
  };

}

module.exports = Game;
