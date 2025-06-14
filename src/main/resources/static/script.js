"use strict";

let gridSize = 4;
let moves = 0;
let soundEnabled = true;
let startTime = null;
let timerInterval = null;
let isLoggedIn = false;

const moveSound = new Audio("assets/click.mp3");
const grid = document.getElementById("puzzle-grid");

document.getElementById("size-select").addEventListener("change", () => {
    gridSize = parseInt(document.getElementById("size-select").value);
    createTiles();
    if(isLoggedIn){
        shuffleRanked();
    }
    else{
        shuffle();
    }
    updateBestResults();
    document.getElementById('size-select').blur();
});

const shuffleButton = document.getElementById("shuffle-button");
shuffleButton.addEventListener("click", () => {
    if(isLoggedIn){
        shuffleRanked();
    }
    else{
        shuffle();
    }
    reset();
});

document.querySelectorAll('.close').forEach(button => {
    button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-target');
        const modal = document.getElementById(targetId);
        if (modal) {
            modal.style.display = 'none';
        }
    });
});

window.addEventListener('click', event => {
    document.querySelectorAll('.modal').forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

const settingsDialog = document.getElementById("settings");
const settingsButton = document.getElementById("settings-button");
settingsButton.onclick = () => settingsDialog.style.display = "block";
document.getElementById("sound-toggle").checked = soundEnabled;
const applyButton = document.getElementById("settings-apply-button");
applyButton.onclick = () => {
    const darkMode = document.getElementById("dark-mode-toggle").checked;
    soundEnabled = document.getElementById("sound-toggle").checked;
    document.body.classList.toggle("dark-mode", darkMode);
    settingsDialog.style.display = "none";
};

function shuffle() {
    let scramble = [];
    for (let i = 1; i < gridSize * gridSize; i++) {
        scramble[i - 1] = i;
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
    //for even: solvable if parity of inversion count does not match parity of emptyTile row index
    if (gridSize % 2 === 1 && inversionCount % 2 === 0) {
        return true;
    }
    else if (gridSize % 2 === 0 &&
        ((emptyRow % 2 === 0) !== (inversionCount % 2 === 0))) {
        return true;
    }
    return false;
}

async function shuffleRanked(){
    const res = await fetch(`/game/start/${gridSize}`, {
        credentials: "include"
    });
    const data = await res.json();
    const scramble = data.scramble;
    window.currentGameToken = data.token;
    updateTiles(scramble);
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
    document.addEventListener("keydown", handleKeyPress);
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
            childNodes[i].addEventListener("click", moveTile);
        }
    }
}

function handleKeyPress(event) {
    let emptyTile = document.querySelector(".empty");
    let childNodes = grid.childNodes;
    let emptyIndex = parseInt(emptyTile.dataset.index);
    let emptyRow = Math.floor(emptyIndex / gridSize);
    let emptyCol = emptyIndex % gridSize;
    let targetTile = null;
    if (event.key === "ArrowUp" && emptyRow < gridSize - 1) {
        targetTile = childNodes[emptyIndex + gridSize]; // Tile below moves up
    } else if (event.key === "ArrowDown" && emptyRow > 0) {
        targetTile = childNodes[emptyIndex - gridSize]; // Tile above moves down
    } else if (event.key === "ArrowLeft" && emptyCol < gridSize - 1) {
        targetTile = childNodes[emptyIndex + 1]; // Tile on right moves left
    } else if (event.key === "ArrowRight" && emptyCol > 0) {
        targetTile = childNodes[emptyIndex - 1]; // Tile on left moves right
    }
    if (targetTile) {
        moveTile({ target: targetTile });
    }
}

function moveTile(event) {
    let clickedTile = event.target;
    let emptyTile = document.querySelector(".empty");
    if (isAdjacent(clickedTile, emptyTile)) {
        swapTiles(clickedTile, emptyTile);
        if (soundEnabled) {
            moveSound.currentTime = 0;
            moveSound.play();
        }
        updateTimeCounter();
        updateMovesCounter();
        if (checkWin()) {
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
        if (parseInt(nodes[i].dataset.value) !== i + 1) {
            return false;
        }
    }
    return true;
}

function solved() {
    clearInterval(timerInterval);
    document.removeEventListener("keydown", handleKeyPress);
    const tileElements = document.querySelectorAll('.tile');
    for (let tile of tileElements) {
        if (!tile.classList.contains("empty")) {
            tile.classList.add("win");
            tile.removeEventListener("click", moveTile);
        }
    }
    let currentTime = parseFloat(document.getElementById("time-counter").textContent);
    let currentMoves = parseInt(document.getElementById("moves-counter").textContent);
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
    if (isLoggedIn) {
        const scoreData = {
            time: currentTime,
            moves: currentMoves,
            gridSize: gridSize,
            token: window.currentGameToken
        };
        submitScore(scoreData);
    }
    updateBestResults();
}

function reset() {
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

function getTime() {
    let elapsedTime = Date.now() - startTime;
    let seconds = Math.floor(elapsedTime / 1000);
    let milliseconds = elapsedTime % 1000;
    return `${seconds}.${milliseconds}`;
}

function updateTimeCounter() {
    if (!startTime) {
        startTimer();
    }
    let time = getTime();
    document.getElementById("time-counter").textContent = time;
    let tps = moves / time;
    document.getElementById("tps-counter").textContent = isFinite(tps) ? tps.toFixed(3) : "0.000";

}

function updateBestResults() {
    if (isLoggedIn) {
        fetch(`/scores/personal-best/${gridSize}`)
            .then(response => {
                if (!response.ok) {
                    document.getElementById("best-time").textContent = "--";
                    document.getElementById("best-moves").textContent = "--";
                }
                return response.json();
            })
            .then(bestResults => {
                document.getElementById("best-time").textContent = bestResults[0].solveTime;
                document.getElementById("best-moves").textContent = bestResults[1].moves;
            });
    }
    else {
        let bestResults = JSON.parse(localStorage.getItem("bestResults")) || {};
        let key = `grid-${gridSize}`;
        document.getElementById("best-time").textContent = bestResults[key]?.time ? bestResults[key].time.toFixed(3) : "--";
        document.getElementById("best-moves").textContent = bestResults[key]?.moves || "--";
    }
}

const registerDialog = document.getElementById("register-dialog");
const registerButton = document.getElementById("register-button");
const registerResponse = document.getElementById("register-response");
registerButton.onclick = () => registerDialog.style.display = "block";
registerResponse.style.display = "none";

document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: document.getElementById("reg-username").value,
            password: document.getElementById("reg-password").value
        })
    });
    const responseText = await res.text();
    if (res.ok) {
        registerResponse.textContent = responseText;
        registerResponse.style.display = "block";
    } else {
        registerResponse.textContent = "Something went wrong. Please try again.";
        registerResponse.style.display = "block";
    }
});

