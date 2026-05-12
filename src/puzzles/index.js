import SquarePuzzle from "./square/SquarePuzzle"
import ClassicPuzzle from "./classic/ClassicPuzzle"

export function getPuzzleComponent(puzzleType) {
  if (puzzleType === "classic") return ClassicPuzzle

  return SquarePuzzle
}