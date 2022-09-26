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

		this.possibleMoves = [];

		this.loadFEN(FEN);

		// current turn, true - white, false - black
		// this.turn = true;

		// // are castles possible
		// this.castle_k = true;
		// this.castle_q = true;
		// this.castle_K = true;
		// this.castle_Q = true;

		// // halfmoves since last taking or pawn's move
		// this.halfmoves = 0;

		// // move number
		// this.moves = 1;

		// // enpassant field
		// this.enpassant = '-';
	}

	makeMove(from, to) {
		console.log(`${from}-${to}`)
		console.log(this.getFieldByName(from));
		// is white or black or empty
		// from = from.toUpperCase();
		// to = to.toUpperCase();
		// let piece = this.board[8-(+(from[1]))][from.charCodeAt(0)-65];
		// if(piece === '') return false;

		// check type of piece

		// is move in the list of moves of this kind of piece

		// is promotion



		

		// this.calculatePossibleMoves();

		return true;
	}

	calculatePossibleMoves() {
		const candidates = {
			white: [],
			black: []
		}

		this.board.map((row, rowId) => {
			row.map((el, colId) => {
				// if(this.turn != this.isWhite(el)) return;
				if(el === '') return;
				
				let originalPosition = [rowId, colId];

				let dest = [0, 0];

				let W = this.isWhite(el);

				const addCand = () => {
					if(this.isOnBoard(dest)) {
						candidates[W ? 'white' : 'black'].push(this.moveToString(
							el, 
							this.getNameByCoords(originalPosition),
							this.getNameByCoords(dest)
						));
					}
				}

				const checkMove = (vector) => {
					dest = this.sumVectors(originalPosition, vector);

					if(!this.isOnBoard(dest)) return false;
					
					if(W && this.isWhite(this.getFieldByVector(dest)) || !W && this.isBlack(this.getFieldByVector(dest))) {
						return false;
					}

					if(W && this.isBlack(this.getFieldByVector(dest)) || !W && this.isWhite(this.getFieldByVector(dest))) {
						addCand();
						return false;
					}

					addCand();
					
					return true;
				}

				switch (el) {
					case 'p':
						// [1, 0] - push pawn
						dest = this.sumVectors(originalPosition, [1, 0]);

						if(this.isOnBoard(dest) && this.getFieldByVector(dest)==='') {
							addCand();

							// [2, 0] - first move
							if(rowId === 1) {
								dest = this.sumVectors(originalPosition, [2, 0]);
								if(this.getFieldByVector(dest)==='') addCand();
							}
						}

						// [1, 1] - take
						dest = this.sumVectors(originalPosition, [1, 1]);
						if(this.isOnBoard(dest) && this.isWhite(this.getFieldByVector(dest))) addCand();

						// [1, -1] - take
						dest = this.sumVectors(originalPosition, [1, -1]);
						if(this.isOnBoard(dest) && this.isWhite(this.getFieldByVector(dest))) addCand();
						
						break;

					case 'P':
						// [-1, 0] - push pawn
						dest = this.sumVectors(originalPosition, [-1, 0]);

						if(this.isOnBoard(dest) && this.getFieldByVector(dest)==='') {
							addCand();

							// [-2, 0] - first move
							if(rowId === 6) {
								dest = this.sumVectors(originalPosition, [-2, 0]);
								if(this.getFieldByVector(dest)==='') addCand();
							}
						}

						// [-1, 1] - take
						dest = this.sumVectors(originalPosition, [-1, 1]);
						if(this.isOnBoard(dest) && this.isBlack(this.getFieldByVector(dest))) addCand();

						// [-1, -1] - take
						dest = this.sumVectors(originalPosition, [-1, -1]);
						if(this.isOnBoard(dest) && this.isBlack(this.getFieldByVector(dest))) addCand();
						
						break;
				
					case 'R':
					case 'r':
						for (let i = 1; i < 8; i++) {
							if(!checkMove([i, 0])) break;
						}

						for (let i = 1; i < 8; i++) {
							if(!checkMove([-i, 0])) break;
						}

						for (let i = 1; i < 8; i++) {
							if(!checkMove([0, i])) break;
						}

						for (let i = 1; i < 8; i++) {
							if(!checkMove([0, -i])) break;
						}

						break;

					case 'b':
					case 'B':
						for (let i = 1; i < 8; i++) {
							if(!checkMove([i, i])) break;
						}

						for (let i = 1; i < 8; i++) {
							if(!checkMove([i, -i])) break;
						}

						for (let i = 1; i < 8; i++) {
							if(!checkMove([-i, i])) break;
						}

						for (let i = 1; i < 8; i++) {
							if(!checkMove([-i, -i])) break;
						}

					case 'n':
					case 'N':
						checkMove([2, 1]);
						checkMove([2, -1]);
						checkMove([-2, 1]);
						checkMove([-2, -1]);
						break;

					case 'q':
					case 'Q':
						for (let i = 1; i < 8; i++) {
							if(!checkMove([i, 0])) break;
						}

						for (let i = 1; i < 8; i++) {
							if(!checkMove([-i, 0])) break;
						}

						for (let i = 1; i < 8; i++) {
							if(!checkMove([0, i])) break;
						}

						for (let i = 1; i < 8; i++) {
							if(!checkMove([0, -i])) break;
						}

						for (let i = 1; i < 8; i++) {
							if(!checkMove([i, i])) break;
						}

						for (let i = 1; i < 8; i++) {
							if(!checkMove([i, -i])) break;
						}

						for (let i = 1; i < 8; i++) {
							if(!checkMove([-i, i])) break;
						}

						for (let i = 1; i < 8; i++) {
							if(!checkMove([-i, -i])) break;
						}

						break;

					case 'k':
					case 'K':
						checkMove([-1, -1]);
						checkMove([-1, 0]);
						checkMove([-1, 1]);
						checkMove([0, -1]);
						checkMove([0, 1]);
						checkMove([1, -1]);
						checkMove([1, 0]);
						checkMove([1, 1]);

						break;
					default:
						break;
				}
			});
		});

		// castles
		if(	this.castle_k &&
			this.getFieldByName('f8') === '' && 
			this.getFieldByName('g8') === '' 
			) {
				const dealbreaks = candidates['white'].map(cand => {
					if(	cand.split('-')[1] === 'f8' ||
						cand.split('-')[1] === 'g8'
					) {
						return cand;
					}
				}).filter(Boolean);

				if(dealbreaks.length === 0) {
					candidates.black.push('O-O');
				}
		}

		if(	this.castle_q &&
			this.getFieldByName('b8') === '' && 
			this.getFieldByName('c8') === '' &&
			this.getFieldByName('d8') === '' 
			) {
				const dealbreaks = candidates.white.map(cand => {
					if(	cand.split('-')[1] === 'b8' ||
						cand.split('-')[1] === 'c8' ||
						cand.split('-')[1] === 'd8' 
					) {
						return cand;
					}
				}).filter(Boolean);

				if(dealbreaks.length === 0) {
					candidates.black.push('O-O-O');
				}
		}

		if(	this.castle_k &&
			this.getFieldByName('f1') === '' && 
			this.getFieldByName('g1') === '' 
			) {
				const dealbreaks = candidates.black.map(cand => {
					if(	cand.split('-')[1] === 'f1' ||
						cand.split('-')[1] === 'g1'
					) {
						return cand;
					}
				}).filter(Boolean);

				if(dealbreaks.length === 0) {
					candidates.white.push('O-O');
				}
		}

		if(	this.castle_q &&
			this.getFieldByName('b1') === '' && 
			this.getFieldByName('c1') === '' &&
			this.getFieldByName('d1') === '' 
			) {
				const dealbreaks = candidates.black.map(cand => {
					if(	cand.split('-')[1] === 'b1' ||
						cand.split('-')[1] === 'c1' ||
						cand.split('-')[1] === 'd1' 
					) {
						return cand;
					}
				}).filter(Boolean);

				if(dealbreaks.length === 0) {
					candidates.white.push('O-O-O');
				}
		}

		console.log(candidates);

		// make a copy of the board
		
		// is check - revert

	}

	isCheck() {

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

	isWhite(field) {
		return (field.charCodeAt(0) >= 65 && field.charCodeAt(0) <= 90);
	}

	isBlack(field) {
		return (field.charCodeAt(0) >= 97 && field.charCodeAt(0) <= 122);
	}

	isOnBoard([y, x]) {
		return y>=0 && y<8 && x>=0 && x<8;
	}

	getFieldByName(name) {
		const [row, col] = this.getCoordsByName(name);
		return this.board[row][col];
	}

	getNameByCoords([y, x]) {
		return `${String.fromCharCode(97+x)}${8-y}`;
	}

	getCoordsByName(name) {
		name = name.toLowerCase();
		return [8-(+name[1]), name.charCodeAt(0) - 97];
	}

	getFieldByVector(vector) {
		return this.board[vector[0]][vector[1]];
	}

	sumVectors(a, b) {
		return a.map((el, index) => {
			return el+b[index];
		});
	}

	moveToString(piece, from, to) {
		return `${(piece.toUpperCase() != 'P') ? piece.toUpperCase() : ''}${from}-${to}`;
	}
}

export default Chessgame;