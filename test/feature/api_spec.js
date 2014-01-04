var frisby = require('frisby');
var root = "http://localhost:3000";
var gamesURI = root + "/games";
var gameId;
var fakeGrid = [
  [{state:"none", ship: "ship"}, {state:"none", ship:"ship"}, {state:"none"}],
  [{state:"none"}, {state:"none"}, {state:"none"}],
  [{state:"none"}, {state:"none"}, {state:"none"}]
];

function gameURI() {
  if (gameId) {
    return gamesURI + "/" + gameId;
  } else {
    throw "game id not set.";
  }
}

function createGame() {
  frisby.create('Game starts when a user POSTs a new game')
    .post(gamesURI)
      .expectStatus(200)
      .expectHeaderContains('content-type', 'application/json')
      // .inspectJSON()
      .expectJSON({ status: "setup", })
      .expectJSONTypes({ id: Number })
      .afterJSON(function(data) {
        gameId = data.id;
        updateGame()
      })
  .toss();
}

function updateGame() {
  frisby.create('Setup ends when a user updates game with PUT')
    .put(gameURI(), {
      id: gameId,
      status: "setup",
      primaryGrid: fakeGrid
    }, { json: true })
      .expectStatus(200)
      .expectHeaderContains('content-type', 'application/json')
      .expectJSON({
        status: "inprogress",
        turn: "yours"
      })
      // .inspectJSON()
      .expectJSONTypes({
        status: String,
        turn: String,
        id: Number,
        trackingGrid: Array,
        primaryGrid: Array
      })
      .afterJSON(function(data) {
        expect(data.trackingGrid.length).toBe(3);
        data.trackingGrid.forEach(function(row) {
          expect(row.length).toBe(3);
          expect(row).toContain({ state: 'none' });
          expect(row).not.toContain({ state: 'hit' });
          expect(row).not.toContain({ state: 'miss' });
        });
        expect(data.primaryGrid).toEqual(fakeGrid);
        getGameStateDuringPlay()
      })
  .toss();
}

function getGameStateDuringPlay() {
  frisby.create('Poll for game state via GET /games/:id')
    .get(gameURI())
      .expectStatus(200)
      .expectHeaderContains('content-type', 'application/json')
      // .inspectJSON()
      .expectJSON({})
      .expectJSONTypes({
        status: String,
        turn: String,
        id: Number,
        trackingGrid: Array,
        primaryGrid: Array
      })
      .after(function(data) {
        postShot()
      })
  .toss();
}

function postShot() {
  frisby.create('Fire a shot via POST /games/:id/shots')
    .post(gameURI() + '/shots', { x: 0, y: 1 }, { json: true })
      .expectStatus(200)
      .expectHeaderContains('content-type', 'application/json')
      // .inspectJSON()
      .expectJSON({ x: 0, y: 1 })
      .expectJSONTypes({
        x: Number,
        y: Number,
        hit: Boolean,
        sunk: String
      })
      .afterJSON(function(data) {
        expect(data.sunk).toMatch(/none sunk|carrier|battleship|destroyer|patrol boat/);
      })
  .toss();
}

createGame();
