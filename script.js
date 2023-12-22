const GRID = 3;

//Setting up the initial start modal
const MODAL = document.querySelector('dialog.options'); MODAL.close();
MODAL.showModal();
MODAL.querySelector('button').addEventListener('click', function(){    
    //Get the details for the players
    let player1 = {
        name: MODAL.querySelector('#name-1').value,
        cpu: MODAL.querySelector('#cpu-1').checked,
        mark: 'x'
    }

    let player2 = {
        name: MODAL.querySelector('#name-2').value,
        cpu: MODAL.querySelector('#cpu-2').checked,
        mark: 'o'
    }

    //Clear the modal
    MODAL.querySelector('#name-1').value = '';
    MODAL.querySelector('#cpu-1').checked = false;
    MODAL.querySelector('#name-2').value = '';
    MODAL.querySelector('#cpu-2').checked = false;


    //Hide the modal, then start the game
    MODAL.close();

    //Clear the previous board
    CELLS.forEach((cell) => {
        cell.querySelector('text').textContent = '';
    });

    game.start(
        (player1.cpu) ? makeCPUPlayer(player1.name,player1.mark) : makePlayer(player1.name,player1.mark),
        (player2.cpu) ? makeCPUPlayer(player2.name,player2.mark) : makePlayer(player2.name,player2.mark),
    );
});

//Preventing escape key closing of the modal
MODAL.addEventListener('keydown', (e) =>{
    if(e.key == 'Escape') e.preventDefault();
});

//Setting up the blocker dialog to prevent other things from happening
const BLOCKER = document.querySelector('dialog.blocker');
BLOCKER.addEventListener('keydown', (e) =>{
    if(e.key == 'Escape') e.preventDefault();
});

const PLAY_AGAIN = document.querySelector('dialog.play-again');
PLAY_AGAIN.addEventListener('keydown', (e) =>{
    if(e.key == 'Escape') e.preventDefault();
})
PLAY_AGAIN.querySelector('button').addEventListener('click', ()=>{
    //Clear the previous board
    CELLS.forEach((cell) => {
        cell.querySelector('text').textContent = '';
    });
    game.reset();
    MODAL.showModal();
    PLAY_AGAIN.close();
});

//Setting up beh aviour for all the cells
const CELLS = document.querySelectorAll('.cell');
CELLS.forEach((cell) => {
    cell.addEventListener('click', () =>{
        //Set the text
        cell.querySelector('text').textContent = 
            game.currentPlayer.makeMove(
                cell.getAttribute('data-row'),
                cell.getAttribute('data-col'))
        ;
    });
})

const RESET = document.querySelector('#reset');
RESET.addEventListener('click',()=>{
    //Clear the previous board
    CELLS.forEach((cell) => {
        cell.querySelector('text').textContent = '';
    });

    game.reset();

    MODAL.showModal();
});

const gameboard = (function(GRID){
    let array = [];

    //Function to place pieces in the board
    function placePiece(piece,row,col){
        if(row > GRID || col > GRID) throw new Error('Attempting to enter a piece outside of game board boundaries');
        if(array[row-1][col-1] != undefined) throw new Error('Piece already exists here');
        array[row-1][col-1] = piece;

        return true; //Returns true if successful
    }

    //Function to place pieces in the board
    function removePiece(row, col){
        if(row > GRID || col > GRID) throw new Error('Attempting to enter a piece outside of game board boundaries');

        array[row-1][col-1] = undefined;
    }

    function getPiece(row,col){
        if(row > GRID || col > GRID) throw new Error('Attempting to enter a piece outside of game board boundaries');
        return array[row-1][col-1];
    }

    //Function to clear the board;
    function clear(){
        array.length = 0;
        
        for(i=0; i< GRID;i++){
            array.push([]);
            for(j=0; j< GRID; j++)
                array[i].push(undefined);
        }
    }

    clear();
    return {array, placePiece, removePiece, getPiece, clear};
})(GRID);

