let GAME;
let player;
let activeCell = false;
let socket;
let eatenPieces = 0

function initGame(id){
    player = GAME.players[id].type
    const welcomeMessage = document.getElementsByTagName('h1')
    console.log(welcomeMessage)
    if(welcomeMessage && welcomeMessage[0]) welcomeMessage[0].remove()
    const app = document.getElementById('app')
    const header = document.createElement('h3')
    header.innerText = `You are playing ${player === 1 ? 'white' : 'black'} (${player})`
    app.appendChild(header)

    initBoard()
}

function initBoard(){
    const app = document.getElementById('app')
    removeOldState()

    const header = document.createElement('h4')
    header.innerText = GAME.turn === player ? 'YOUR turn' : 'Opponents turn'
    header.style.color = GAME.turn === player ? 'green' : 'red'

    const table = document.createElement('table')

    if(GAME.turn === player) table.addEventListener('click', clickEvent)

    GAME.board.forEach( (arr, outerIndex) => {
        const tr = document.createElement('tr')
        arr.forEach( (item, innerIndex) => {
            const td = document.createElement('td')
            td.innerText = item.type ? item.king ? 'King '+ item.type: item.type : null;
            td.classList.add('soldier')
            td.classList.add(item.type)
            td.classList.add(outerIndex +','+innerIndex)
            if(item.active) td.classList.add('active')
            if(item.target) td.classList.add('move')
            td.style.background = calculateCellColor(outerIndex, innerIndex)
            tr.appendChild(td)
        })
        table.appendChild(tr);
    })

    app.appendChild(header)
    app.appendChild(table)
}

function removeOldState(){
    const oldTable = document.getElementsByTagName('table')
    const oldTurnMessage = document.getElementsByTagName('h4')

    if(oldTable && oldTable[0]) oldTable[0].remove()
    if(oldTurnMessage && oldTurnMessage[0]) oldTurnMessage[0].remove()
}

function calculateCellColor(outerIndex, innerIndex){
    let innerItem = 'white';
    if(outerIndex % 2){
        if(!(innerIndex % 2)) innerItem = 'lightblue'
    } else {
        if(innerIndex % 2) innerItem = 'lightblue'
    }

    return innerItem;
}

function clickEvent(event){

    const cellIndex = event.target.classList[2].split(',').map( ele => parseInt(ele))
    const outerIndex = cellIndex[0]
    const innerIndex = cellIndex[1]

    if(GAME.board[outerIndex][innerIndex].type === player){
        if(!activeCell ||
            ( activeCell[0] === outerIndex && activeCell[1] === innerIndex )
        ){
            startMove(outerIndex, innerIndex, player)
            initBoard()
        }
    }

    if(GAME.board[outerIndex][innerIndex].target){
        const pieceClone = [...activeCell];
        const pieceOuterIndex = pieceClone[0];
        const pieceInnerIndex = pieceClone[1]

        startMove(pieceOuterIndex, pieceInnerIndex, player)
        endMove(outerIndex, innerIndex, pieceOuterIndex, pieceInnerIndex, player)
        updateBoardViaSocket()

        if(eatenPieces === 12) {
            GAME.winner = player
            endGame()
        }
    }
}

function startMove(outIndex, innerIndex, type){
    GAME.board[outIndex][innerIndex].active = !GAME.board[outIndex][innerIndex].active
    const enemy = type === 1 ? 2 : 1
    const outerIndex = type === 1 ? outIndex+1 : outIndex-1
    activeCell = activeCell ? null : [outIndex, innerIndex]

    if(GAME.board[outIndex][innerIndex].king){
       [outIndex+1, outIndex-1].forEach(outerIndex => updateClientBoard(outerIndex, innerIndex, enemy))
    } else {
        updateClientBoard(outerIndex, innerIndex, enemy)
    }
}

function updateClientBoard(outerIndex, innerIndex, enemy){
    if(
        GAME.board[outerIndex]
        && GAME.board[outerIndex][innerIndex+1]
        && (GAME.board[outerIndex][innerIndex+1].type === 0 || GAME.board[outerIndex][innerIndex+1].type === enemy )
    ) GAME.board[outerIndex][innerIndex+1].target = !GAME.board[outerIndex][innerIndex+1].target

    if(
        GAME.board[outerIndex]
        && GAME.board[outerIndex][innerIndex-1]
        && (GAME.board[outerIndex][innerIndex-1].type === 0 || GAME.board[outerIndex][innerIndex-1].type === enemy)
    ) GAME.board[outerIndex][innerIndex-1].target = !GAME.board[outerIndex][innerIndex-1].target
}

function endMove(destinationOuterIndex, destinationInnerIndex, pieceOuterIndex, pieceInnerIndex, player) {
    let pieceClone = {...GAME.board[pieceOuterIndex][pieceInnerIndex]}
    let placeholderClone = {...GAME.board[destinationOuterIndex][destinationInnerIndex]}

    if(player === 1 && destinationOuterIndex === 7) pieceClone.king = true;
    if(player === 2 && destinationOuterIndex === 0) pieceClone.king = true;

    if(placeholderClone.type !== 0){
        placeholderClone = {
            active: false,
            target: false,
            type: 0
        }

        eatenPieces++
    }
    GAME.board[destinationOuterIndex][destinationInnerIndex] = pieceClone
    GAME.board[pieceOuterIndex][pieceInnerIndex] = placeholderClone
}

function updateBoardViaSocket(){
    GAME.turn = GAME.turn === 1 ? 2 : 1
    socket.emit('updateBoard', GAME)
}

function endGame() {
    socket.emit('endGame', GAME)
}

(function () {
    socket = io();
    socket.on('startGame', function (msg) {
        GAME = msg;
        initGame(socket.id)
    })
    socket.on('updateBoard', function (msg) {
        GAME = msg;
        initBoard()
    })
    socket.on('endGame', function (msg) {
        alert('Winner is: player '+msg.winner)
    })
})()
