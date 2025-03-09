import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { applets } from '@web-applets/sdk';

const self = applets.register();

interface CrosswordCell {
  value: string;
  isBlack: boolean;
  number?: number;
}

const SOLUTION = [
  ['#', '#', '#', 'b', 'a', 'm'],
  ['o', 'h', 'b', 'a', 'b', 'y'],
  ['d', 'o', 'u', 'b', 'l', 'e'],
  ['d', 'e', 'c', 'k', 'e', 'r'],
  ['#', '#', '#', 'a', 'd', 's'],
];

const NUMBER_POSITIONS = [
  [0, 0, 0, 1, 2, 3],
  [4, 5, 6, 0, 0, 0],
  [7, 0, 0, 0, 0, 0],
  [8, 0, 0, 0, 0, 0],
  [0, 0, 0, 9, 0, 0],
];

const WORDS = [
  {
    index: 1,
    direction: 'across',
    clue: 'Sound of hard impact',
    answer: 'bam',
  },
  {
    index: 4,
    direction: 'across',
    clue: 'Hoo-wee!',
    answer: 'ohbaby',
  },
  {
    index: 7,
    direction: 'across',
    clue: 'With 8-Across, kind of bus associated with London',
    answer: 'double',
  },
  {
    index: 8,
    direction: 'across',
    clue: 'See 7-Across',
    answer: 'decker',
  },
  {
    index: 9,
    direction: 'across',
    clue: `Sponsored posts in one's newsfeed, e.g.`,
    answer: 'ads',
  },
  {
    index: 1,
    direction: 'down',
    clue: 'Dessert described as "half-bread, half-cake"',
    answer: 'babka',
  },
  {
    index: 2,
    direction: 'down',
    clue: 'Having a full range of physical or mental abilities',
    answer: 'abled',
  },
  {
    index: 3,
    direction: 'down',
    clue: 'Mike who played Austin Powers',
    answer: 'myers',
  },
  {
    index: 4,
    direction: 'down',
    clue: 'Quirky',
    answer: 'odd',
  },
  {
    index: 5,
    direction: 'down',
    clue: 'Garden tool used for weeding',
    answer: 'hoe',
  },
  {
    index: 6,
    direction: 'down',
    clue: 'Tampa Bay football player, for short',
    answer: 'buc',
  },
];

const WORDS_ACROSS = WORDS.filter((w) => w.direction === 'across');
const WORDS_DOWN = WORDS.filter((w) => w.direction === 'down');

const ROWS = SOLUTION.length;
const COLS = SOLUTION[0].length;

