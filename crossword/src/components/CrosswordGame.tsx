import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { applets } from "@web-applets/sdk";

const context = applets.register();

interface CrosswordCell {
  value: string;
  isBlack: boolean;
  number?: number;
}

const SOLUTION = [
  ["#", "#", "#", "b", "a", "m"],
  ["o", "h", "b", "a", "b", "y"],
  ["d", "o", "u", "b", "l", "e"],
  ["d", "e", "c", "k", "e", "r"],
  ["#", "#", "#", "a", "d", "s"]
];

const ROWS = SOLUTION.length;
const COLS = SOLUTION[0].length;

const CLUES = {
  across: {
    1: "Sound of hard impact",
    4: "Hoo-wee!",
    7: "With 8-Across, kind of bus associated with London",
    8: "See 7-Across",
    9: "Sponsored posts in one's newsfeed, e.g."
  },
  down: {
    1: 'Dessert described as "half-bread, half-cake"',
    2: "Having a full range of physical or mental abilities",
    3: "Mike who played Austin Powers",
    4: "Quirky",
    5: "Garden tool used for weeding",
    6: "Tampa Bay football player, for short"
  }
};

const NUMBER_POSITIONS = [
  [0, 0, 0, 1, 2, 3],
  [4, 5, 6, 0, 0, 0],
  [7, 0, 0, 0, 0, 0],
  [8, 0, 0, 0, 0, 0],
  [0, 0, 0, 9, 0, 0]
];

const CrosswordGame: React.FC = () => {
  const [grid, setGrid] = useState<CrosswordCell[][]>(() =>
    SOLUTION.map((row, i) =>
      row.map((cell, j) => ({
        value: "",
        isBlack: cell === "#",
        number: NUMBER_POSITIONS[i][j] || undefined
      }))
    )
  );

  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
    null
  );
  const [highlightMode, setHighlightMode] = useState<"row" | "column" | null>(
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
          value: "",
          isBlack: cell === "#",
          number: NUMBER_POSITIONS[i][j] || undefined
        }))
      )
    );
    setSelectedCell(null);
    setHighlightMode(null);
    toast.success("Puzzle reset!");
  };

  const findNextEmptyCell = (startRow: number, startCol: number) => {
    if (highlightMode === "row") {
      for (let j = startCol + 1; j < ROWS; j++) {
        if (!grid[startRow][j].isBlack && !grid[startRow][j].value) {
          return [startRow, j];
        }
      }
    } else if (highlightMode === "column") {
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
        value: value.toLowerCase()
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
    if (e.key === "Tab" || e.key === "Enter") return;

    if (e.key === "ArrowRight" && col < 4) {
      gridRefs.current[row][col + 1]?.focus();
    } else if (e.key === "ArrowLeft" && col > 0) {
      gridRefs.current[row][col - 1]?.focus();
    } else if (e.key === "ArrowUp" && row > 0) {
      gridRefs.current[row - 1][col]?.focus();
    } else if (e.key === "ArrowDown" && row < 4) {
      gridRefs.current[row + 1][col]?.focus();
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (selectedCell?.[0] === row && selectedCell?.[1] === col) {
      setHighlightMode((prev) => (prev === "row" ? "column" : "row"));
    } else {
      setSelectedCell([row, col]);
      setHighlightMode("row");
    }
  };

  const updateRow = (rowIndex: number, newValues: Array<String>) => {
    return grid.map((row, i) =>
      row.map((cell, j) => {
        return {
          value: i === rowIndex ? newValues[j] ?? cell.value : cell.value,
          isBlack: cell.isBlack,
          number: cell.number
        };
      })
    );
  };

  const isHighlighted = (i: number, j: number) => {
    if (!selectedCell) return false;
    const [selectedRow, selectedCol] = selectedCell;

    if (highlightMode === "row") {
      return i === selectedRow;
    } else if (highlightMode === "column") {
      return j === selectedCol;
    }
    return false;
  };

  context.onconnect = async () => {
    context.data = {
      grid,
      CLUES
    };
  };

  context.setActionHandler("open", () => {
    context.data = {
      grid,
      CLUES
    };
  });

  interface IFillAction {
    direction: "across" | "down";
    num: number;
    value: string;
  }

  context.defineAction("fill", {
    name: "Fill",
    description: "Fill in a crossword cell",
    params_schema: {
      type: "object",
      properties: {
        value: {
          type: "string"
        },
        direction: {
          type: "string"
        },
        num: {
          type: "integer"
        }
      },
      required: ["value", "direction", "num"],
      description: "The value to be filled in the given slot"
    }
  });

  context.setActionHandler("fill", ({ direction, num, value }: IFillAction) => {
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

      // Fill the word from the solution
      if (direction === "across") {
        let col = startCol;
        while (col < COLS && !newGrid[startRow][col].isBlack) {
          newGrid[startRow][col].value = SOLUTION[startRow][col];
          col++;
        }
      } else if (direction === "down") {
        let row = startRow;
        while (row < ROWS && !newGrid[row][startCol].isBlack) {
          newGrid[row][startCol].value = SOLUTION[row][startCol];
          row++;
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
            {Object.entries(CLUES.across).map(([number, clue]) => (
              <div key={`across-${number}`} className="mb-2">
                <span className="font-medium mr-2">{number}.</span>
                {clue}
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-4">Down</h3>
            {Object.entries(CLUES.down).map(([number, clue]) => (
              <div key={`down-${number}`} className="mb-2">
                <span className="font-medium mr-2">{number}.</span>
                {clue}
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
                        ${isHighlighted(i, j) ? "bg-crossword-highlight" : ""}`}
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
