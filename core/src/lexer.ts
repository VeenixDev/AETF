enum Tokens {
	IDENTIFIER = 'IDENTIFIER',
	RESOURCE = 'RESOURCE',
	IMPORT = 'IMPORT',

	NUMBER = 'NUMBER',
	STRING = 'STRING',
	QUESTION_MARK = 'QUESTION_MARK',
	DOT = 'DOT',

	OPEN_PAREN = 'OPEN_PAREN',
	CLOSE_PAREN = 'CLOSE_PAREN',
	OPEN_CURLY = 'OPEN_CURLY',
	CLOSE_CURLY = 'CLOSE_CURLY',
	OPEN_BRACKET = 'OPEN_BRACKET',
	CLOSE_BRACKET = 'CLOSE_BRACKET',
}

type Position = {
	line: number;
	column: number;
	index: number;
};

type Token = {
	type: Tokens;
	value: string;
	start: Position;
	end: Position;
};

class Lexer {
	private source: string;
	private position: Position;
	private readonly tokens: Token[];
	private keywords: Map<string, Tokens>;

	constructor(source: string) {
		this.source = source;
		this.position = { line: 1, column: 0, index: 0 };
		this.tokens = [];
		this.keywords = this.initializeKeywords();
	}

	private initializeKeywords() {
		const keywords = new Map<string, Tokens>();

		keywords.set('resource', Tokens.RESOURCE);
		keywords.set('import', Tokens.IMPORT);

		return keywords;
	}

	private peek(amount: number = 1): string {
		if (this.position.index + amount > this.source.length) {
			return this.source.substring(this.position.index);
		}
		return this.source.substring(
			this.position.index,
			this.position.index + amount
		);
	}

	private advance(): void {
		this.movePosition(1);
	}

	private movePosition(amount: number): void {
		this.position.column += amount;
		this.position.index += amount;
	}

	private skipWhitespaces(): boolean {
		let skippedWhitespaces = false;

		const whitespaceChars = [' ', '\t', '\n', '\r'];
		let nextChar = this.peek();
		let newLine = this.position.line;
		let newIndex = this.position.index;
		let newColumn = this.position.column;
		while (
			(nextChar = this.peek()) !== null &&
			whitespaceChars.includes(nextChar)
		) {
			skippedWhitespaces = true;
			if (nextChar === '\n') {
				newLine += 1;
				newColumn = 0;
			} else {
				newColumn += 1;
			}
			newIndex += 1;

			this.position = {
				line: newLine,
				column: newColumn,
				index: newIndex,
			};
		}

		return skippedWhitespaces;
	}

	private isAlpha(char: string): boolean {
		const charCode = char.charCodeAt(0);
		return (
			(charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122)
		);
	}

	private isNumeric(char: string): boolean {
		const charCode = char.charCodeAt(0);
		return (
			(charCode >= 48 && charCode <= 57) || ['.', 'e', 'b', 'x'].includes(char)
		);
	}

	private isAlphaNumeric(char: string): boolean {
		return this.isAlpha(char) || this.isNumeric(char);
	}

	private readIdentifier(): Token {
		const startPosition = { ...this.position };
		let identifier = '';

		let next: string = '';
		while ((next = this.peek()) !== '') {
			if (this.isAlphaNumeric(next) || next === '_') {
				identifier += next;
				this.advance();
			} else {
				break;
			}
		}

		return {
			start: startPosition,
			end: { ...this.position },
			type: this.keywords.get(identifier) ?? Tokens.IDENTIFIER,
			value: identifier,
		};
	}

	public lex(): Token[] {
		while (this.position.index < this.source.length) {
			this.skipWhitespaces();
			const char = this.peek();

			if (this.isAlpha(char)) {
				this.tokens.push(this.readIdentifier());
			}
		}

		return this.tokens;
	}
}

export { Lexer, Tokens };
export type { Position, Token };
