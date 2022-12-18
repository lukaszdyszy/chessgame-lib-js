export const START_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const isUpperCase = char => (char.charCodeAt(0) >= 65 && char.charCodeAt(0) <= 90);

class Chessgame {

	board = [
		['r','n','b','q','k','b','n','r'],
		['p','p','p','p','p','p','p','p'],
		['','','','','','','',''],
		['','','','','','','',''],
		['','','','','','','',''],
		['','','','','','','',''],
		['P','P','P','P','P','P','P','P'],
		['R','N','B','Q','K','B','N','R']
	];

	candidates = {
		white: [],
		black: []
	};

	// current turn, true - white, false - black
	turn = true;

	// are castles possible
	castle_k = true;
	castle_q = true;
	castle_K = true;
	castle_Q = true;

	// halfmoves since last taking or pawn's move
	halfmoves = 0;

	// move number
	moves = 1;

	// enpassant field
	enpassant = '-';

	// pawn waiting for promotion
	promotion = '';

	constructor(FEN = null) {
		if(FEN) this.loadFEN(FEN);
		this.calculateCandidates();
		this.verifyCandidates();
	}

	promote(piece) {
		if(this.turn) {
			piece = piece.toLowerCase();
		} else {
			piece = piece.toUpperCase();
		}
		const [row, col] = this.getCoordsByName(this.promotion);
		this.board[row][col] = piece;
	}

	makeMove(move) {
		if(this.promotion !== '') return false;
		// parse castles
		if(['Ke1-g1', 'Ke8-g8'].includes(move)) move = 'O-O';
		if(['Ke1-c1', 'Ke8-c8'].includes(move)) move = 'O-O-O';

		if (this.candidates[this.turn ? 'white' : 'black'].indexOf(move) === -1) return false;

		// castles
		if(move === 'O-O') {
			if(this.turn) {
				this.movePiece('Ke1-g1');
				this.movePiece('Rh1-f1');
				this.castle_K = false;
				this.castle_Q = false;
			} else {
				this.movePiece('Ke8-g8');
				this.movePiece('Rh8-f8');
				this.castle_k = false;
				this.castle_q = false;
			}
		}
		if(move === 'O-O-O') {
			if(this.turn) {
				this.movePiece('Ke1-c1');
				this.movePiece('Ra1-d1');
				this.castle_K = false;
				this.castle_Q = false;
			} else {
				this.movePiece('Ke8-c8');
				this.movePiece('Ra8-d8');
				this.castle_k = false;
				this.castle_q = false;
			}
		}

		const from = move.split('-');

		if(from === 'Ra1') this.castle_Q = false;
		if(from === 'Rh1') this.castle_K = false;
		if(from === 'Ra8') this.castle_q = false;
		if(from === 'Rf8') this.castle_k = false;
		if(move[0] === 'K' && this.turn) {
			this.castle_K = false;
			this.castle_Q = false;
		}
		if(move[0] === 'K' && !this.turn) {
			this.castle_k = false;
			this.castle_q = false;
		}
		
		console.log(move);
		const [p, f, t] = this.moveToArray(move);
		// console.log(p, f, t);

		// enpassants
		const prevEnpassant = this.enpassant;
		if(p === 'p' && f[1] === '7' && t[1] === '5') {
			this.enpassant = `${f[0]}6`;
		}else if(p === 'P' && f[1] === '2' && t[1] === '4') {
			this.enpassant = `${f[0]}3`;
		} else {
			this.enpassant = '-';
		}

		// promotion
		if((p === 'p' && t[1] === '1') || (p === 'P' && t[1] === '8')) {
			this.promotion = t;
		}
		
		// count halmoves
		if(p === 'p' || p === 'P' || this.getFieldByName(t) !== '') {
			this.halfmoves = 0;
		} else {
			this.halfmoves++;
		}

		// count moves
		if(!this.turn) this.moves++;

		this.movePiece(move);
		if(t === prevEnpassant) {
			let from = this.getCoordsByName(f);
			let to = this.getCoordsByName(t);
			this.board[from[0]][to[1]] = '';
		}
		this.turn = !this.turn;
		

		this.calculateCandidates();
		this.verifyCandidates();

		return true;
	}

