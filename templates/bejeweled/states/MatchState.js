import BaseState from './BaseState.js';
import EliminateChess from '../actions/EliminateChess.js';
import FallingAllChess from '../actions/FallingAllChess.js';

const GetValue = Phaser.Utils.Objects.GetValue;
const SetStruct = Phaser.Structs.Set;

class State extends BaseState {
    constructor(parent, config) {
        super(parent, config);
        // this.parent = parent;            // Bejeweled
        // this.board = parent.board;       // Bejeweled.board

        this.totalMatchedLinesCount = 0;
        this.eliminatedChessArray;

        // Actions
        // Eliminating action
        this.eliminatingAction = GetValue(config, 'eliminatingAction', EliminateChess);
        // on falling chess
        this.fallingAction = GetValue(config, 'fallingAction', FallingAllChess);

        var debug = GetValue(config, 'debug', false);
        if (debug) {
            this.on('statechange', this.printState, this);
        }
    }

    shutdown() {
        super.shutdown();

        this.eliminatedChessArray = undefined;
        // Actions
        this.eliminatingAction = undefined;
        this.fallingAction = undefined;
        return this;
    }

    destroy() {
        this.shutdown();
        return this;
    }

    // START
    enter_START() {
        this.totalMatchedLinesCount = 0;

        this.parent.emit('match-start', this.board.board, this.parent);

        this.next();
    }
    next_START() {
        return 'MATCH3';
    }
    // START

    // MATCH3
    enter_MATCH3() {
        var matchedLines = this.board.getAllMatch();

        this.parent.emit('match', matchedLines, this.board.board, this.parent);

        var matchedLinesCount = matchedLines.length;
        this.totalMatchedLinesCount += matchedLinesCount;
        switch (matchedLinesCount) {
            case 0:
                this.eliminatedChessArray = [];
                break;
            case 1:
                this.eliminatedChessArray = matchedLines[0].entries;
                break;
            default:
                // Put all chess to a set
                var newSet = new SetStruct();
                for (var i = 0; i < matchedLinesCount; i++) {
                    matchedLines[i].entries.forEach(function (value) {
                        newSet.set(value);
                    });
                }
                this.eliminatedChessArray = newSet.entries;
                break;
        }
        this.next();
    }
    next_MATCH3() {
        var nextState;
        if (this.eliminatedChessArray.length === 0) {
            nextState = 'END'
        } else {
            nextState = 'ELIMINATING';
        }
        return nextState;
    }
    // MATCH3

    // ELIMINATING
    enter_ELIMINATING() {
        var board = this.board.board,
            chessArray = this.eliminatedChessArray;

        this.parent.emit('eliminate', chessArray, board, this.parent);

        this.eliminatingAction(chessArray, board, this.parent);

        // Remove eliminated chess
        chessArray.forEach(board.removeChess, board);

        // To next state when all completed
        this.next();
    }
    next_ELIMINATING() {
        return 'FALLING';
    }
    exit_ELIMINATING() {
        this.eliminatedChessArray = undefined;
    }
    // ELIMINATING

    // FALLING
    enter_FALLING() {
        var board = this.board.board;

        this.parent.emit('fall', board, this.parent);

        this.fallingAction(board, this.parent);

        // To next state when all completed
        this.next();
    }
    next_FALLING() {
        return 'FILL';
    }
    // FALLING

    // FILL
    enter_FILL() {
        this.board.fill(true); // Fill upper board only

        this.parent.emit('fill', this.board.board, this.parent);

        this.next();
    }
    next_FILL() {
        return 'MATCH3';
    }
    // FILL

    // END
    enter_END() {
        this.parent.emit('match-end', this.board.board, this.parent);

        this.emit('complete');
    }
    // END

    printState() {
        console.log('Match state: ' + this.prevState + ' -> ' + this.state);
    }
}
export default State;