const SELECTED_Z_INDEX = 9999

function getBaseZIndex(group) {
  return 1000 - group.pieceIds.length * 10 + group.id
}

export function createInitialGroups(pieces) {
  return pieces.map((piece) => ({
    id: piece.id,
    pieceIds: [piece.id],

    x: piece.x - piece.localCorrectX,
    y: piece.y - piece.localCorrectY,

    zIndex: 1000 + piece.id,
    effectAt: null,
  }))
}

export function getPieceGroup(groups, pieceId) {
  return groups.find((group) => group.pieceIds.includes(pieceId))
}

export function getGroupPieces(group, pieces) {
  return group.pieceIds
    .map((pieceId) => pieces.find((piece) => piece.id === pieceId))
    .filter(Boolean)
}

export function moveGroup({
  groups,
  groupId,
  nextX,
  nextY,
}) {
  return groups.map((group) => {
    if (group.id !== groupId) return group

    return {
      ...group,
      x: nextX,
      y: nextY,
    }
  })
}

export function bringGroupToFront(groups, groupId) {
  return groups.map((group) => {
    if (group.id === groupId) {
      return {
        ...group,
        zIndex: SELECTED_Z_INDEX,
      }
    }

    return {
      ...group,
      zIndex: getBaseZIndex(group),
    }
  })
}

export function normalizeGroupZIndexes(groups) {
  return groups.map((group) => ({
    ...group,
    zIndex: getBaseZIndex(group),
  }))
}