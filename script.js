"use strict";
class Tile {
    value;
    constructor(value) {
        this.value = value;
    }
}

const grid = document.getElementById("puzzle-grid");
let tiles = [];
let gridSize = 4;

function createTiles() {
    grid.innerHTML = "";
    for (let i = 0; i < gridSize * gridSize - 1; i++) {
        let tile = document.createElement("div");
        tile.classList.add("tile");
        tile.dataset.index = i;
        tile.dataset.value = i + 1;
        tile.textContent = tile.dataset.value;
        tile.addEventListener("click", moveTile);
        //tiles.push(tile);
        grid.appendChild(tile);
    }
    //empty
    let tile = document.createElement("div");
    tile.classList.add("tile");
    tile.classList.add("empty");
    tile.dataset.index = gridSize * gridSize - 1;
    tile.dataset.value = 0;
    //tiles.push(tile);
    grid.appendChild(tile);
}

function moveTile(event) {
    let clickedTile = event.target;
    let emptyTile = document.querySelector(".empty");
    if (isAdjacent(clickedTile, emptyTile)) {
        swapTiles(clickedTile, emptyTile);
    }
}

function isAdjacent(clickedTile, emptyTile) {
    const index1 = clickedTile.dataset.index;
    const index2 = emptyTile.dataset.index;
    const row1 = Math.floor(index1 / gridSize);
    const col1 = index1 % gridSize;
    const row2 = Math.floor(index2 / gridSize);
    const col2 = index2 % gridSize;
    if ((Math.abs(row1 - row2) === 1 && col1 === col2)
        || (Math.abs(col1 - col2) === 1 && row1 === row2)) {
        console.log("Empty:" + col2 + "," + row2);
        return true;
    }
    return false;
}

function swapTiles(tile1, tile2) {
    const tempIndex = tile1.dataset.index;
    tile1.dataset.index = tile2.dataset.index;
    tile2.dataset.index = tempIndex;
    const temp = document.createComment('');
    tile2.replaceWith(temp);
    tile1.replaceWith(tile2);
    temp.replaceWith(tile1);
}

createTiles();