const GRID = 3;

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
        
        // for(i = 0; i<array.length; i++)
        //     for(j = 0; j< array[i].length ; j++)
        //         array[i][j] = undefined;
    }

    clear();
    return {array, placePiece, removePiece, getPiece, clear};
})(GRID);

const game = (function(){
    let players = [];
    let currentPlayer;
    //Initialize the game

    function start(player1,player2){
        players.push(player1,player2);

        nextMove();
    }

    //Request the next player to make their move
    function nextMove(){
        //Get the current player
        currentPlayer = players.shift();
        players.push(currentPlayer);

        //Request the player to make a move
        //TODO: If human, re-enable buttons
        //TODO: If CPU, automatically pick
        currentPlayer.requestMove();
    }

    function endGame(player){
        if(player == null){
            alert('Game is over! It was a tie');
        } else {
            alert('Game is over! ' + currentPlayer.name + " has won!");
        }
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
        for(currCol = 1; currCol < GRID; currCol++){
            if (gameboard.array[row-1][currCol-1] != player.piece) break; //No point continuing to check if piece is wrong
            if(currCol!=3) continue; //Don't bother changing gameEnded unless we've searched the whole row

            endGame(player); //If it got this far then the game is over and the current player has won.
            return;
        }

        //Check columns
        for(currRow = 1; currRow < GRID; currRow++){
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

    return {start, makeMove};
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
        let row, col;
        
        let valid = false;
        while(!valid){
            row = parseInt(prompt("Which row to place?"));
            col = parseInt(prompt("Which col to place?"));
            console.log("Attempting to place in row" + row + " and column " + col);
            valid = (gameboard.array[row-1][col-1] == undefined)
        }
        
        game.makeMove(this, row,col);
    }


    return {name, piece, incrementScore, resetScore, requestMove}
};

//Factory to make a computer controlled player
const makeCPUPlayer = (name,piece) => {
    const {incrementScore, resetScore} = makePlayer(name,piece);

    function requestMove(){
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

        game.makeMove(this, row, col);
    }

    return {name, piece, incrementScore, resetScore, requestMove};
}

//Testing the code
let player1 = makePlayer('henry','x');
let player2 = makeCPUPlayer('CPU','o');
game.start(player1,player2);