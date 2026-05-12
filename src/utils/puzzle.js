export function getPuzzleGrid(pieceCount) {
  const gridMap = {
    2: { cols: 2, rows: 1 },
    4: { cols: 2, rows: 2 },
    6: { cols: 3, rows: 2 },
    8: { cols: 4, rows: 2 },
    10: { cols: 5, rows: 2 },
    12: { cols: 4, rows: 3 },
    16: { cols: 4, rows: 4 },
    20: { cols: 5, rows: 4 },
  }

  return gridMap[pieceCount] ?? gridMap[4]
}

export function createPuzzlePieces(pieceCount) {
  const { cols, rows } = getPuzzleGrid(pieceCount)

  const pieces = []

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const id = row * cols + col

      pieces.push({
        id,
        row,
        col,
        correctX: col,
        correctY: row,
        currentX: col,
        currentY: row,
        locked: false,
      })
    }
  }

  return pieces
}

export function shufflePieces(pieces) {
  const positions = pieces.map((piece) => ({
    currentX: piece.currentX,
    currentY: piece.currentY,
  }))

  const shuffled = [...positions].sort(() => Math.random() - 0.5)

  return pieces.map((piece, index) => ({
    ...piece,
    currentX: shuffled[index].currentX,
    currentY: shuffled[index].currentY,
    locked: false,
  }))
}