"use strict";
class Tile {
    value;
    constructor(value) {
        this.value = value;
    }
}

const grid = document.getElementById("puzzle-grid");
//let tiles = [];
let gridSize = 4;
let numbers = [];
for (let i = 1; i < gridSize * gridSize; i++) {
    numbers[i-1] = i;
}
numbers.push(0);

function shuffle() {
    do {
        for (let i = numbers.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }
    } while (!isSolvable(numbers));
    updateTiles(numbers);
}

function isSolvable(numbers) {
    let inversionCount = 0;
    let gridSize = 4;
    let emptyRow = 0;

    for (let i = 0; i < numbers.length; i++) {
        if (numbers[i] === 0) {
            emptyRow = Math.floor(i / gridSize);
            continue;
        }

        for (let j = i + 1; j < numbers.length; j++) {
            if (numbers[j] !== 0 && numbers[i] > numbers[j]) {
                inversionCount++;
            }
        }
    }
    //for odd: solvable if inversion count is even
    //for even: solvable if parity of inversion count does not match
    //parity of emptyTile row index
    if(gridSize % 2 === 1 && inversionCount % 2 === 0){
        return true;
    }
    else if(gridSize % 2 === 0 &&
         ((emptyRow % 2 === 0) !== (inversionCount % 2 === 0))){
            console.log("empty row:"+emptyRow+",inversions:"+inversionCount);
            return true;
         }
    return false;
}

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

function updateTiles(numbers) {
    let childNodes = grid.childNodes;
    let emptyTile = document.querySelector(".empty");
    emptyTile.classList.remove("empty");
    emptyTile.addEventListener("click", moveTile);
    for (let i = 0; i < childNodes.length; i++) {
        if (numbers[i] === 0) {
            childNodes[i].classList.add("empty");
        }
        else {
            childNodes[i].dataset.index = i;
            childNodes[i].dataset.value = numbers[i];
            childNodes[i].textContent = numbers[i];
        }
    }
}

function moveTile(event) {
    let clickedTile = event.target;
    let emptyTile = document.querySelector(".empty");
    if (isAdjacent(clickedTile, emptyTile)) {
        swapTiles(clickedTile, emptyTile);
        let win = checkWin();
        if (win) {
            solved();
        }
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

function checkWin() {
    const nodes = grid.childNodes;
    //console.log("checking...");
    for (let i = 0; i < gridSize * gridSize-1; i++) {
        console.log(nodes[i].dataset.value+","+(i+1));
        if (parseInt(nodes[i].dataset.value) !== i+1) {
            return false;
        }
    }
    console.log("You won!");
    return true;
}

function solved() {
    const tileElements = document.querySelectorAll('.tile');
    for(let tile of tileElements){
        if(!tile.classList.contains("empty")){
            tile.classList.add("win");
        }
    }
}

createTiles();
shuffle();