const game = (function(){
    let players = [];
    let currentPlayer;
    //Initialize the game

    const reset = () =>{
        //Clearing the board related things
        gameboard.clear();
        players.length = 0;
        currentPlayer = undefined;
    };

    const start = (player1,player2) => {
        reset();
        players.push(player1,player2);

        nextMove();
    };

    //Request the next player to make their move
    const nextMove = () => {
        //Get the current player
        currentPlayer = players.shift();
        players.push(currentPlayer);

        //Request the player to make a move
        //TODO: If human, re-enable buttons
        //TODO: If CPU, automatically pick
        currentPlayer.requestMove();
    };

    function endGame(player){
        setTimeout( 
            () => {
                if(player == null){
                    alert('Game is over! It was a tie');
                } else {
                    alert('Game is over! ' + currentPlayer.name + " has won!")}
                PLAY_AGAIN.showModal();
            }, 10
        );
    }

    function makeMove(player,row, col){
        //First check to see if the player that made the move is the same as the current active player allowed to do something
        if(player != currentPlayer){
            alert('Wrong player is making a move!');
            return;
        }

        //If they are then try to add the move to the board
        gameboard.placePiece(player.piece,row,col);

        //Check to see if there is a winner
        //Check rows
        for(currCol = 1; currCol <= GRID; currCol++){
            if (gameboard.array[row-1][currCol-1] != player.piece) break; //No point continuing to check if piece is wrong
            if(currCol!=3) continue; //Don't bother changing gameEnded unless we've searched the whole row

            endGame(player); //If it got this far then the game is over and the current player has won.
            return;
        }

        //Check columns
        for(currRow = 1; currRow <= GRID; currRow++){
            if (gameboard.array[currRow-1][col-1] != player.piece) break; 
            if(currRow!=3) continue;

            endGame(player);
            return;
        }
        
        //Check '\' diagonal (if applicable)
        if(row == col){
            for(i = 1; i<= GRID; i++){
                if (gameboard.array[i-1][i-1] != player.piece) break; 
                if(i!=3) continue;
    
                endGame(player);
                return;                
            }
        }

        //Check '/' diagonal (if applicable)
        if(GRID-row+1 == col){
            for(i = 1; i<= GRID; i++){
                if (gameboard.array[GRID-i][i-1] != player.piece) break; 
                if(i!=3) continue;
    
                endGame(player);
                return;                
            }
        }

        //If it has gotten this far then check to see if its a tie (no moves remaining)
        let tie = true;
        for(i = 0; i< GRID; i++){
            for(j = 0; j< GRID; j++){
                if(gameboard.array[i][j] == undefined){
                    tie = false;
                    break;
                }
            }
            if(!tie) break;
        }

        if(tie){
            endGame(null);
            return;
        };

        //Once their move has been made, request the next player to make their move
        nextMove();
    }

    return { 
        get currentPlayer(){return currentPlayer;},
        players, 
        start, 
        reset, 
        makeMove};
})();

//Factory function to make a player
const makePlayer = (name,piece) => {
    let score = 0;

    const incrementScore = () => score++;
    const resetScore = () => score = 0;

    function requestMove(){
        //TODO: //When requestMove is called, the buttons are re-enabled for the player to click
        //For now, it just shows an input asking where the player wants to placce their piece
        console.log("It is now " + name + "'s turn.")
        console.log(gameboard.array);

        BLOCKER.close();
        
        //makeMove.call(this);
    }

    function makeMove(row, col){
        if(row == undefined || col == undefined){
            let valid = false;
            while(!valid){
                row = parseInt(prompt("Which row to place?"));
                col = parseInt(prompt("Which col to place?"));
                console.log("Attempting to place in row" + row + " and column " + col);
                valid = (gameboard.array[row-1][col-1] == undefined)
            }
        }
        game.makeMove(this,row,col);
        return this.piece;
    }


    return {name, piece, incrementScore, resetScore, requestMove, makeMove}
};

//Factory to make a computer controlled player
const makeCPUPlayer = (name,piece) => {
    const {incrementScore, resetScore, makeMove} = makePlayer(name,piece);

    function requestMove(){

        //Blocker is enabled if its the CPU's turn
        BLOCKER.showModal();
        //CPU randomly picks choices until one is valid

        console.log("It is now " + name + "'s turn.")
        console.log(gameboard.array);

        let row, col;
        let valid = false;
        while(!valid){
            row = Math.floor(Math.random()*GRID+1);
            col = Math.floor(Math.random()*GRID+1);
            console.log("Attempting to place in row" + row + " and column " + col);
            valid = (gameboard.array[row-1][col-1] == undefined)
        }

        //Adding a timeout of 1 second just so its not instant
        setTimeout(()=>{
            let cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`)
            cell.click();
            //game.makeMove(this, row, col);
        },1000);
    }

    return {name, piece, incrementScore, resetScore, requestMove, makeMove};
}

