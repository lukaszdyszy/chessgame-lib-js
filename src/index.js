const START_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

class Chessgame {
	constructor(FEN = START_POSITION) {
		// init board
		this.board = [
			['r','n','b','q','k','b','n','r'],
			['p','p','p','p','p','p','p','p'],
			['','','','','','','',''],
			['','','','','','','',''],
			['','','','','','','',''],
			['','','','','','','',''],
			['P','P','P','P','P','P','P','P'],
			['R','N','B','Q','K','B','N','R']
		];

		this.loadFEN(FEN);

		// current turn, true - white, false - black
		this.turn = true;

		// are castles possible
		this.castle_k = true;
		this.castle_q = true;
		this.castle_K = true;
		this.castle_Q = true;

		// halfmoves since last taking or pawn's move
		this.halfmoves = 0;

		// move number
		this.moves = 1;

		// enpassant field
		this.enpassant = '-';
	}

	makeMove(from, to) {
		from = from.toUpperCase();
		to = to.toUpperCase();
		let piece = this.board[8-(+(from[1]))][from.charCodeAt(0)-65];

		if(piece === '') return false;
		

		console.log(piece);
	}

	getFEN() {
		let fen = '';

		this.board.map((row, rowId) => {
			let blanks = 0;

			for (let i = 0; i < row.length; i++) {
				if(row[i] != '') {
					fen += row[i];
					continue;
				}

				while (i < row.length && row[i] === '') {
					blanks++;
					i++;
				}
				fen += blanks;
			}

			if(rowId < this.board.length-1) fen += '/';
		});

		fen += ` ${
			this.turn ? 'w' : 'b'
		} ${
			this.castle_K ? 'K' : ''
		}${
			this.castle_Q ? 'Q' : ''
		}${
			this.castle_k ? 'k' : ''
		}${
			this.castle_q ? 'q' : ''
		}${
			(!this.castle_k && !this.castle_q && !this.castle_K && !this.castle_Q) ? '-' : ''
		} ${this.enpassant} ${this.halfmoves} ${this.moves}`;

		return fen;
	}

	loadFEN(FEN) {
		const newBoard = [];

		const [ pieces, turn, castles, enpassant, halfmoves, moves ] = FEN.split(' ');

		// load pieces to the board
		pieces.split('/').forEach((row, rowId) => {
			const boardRow = [];

			row.split('').forEach(el => {
				
				if(parseInt(el)) {
					// if empty field
					for (let i = 0; i < parseInt(el); i++) {
						boardRow.push('');
					}
				} else {
					// if piece
					boardRow.push(el);
				}

			});

			newBoard.push(boardRow);
		});
		this.board = newBoard;

		// current turn
		this.turn = (turn === 'w');

		// castles possibilities
		this.castle_k = false;
		this.castle_q = false;
		this.castle_K = false;
		this.castle_Q = false;
		castles.split('').forEach(el => {
			switch (el) {
				case 'K':
					this.castle_K = true;
					break;
				case 'Q':
					this.castle_Q = true;
					break;
				case 'k':
					this.castle_k = true;
					break;
				case 'q':
					this.castle_q = true;
					break;
				default:
					break;
			}
		});

		// the rest
		this.enpassant = enpassant;
		this.halfmoves = halfmoves;
		this.moves = moves;
	}
}

export default Chessgame;