"use strict";

let gridSize = 4;
let moves = 0;
let startTime = null;
let timerInterval = null;

const moveSound = new Audio("assets/click.mp3");
const grid = document.getElementById("puzzle-grid");
document.getElementById("size-select").addEventListener("change", () =>{
    gridSize = parseInt(document.getElementById("size-select").value);
    createTiles();
    shuffle();
    updateBestResults();
    document.getElementById('size-select').blur();
});
const darkModeButton = document.getElementById("dark-mode-button");
darkModeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});
const shuffleButton = document.getElementById("shuffle-button");
shuffleButton.addEventListener("click", () => {
    shuffle();
    reset();
});
document.addEventListener("keydown", handleKeyPress);

function shuffle() {
    let scramble = [];
    for (let i = 1; i < gridSize * gridSize; i++) {
      scramble[i-1] = i;
    }
    scramble.push(0);
    do {
        for (let i = scramble.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [scramble[i], scramble[j]] = [scramble[j], scramble[i]];
        }
    } while (!isSolvable(scramble));
    updateTiles(scramble);
}

function isSolvable(scramble) {
    let inversionCount = 0;
    let emptyRow = 0;

    for (let i = 0; i < scramble.length; i++) {
        if (scramble[i] === 0) {
            emptyRow = Math.floor(i / gridSize);
            continue;
        }

        for (let j = i + 1; j < scramble.length; j++) {
            if (scramble[j] !== 0 && scramble[i] > scramble[j]) {
                inversionCount++;
            }
        }
    }
    //for odd: solvable if inversion count is even
    //for even: solvable if parity of inversion count does not match
    //parity of emptyTile row index
    console.log(gridSize);
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
    reset();
    grid.innerHTML = "";
    grid.style.gridTemplateColumns = `repeat(${gridSize},1fr)`;
    grid.style.gridTemplateRows = `repeat(${gridSize},1fr)`;
    for (let i = 0; i < gridSize * gridSize - 1; i++) {
        let tile = document.createElement("div");
        tile.classList.add("tile");
        tile.dataset.index = i;
        tile.dataset.value = i + 1;
        tile.textContent = tile.dataset.value;
        tile.addEventListener("click", moveTile);
        grid.appendChild(tile);
    }
    //empty
    let tile = document.createElement("div");
    tile.classList.add("tile");
    tile.classList.add("empty");
    tile.dataset.index = gridSize * gridSize - 1;
    tile.dataset.value = 0;
    grid.appendChild(tile);
}

function updateTiles(scramble) {
    let childNodes = grid.childNodes;
    let emptyTile = document.querySelector(".empty");
    emptyTile.classList.remove("empty");
    emptyTile.addEventListener("click", moveTile);
    for (let i = 0; i < childNodes.length; i++) {
        childNodes[i].classList.remove("win");
        if (scramble[i] === 0) {
            childNodes[i].classList.add("empty");
            childNodes[i].dataset.value = 0;
            childNodes[i].textContent = "";
        }
        else {
            childNodes[i].dataset.index = i;
            childNodes[i].dataset.value = scramble[i];
            childNodes[i].textContent = scramble[i];
        }
    }
}

function handleKeyPress(event){
    let emptyTile = document.querySelector(".empty");
    let childNodes = grid.childNodes;
    let emptyIndex = parseInt(emptyTile.dataset.index);
    let emptyRow = Math.floor(emptyIndex/gridSize);
    let emptyCol = emptyIndex % gridSize;
    let targetTile = null;
    if (event.key === "ArrowUp" && emptyRow < gridSize - 1) {
        console.log("up");
        targetTile = childNodes[emptyIndex + gridSize]; // Tile below moves up
    } else if (event.key === "ArrowDown" && emptyRow > 0) {
        console.log("down");
        targetTile = childNodes[emptyIndex - gridSize]; // Tile above moves down
    } else if (event.key === "ArrowLeft" && emptyCol < gridSize - 1) {
        console.log("left");
        console.log(emptyIndex+1);
        targetTile = childNodes[emptyIndex + 1]; // Tile on right moves left
    } else if (event.key === "ArrowRight" && emptyCol > 0) {
        console.log("right");
        targetTile = childNodes[emptyIndex - 1]; // Tile on left moves right
    }
    if(targetTile){
        moveTile({target: targetTile});
    }
}

function moveTile(event) {
    let clickedTile = event.target;
    let emptyTile = document.querySelector(".empty");
    if (isAdjacent(clickedTile, emptyTile)) {
        swapTiles(clickedTile, emptyTile);
        moveSound.currentTime = 0;
        moveSound.play();
        updateTimeCounter();
        updateMovesCounter();
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
    for (let i = 0; i < gridSize * gridSize - 1; i++) {
        console.log(nodes[i].dataset.value+","+(i+1));
        if (parseInt(nodes[i].dataset.value) !== i+1) {
            return false;
        }
    }
    console.log("You won!");
    return true;
}

function solved() {
    clearInterval(timerInterval);
    const tileElements = document.querySelectorAll('.tile');
    for(let tile of tileElements){
        if(!tile.classList.contains("empty")){
            tile.classList.add("win");
        }
    }
    let currentTime = parseFloat(document.getElementById("time-counter").textContent);
    console.log("Time:"+currentTime);
    let currentMoves = parseInt(document.getElementById("moves-counter").textContent);
    console.log("Moves:"+currentMoves);
    let bestResults = JSON.parse(localStorage.getItem("bestResults")) || {};
    let key = `grid-${gridSize}`;
    if (!bestResults[key]) {
        bestResults[key] = {};
    }
    if (!bestResults[key].time || currentTime < bestResults[key].time) {
        bestResults[key].time = currentTime;
    }
    if (!bestResults[key].moves || currentMoves < bestResults[key].moves) {
        bestResults[key].moves = currentMoves;
    }
    localStorage.setItem("bestResults", JSON.stringify(bestResults));
    updateBestResults();
}

function reset(){
    moves = 0;
    document.getElementById("moves-counter").textContent = moves;
    document.getElementById("tps-counter").textContent = "0.000";
    clearInterval(timerInterval);
    timerInterval = null;
    startTime = null;
    document.getElementById("time-counter").textContent = "0.000";
}

function updateMovesCounter() {
    moves++;
    document.getElementById("moves-counter").textContent = moves;
}

function startTimer() {
    if (!startTime) {
        startTime = Date.now(); 
        timerInterval = setInterval(updateTimeCounter, 50);
    }
}

function getTime(){
    let elapsedTime = Date.now()- startTime;
    let seconds = Math.floor(elapsedTime / 1000);
    let milliseconds = elapsedTime % 1000;
    return `${seconds}.${milliseconds}`;
}

function updateTimeCounter(){
    if(!startTime){
        startTimer();
    }
    let time = getTime();
    document.getElementById("time-counter").textContent = time;
    let tps = moves / time; 
    document.getElementById("tps-counter").textContent = isFinite(tps) ? tps.toFixed(3) : "0.000";

}

function updateBestResults() {
    let bestResults = JSON.parse(localStorage.getItem("bestResults")) || {};
    let key = `grid-${gridSize}`;
    console.log(bestResults[key]);
    document.getElementById("best-time").textContent = bestResults[key]?.time ? bestResults[key].time.toFixed(3) : "--";
    document.getElementById("best-moves").textContent = bestResults[key]?.moves || "--";
}

createTiles();
shuffle();
updateBestResults();