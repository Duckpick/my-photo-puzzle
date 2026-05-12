export function getGridByPieceCount(pieceCount) {
  const map = {
    2: { cols: 2, rows: 1 },
    4: { cols: 2, rows: 2 },
    6: { cols: 3, rows: 2 },
    8: { cols: 4, rows: 2 },
    10: { cols: 5, rows: 2 },
    12: { cols: 4, rows: 3 },
    16: { cols: 4, rows: 4 },
    20: { cols: 5, rows: 4 },
  }

  return map[pieceCount] ?? map[4]
}

function getBestGridByImageRatio({ imageWidth, imageHeight, pieceCount }) {
  const pairs = []

  for (let cols = 1; cols <= pieceCount; cols += 1) {
    if (pieceCount % cols !== 0) continue

    const rows = pieceCount / cols

    pairs.push({ cols, rows })
  }

  const scored = pairs.map((grid) => {
    const pieceWidth = imageWidth / grid.cols
    const pieceHeight = imageHeight / grid.rows
    const pieceRatio = pieceWidth / pieceHeight

    return {
      ...grid,
      score: Math.abs(Math.log(pieceRatio)),
    }
  })

  scored.sort((a, b) => a.score - b.score)

  return scored[0] ?? getGridByPieceCount(pieceCount)
}

function randomBetween(min, max) {
  return min + Math.random() * Math.max(0, max - min)
}

function isOverlapping(a, b, padding = 6) {
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
  visualPadding,
  placedPieces,
}) {
  const visualWidth = pieceWidth + visualPadding * 2
  const visualHeight = pieceHeight + visualPadding * 2

  const maxX = playgroundWidth - visualWidth
  const maxY = playgroundHeight - visualHeight

  let fallback = {
    x: randomBetween(visualPadding, Math.max(visualPadding, maxX)),
    y: randomBetween(visualPadding, Math.max(visualPadding, maxY)),
  }

  for (let i = 0; i < 80; i += 1) {
    const candidate = {
      x: randomBetween(visualPadding, Math.max(visualPadding, maxX)),
      y: randomBetween(visualPadding, Math.max(visualPadding, maxY)),
      width: visualWidth,
      height: visualHeight,
    }

    const hasOverlap = placedPieces.some((piece) =>
      isOverlapping(candidate, {
        x: piece.x - piece.visualPadding,
        y: piece.y - piece.visualPadding,
        width: piece.width + piece.visualPadding * 2,
        height: piece.height + piece.visualPadding * 2,
      })
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

export function getClassicEdges({ row, col, rows, cols }) {
  return {
    top: row === 0 ? 0 : null,
    right:
      col === cols - 1
        ? 0
        : (row + col) % 2 === 0
          ? 1
          : -1,
    bottom:
      row === rows - 1
        ? 0
        : (row + col) % 2 === 0
          ? -1
          : 1,
    left: col === 0 ? 0 : null,
  }
}

function resolveClassicEdges(pieces) {
  return pieces.map((piece) => {
    const topPiece = pieces.find(
      (item) => item.row === piece.row - 1 && item.col === piece.col
    )

    const leftPiece = pieces.find(
      (item) => item.row === piece.row && item.col === piece.col - 1
    )

    return {
      ...piece,
      edges: {
        ...piece.edges,
        top: piece.edges.top ?? (topPiece ? -topPiece.edges.bottom : 0),
        left: piece.edges.left ?? (leftPiece ? -leftPiece.edges.right : 0),
      },
    }
  })
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
  const { cols, rows } = getBestGridByImageRatio({
    imageWidth,
    imageHeight,
    pieceCount,
  })

  const pieceWidth = imageWidth / cols
  const pieceHeight = imageHeight / rows

  const visualPadding = Math.min(pieceWidth, pieceHeight) * 0.34

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
        visualPadding,
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
        visualPadding,

        visualWidth: pieceWidth + visualPadding * 2,
        visualHeight: pieceHeight + visualPadding * 2,

        cols,
        rows,

        edges: getClassicEdges({
          row,
          col,
          rows,
          cols,
        }),
      })
    }
  }

  return resolveClassicEdges(pieces)
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