const loginDialog = document.getElementById("login-dialog");
const loginButton = document.getElementById("login-button");
loginButton.onclick = () => loginDialog.style.display = "block";
const logout = document.getElementById("logout");

async function checkLoginStatus() {
    try {
        const res = await fetch("/auth/account", {
            credentials: "include",
        });
        if (res.ok) {
            isLoggedIn = true;
        } else {
            isLoggedIn = false;
        }
    } catch (err) {
        isLoggedIn = false;
    }
}

function submitScore(scoreData) {
    if (!window.currentGameToken) {
        return;
    }
    fetch('/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData)
    })
    .then(res => {
        if (!res.ok) {
            return res.text().then(text => { throw new Error(text || res.statusText); });
        }
    })
    .catch(err => {
        console.error("Error submitting score:", err);
    });
}

const leaderboardButton = document.getElementById("leaderboard-button");
const leaderboardDialog = document.getElementById("leaderboard-dialog");
const leaderboardSizeSelect = document.getElementById("leaderboard-size-select");
const leaderboardTable = document.getElementById("leaderboard-table");
const leaderboardTableBody = leaderboardTable.getElementsByTagName('tbody')[0];

leaderboardButton.addEventListener("click", async () => {
    leaderboardDialog.style.display = "block";
    await loadLeaderboard();
});

leaderboardSizeSelect.addEventListener("change", loadLeaderboard);
document.querySelectorAll('input[name="sortMode"]').forEach(radio => {
    radio.addEventListener("change", loadLeaderboard);
});

async function loadLeaderboard() {
    const gridSize = leaderboardSizeSelect.value;
    const sortMode = document.querySelector('input[name="sortMode"]:checked').value;
    const endpoint = sortMode === "time" ? `/scores/time/${gridSize}` : `/scores/moves/${gridSize}`;
    try {
        const res = await fetch(endpoint);
        const data = await res.json();
        leaderboardTableBody.innerHTML = "";

        data.forEach((score, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${index + 1}</td>
            <td>${score.user.username}</td>
            <td>${score.solveTime.toFixed(2)}</td>
            <td>${score.moves}</td>
            `;
            leaderboardTableBody.appendChild(row);
        });
    } catch (err) {
        leaderboardTableBody.innerHTML = "<tr><td colspan='4'>Error loading leaderboard</td></tr>";
        console.error("Failed to load leaderboard:", err);
    }
}

async function onLoad() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') === 'true') {
        document.getElementById("error-dialog").style.display = "block";
    }
    await checkLoginStatus();
    if (isLoggedIn) {
        registerButton.style.display = "none";
        loginButton.style.display = "none";
        logout.style.display = "block";
    }
    createTiles();
    if(isLoggedIn){
        shuffleRanked();
    }
    else{
        shuffle();
    }
    updateBestResults();
}

onLoad();