const CrosswordGame: React.FC = () => {
  const [grid, setGrid] = useState<CrosswordCell[][]>(() =>
    SOLUTION.map((row, i) =>
      row.map((cell, j) => ({
        value: '',
        isBlack: cell === '#',
        number: NUMBER_POSITIONS[i][j] || undefined,
      }))
    )
  );

  self.data = {
    instructions:
      'IMPORTANT: Your job is to help, not reveal answers. If the user asks for help, give at least three hints before revealing the answer, but only reveal one at a time. If the user guesses right, then fill it in.',
    grid,
    words: WORDS,
  };

  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
    null
  );
  const [highlightMode, setHighlightMode] = useState<'row' | 'column' | null>(
    null
  );
  const gridRefs = useRef<(HTMLInputElement | null)[][]>(
    Array(COLS)
      .fill(null)
      .map(() => Array(ROWS).fill(null))
  );

  const resetPuzzle = () => {
    setGrid(
      SOLUTION.map((row, i) =>
        row.map((cell, j) => ({
          value: '',
          isBlack: cell === '#',
          number: NUMBER_POSITIONS[i][j] || undefined,
        }))
      )
    );
    setSelectedCell(null);
    setHighlightMode(null);
    toast.success('Puzzle reset!');
  };

  const findNextEmptyCell = (startRow: number, startCol: number) => {
    if (highlightMode === 'row') {
      for (let j = startCol + 1; j < ROWS; j++) {
        if (!grid[startRow][j].isBlack && !grid[startRow][j].value) {
          return [startRow, j];
        }
      }
    } else if (highlightMode === 'column') {
      for (let i = startRow + 1; i < COLS; i++) {
        if (!grid[i][startCol].isBlack && !grid[i][startCol].value) {
          return [i, startCol];
        }
      }
    }
    return null;
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    if (value.length > 1) return;

    setGrid((prev) => {
      const newGrid = [...prev];
      newGrid[row] = [...newGrid[row]];
      newGrid[row][col] = {
        ...newGrid[row][col],
        value: value.toLowerCase(),
      };
      return newGrid;
    });

    if (!grid[row][col].value) {
      const nextCell = findNextEmptyCell(row, col);
      if (nextCell) {
        const [nextRow, nextCol] = nextCell;
        gridRefs.current[nextRow][nextCol]?.focus();
        setSelectedCell([nextRow, nextCol]);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (e.key === 'Tab' || e.key === 'Enter') return;

    if (e.key === 'ArrowRight' && col < 4) {
      gridRefs.current[row][col + 1]?.focus();
    } else if (e.key === 'ArrowLeft' && col > 0) {
      gridRefs.current[row][col - 1]?.focus();
    } else if (e.key === 'ArrowUp' && row > 0) {
      gridRefs.current[row - 1][col]?.focus();
    } else if (e.key === 'ArrowDown' && row < 4) {
      gridRefs.current[row + 1][col]?.focus();
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (selectedCell?.[0] === row && selectedCell?.[1] === col) {
      setHighlightMode((prev) => (prev === 'row' ? 'column' : 'row'));
    } else {
      setSelectedCell([row, col]);
      setHighlightMode('row');
    }
  };

  const updateRow = (rowIndex: number, newValues: Array<String>) => {
    return grid.map((row, i) =>
      row.map((cell, j) => {
        return {
          value: i === rowIndex ? newValues[j] ?? cell.value : cell.value,
          isBlack: cell.isBlack,
          number: cell.number,
        };
      })
    );
  };

  const isHighlighted = (i: number, j: number) => {
    if (!selectedCell) return false;
    const [selectedRow, selectedCol] = selectedCell;

    if (highlightMode === 'row') {
      return i === selectedRow;
    } else if (highlightMode === 'column') {
      return j === selectedCol;
    }
    return false;
  };

  interface IFillAction {
    direction: 'across' | 'down';
    num: number;
    value: string;
  }

  self.defineAction('fill', {
    name: 'Fill',
    description: 'Fill in a crossword cell',
    params_schema: {
      type: 'object',
      properties: {
        value: {
          type: 'string',
        },
        direction: {
          type: 'string',
        },
        num: {
          type: 'integer',
        },
      },
      required: ['value', 'direction', 'num'],
      description: 'The value to be filled in the given slot',
    },
  });

  self.setActionHandler('fill', ({ direction, num, value }: IFillAction) => {
    const isValidFill = (
      direction: 'across' | 'down',
      num: number,
      value: string
    ) => {
      const word = WORDS.find(
        (w) => w.direction === direction && w.index === num
      );
      return word ? word.answer === value : false;
    };

    if (!isValidFill(direction, num, value)) {
      // TODO: Return error here
      return;
    }

    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) => row.map((cell) => ({ ...cell })));

      // Find the starting position of the clue
      let startRow = -1;
      let startCol = -1;
      for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
          if (NUMBER_POSITIONS[i][j] === num) {
            startRow = i;
            startCol = j;
            break;
          }
        }
        if (startRow !== -1) break;
      }

      if (startRow === -1 || startCol === -1) return prevGrid; // Invalid clue number

      // Fill the word with the provided value
      if (direction === 'across') {
        let col = startCol;
        for (
          let k = 0;
          k < value.length && col < COLS && !newGrid[startRow][col].isBlack;
          k++, col++
        ) {
          newGrid[startRow][col].value = value[k];
        }
      } else if (direction === 'down') {
        let row = startRow;
        for (
          let k = 0;
          k < value.length && row < ROWS && !newGrid[row][startCol].isBlack;
          k++, row++
        ) {
          newGrid[row][startCol].value = value[k];
        }
      }

      return newGrid;
    });
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-4xl w-full space-y-8 animate-fade-in">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-4">Across</h3>
            {Object.entries(WORDS_ACROSS).map(([number, word]) => (
              <div key={`across-${number}`} className="mb-2">
                <span className="font-medium mr-2">
                  {parseInt(number) + 1}.
                </span>
                {word.clue}
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-4">Down</h3>
            {Object.entries(WORDS_DOWN).map(([number, word]) => (
              <div key={`down-${number}`} className="mb-2">
                <span className="font-medium mr-2">
                  {parseInt(number) + 1}.
                </span>
                {word.clue}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-6 gap-px bg-crossword-border p-px">
            {grid.map((row, i) =>
              row.map((cell, j) => (
                <div key={`${i}-${j}`} className="relative bg-crossword-cell">
                  {cell.number && (
                    <span className="absolute top-0.5 left-0.5 text-xs">
                      {cell.number}
                    </span>
                  )}
                  {cell.isBlack ? (
                    <div className="w-12 h-12 bg-crossword-black" />
                  ) : (
                    <input
                      ref={(el) => (gridRefs.current[i][j] = el)}
                      type="text"
                      value={cell.value}
                      onChange={(e) => handleCellChange(i, j, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, i, j)}
                      onClick={() => handleCellClick(i, j)}
                      className={`w-12 h-12 text-center text-lg font-medium focus:outline-none
                        ${isHighlighted(i, j) ? 'bg-crossword-highlight' : ''}`}
                      maxLength={1}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={resetPuzzle}
            className="px-6 py-2 bg-destructive text-white bg-slate-600 rounded-md
              hover:bg-opacity-90 transition-colors duration-200 animate-slide-up"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrosswordGame;