	moveToArray(move) {
		// console.log(move);
		let [from, to] = move.split('-');
		// console.log(from, to)
		
		if(isUpperCase(from[0])) from = from.substring(1);
		const piece = this.getFieldByName(from);
		// console.log(piece, from, to);

		return [piece, from, to];
	}

	calculateCandidates() {
		const candidates = {
			white: [],
			black: []
		}

		this.board.map((row, rowId) => {
			row.map((el, colId) => {
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
						if(this.isOnBoard(dest) && (this.isWhite(this.getFieldByVector(dest)) || (this.getNameByCoords(dest)) === this.enpassant)) addCand();

						// [1, -1] - take
						dest = this.sumVectors(originalPosition, [1, -1]);
						if(this.isOnBoard(dest) && (this.isWhite(this.getFieldByVector(dest)) || (this.getNameByCoords(dest)) === this.enpassant)) addCand();
						
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
						if(this.isOnBoard(dest) && (this.isBlack(this.getFieldByVector(dest)) || (this.getNameByCoords(dest)) === this.enpassant)) addCand();

						// [-1, -1] - take
						dest = this.sumVectors(originalPosition, [-1, -1]);
						if(this.isOnBoard(dest) && (this.isBlack(this.getFieldByVector(dest)) || (this.getNameByCoords(dest)) === this.enpassant)) addCand();


						
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

						break;

					case 'n':
					case 'N':
						checkMove([2, 1]);
						checkMove([2, -1]);
						checkMove([-2, 1]);
						checkMove([-2, -1]);
						checkMove([1, 2]);
						checkMove([1, -2]);
						checkMove([-1, 2]);
						checkMove([-1, -2]);
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
						cand.split('-')[1] === 'g8' ||
						cand.split('-')[1] === 'e8'
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
						cand.split('-')[1] === 'd8' ||
						cand.split('-')[1] === 'e8' 
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
						cand.split('-')[1] === 'g1' ||
						cand.split('-')[1] === 'e1'
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
						cand.split('-')[1] === 'd1' ||
						cand.split('-')[1] === 'e1'
					) {
						return cand;
					}
				}).filter(Boolean);

				if(dealbreaks.length === 0) {
					candidates.white.push('O-O-O');
				}
		}

		this.candidates = candidates;
	}

	// exclude moves that leads to check
	verifyCandidates() {
		let cands = [...this.candidates[this.turn ? 'white' : 'black']];
		let originalBoard = this.board.map(arr => arr.slice());
		let originalCandidates = JSON.stringify(this.candidates);
		
		// console.log('----------------------------------------------------');
		cands.map(mv => {
			this.movePiece(mv);

			this.calculateCandidates();
			if(this.isCheck()) {
				this.candidates = JSON.parse(originalCandidates);
				this.candidates[this.turn ? 'white' : 'black'].splice(
					this.candidates[this.turn ? 'white' : 'black'].indexOf(mv), 
					1
				);
				originalCandidates = JSON.stringify(this.candidates);
			}

			this.board = originalBoard.map(arr => arr.slice());
			this.candidates = JSON.parse(originalCandidates);
		});
	}

	movePiece(move) {
		let [piece, from, to] = this.moveToArray(move);

		const fromCoords = this.getCoordsByName(from);
		const toCoords = this.getCoordsByName(to);
		this.board[fromCoords[0]][fromCoords[1]] = '';
		this.board[toCoords[0]][toCoords[1]] = piece;
	}

	isCheck() {
		const moves = [...this.candidates[!this.turn ? 'white' : 'black']];
		let kingPos = '';
		this.board.forEach((row, rowid) => {
			row.forEach((col, colid) => {
				if(col === (this.turn ? 'K' : 'k')) kingPos = this.getNameByCoords([rowid, colid]);
			});
		});
		
		const checking = moves.filter(move => move.split('-')[1] === kingPos);

		if(checking.length === 0) return false;
		return true;
	}

	isMate() {
		return this.isCheck() && this.candidates[this.turn ? 'white' : 'black'].length === 0;
	}

	getFEN() {
		let fen = '';

		this.board.map((row, rowId) => {
			let blanks = 0;

			row.map(field => {
				if(field !== '') {
					if(blanks > 0) {
						fen += blanks;
						blanks = 0;
					}
					fen += field;
				} else {
					blanks++;
				}
			})

			if(blanks > 0) fen += blanks;
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
		// console.log(name);
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