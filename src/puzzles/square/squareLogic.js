export function getGridByPieceCount(pieceCount, imageWidth, imageHeight) {
  const fallbackMap = {
    2: { cols: 2, rows: 1 },
    4: { cols: 2, rows: 2 },
    6: { cols: 3, rows: 2 },
    8: { cols: 4, rows: 2 },
    10: { cols: 5, rows: 2 },
    12: { cols: 4, rows: 3 },
    16: { cols: 4, rows: 4 },
    20: { cols: 5, rows: 4 },
  }

  if (!imageWidth || !imageHeight) {
    return fallbackMap[pieceCount] ?? fallbackMap[4]
  }

  const options = []

  for (let cols = 1; cols <= pieceCount; cols += 1) {
    if (pieceCount % cols !== 0) continue

    options.push({
      cols,
      rows: pieceCount / cols,
    })
  }

  const scored = options.map((grid) => {
    const pieceWidth = imageWidth / grid.cols
    const pieceHeight = imageHeight / grid.rows
    const pieceRatio = pieceWidth / pieceHeight

    return {
      ...grid,
      score: Math.abs(Math.log(pieceRatio)),
    }
  })

  scored.sort((a, b) => a.score - b.score)

  return scored[0] ?? fallbackMap[pieceCount] ?? fallbackMap[4]
}

function randomBetween(min, max) {
  return min + Math.random() * Math.max(0, max - min)
}

function isOverlapping(a, b, padding = 4) {
  return !(
    a.x + a.width + padding < b.x ||
    b.x + b.width + padding < a.x ||
    a.y + a.height + padding < b.y ||
    b.y + b.height + padding < a.y
  )
}

function getRandomPosition({
  playgroundWidth,
  playgroundHeight,
  pieceWidth,
  pieceHeight,
  placedPieces,
}) {
  const maxX = playgroundWidth - pieceWidth
  const maxY = playgroundHeight - pieceHeight

  let fallback = {
    x: randomBetween(0, maxX),
    y: randomBetween(0, maxY),
  }

  for (let i = 0; i < 60; i += 1) {
    const candidate = {
      x: randomBetween(0, maxX),
      y: randomBetween(0, maxY),
      width: pieceWidth,
      height: pieceHeight,
    }

    const hasOverlap = placedPieces.some((piece) =>
      isOverlapping(candidate, piece)
    )

    if (!hasOverlap) {
      return {
        x: candidate.x,
        y: candidate.y,
      }
    }

    fallback = {
      x: candidate.x,
      y: candidate.y,
    }
  }

  return fallback
}

export function createSquarePieces({
  imageWidth,
  imageHeight,
  pieceCount,
  playgroundWidth,
  playgroundHeight,
  answerX,
  answerY,
}) {
  const { cols, rows } = getGridByPieceCount(
  pieceCount,
  imageWidth,
  imageHeight
)

  const pieceWidth = imageWidth / cols
  const pieceHeight = imageHeight / rows

  const pieces = []

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const id = row * cols + col

      const localCorrectX = col * pieceWidth
      const localCorrectY = row * pieceHeight

      const position = getRandomPosition({
        playgroundWidth,
        playgroundHeight,
        pieceWidth,
        pieceHeight,
        placedPieces: pieces,
      })

      pieces.push({
        id,
        row,
        col,

        localCorrectX,
        localCorrectY,

        correctX: answerX + localCorrectX,
        correctY: answerY + localCorrectY,

        x: position.x,
        y: position.y,

        width: pieceWidth,
        height: pieceHeight,

        cols,
        rows,
      })
    }
  }

  return pieces
}

export function areNeighborPieces(pieceA, pieceB) {
  const rowDiff = Math.abs(pieceA.row - pieceB.row)
  const colDiff = Math.abs(pieceA.col - pieceB.col)

  return rowDiff + colDiff === 1
}

export function getPieceWorldPosition(piece, group) {
  return {
    x: group.x + piece.localCorrectX,
    y: group.y + piece.localCorrectY,
  }
}

function getExpectedPositionByNeighbor({
  dragPiece,
  targetPiece,
  targetWorld,
}) {
  const colDiff = dragPiece.col - targetPiece.col
  const rowDiff = dragPiece.row - targetPiece.row

  return {
    x: targetWorld.x + colDiff * dragPiece.width,
    y: targetWorld.y + rowDiff * dragPiece.height,
  }
}

export function findBestConnection({
  draggingGroup,
  targetGroups,
  pieces,
  snapDistance = 30,
}) {
  let best = null

  const draggingPieces = draggingGroup.pieceIds
    .map((id) => pieces.find((piece) => piece.id === id))
    .filter(Boolean)

  for (const targetGroup of targetGroups) {
    const targetPieces = targetGroup.pieceIds
      .map((id) => pieces.find((piece) => piece.id === id))
      .filter(Boolean)

    for (const dragPiece of draggingPieces) {
      for (const targetPiece of targetPieces) {
        if (!areNeighborPieces(dragPiece, targetPiece)) continue

        const dragWorld = getPieceWorldPosition(dragPiece, draggingGroup)
        const targetWorld = getPieceWorldPosition(targetPiece, targetGroup)

        const expected = getExpectedPositionByNeighbor({
          dragPiece,
          targetPiece,
          targetWorld,
        })

        const dx = dragWorld.x - expected.x
        const dy = dragWorld.y - expected.y
        const distance = Math.hypot(dx, dy)

        if (distance > snapDistance) continue

        if (!best || distance < best.distance) {
          best = {
            distance,
            targetGroup,
            dragPiece,
            targetPiece,
            nextGroupX: expected.x - dragPiece.localCorrectX,
            nextGroupY: expected.y - dragPiece.localCorrectY,
          }
        }
      }
    }
  }

  return best
}

export function mergeGroups({
  groups,
  draggingGroupId,
  targetGroupId,
  nextGroupX,
  nextGroupY,
}) {
  const draggingGroup = groups.find((group) => group.id === draggingGroupId)
  const targetGroup = groups.find((group) => group.id === targetGroupId)

  if (!draggingGroup || !targetGroup) return groups

  const mergedPieceIds = [
    ...new Set([...targetGroup.pieceIds, ...draggingGroup.pieceIds]),
  ]

  const mergedGroup = {
    id: targetGroup.id,
    pieceIds: mergedPieceIds,
    x: nextGroupX,
    y: nextGroupY,

    // 핵심:
    // 큰 그룹일수록 아래로 내려감
    // 단일 조각이 위에 보이게 됨
    zIndex: 1000 - mergedPieceIds.length * 10 + targetGroup.id,

    effectAt: Date.now(),
  }

  return groups
    .filter(
      (group) =>
        group.id !== draggingGroup.id &&
        group.id !== targetGroup.id
    )
    .concat(mergedGroup)
}

export function isPuzzleComplete(groups) {
  return groups.length === 1
}