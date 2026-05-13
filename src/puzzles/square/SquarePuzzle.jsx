import { useEffect, useMemo, useRef, useState } from "react"
import {
  createSquarePieces,
  findBestConnection,
  getPieceWorldPosition,
  isPuzzleComplete,
  mergeGroups,
} from "./squareLogic"
import {
  bringGroupToFront,
  createInitialGroups,
  getPieceGroup,
  moveGroup,
  normalizeGroupZIndexes,
} from "./groupLogic"


function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export default function SquarePuzzle({
  image,
  pieceCount,
  settings,
  onComplete,
}) {
  const playgroundRef = useRef(null)
  const correctSoundRef = useRef(null)
  const completeCalledRef = useRef(false)

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [playgroundSize, setPlaygroundSize] = useState({ width: 340, height: 620 })
  const [answerOffset, setAnswerOffset] = useState({ x: 0, y: 0 })

  const [pieces, setPieces] = useState([])
  const [groups, setGroups] = useState([])
  const [dragging, setDragging] = useState(null)
  const [completed, setCompleted] = useState(false)


  if (!correctSoundRef.current) {
    correctSoundRef.current = new Audio("/sound/correct.wav")
  }

  useEffect(() => {
    if (!image) return

    const img = new Image()

    img.onload = () => {
      let width = img.width
      let height = img.height

      const playgroundWidth = 354
const playgroundHeight = 520

const imageRatio = height / width

const isTallPortrait = imageRatio >= 1.35
const isSquare = imageRatio >= 0.9 && imageRatio <= 1.1

const maxImageWidth =
  isTallPortrait ? 350 :
  isSquare ? 300 :
  330

const maxImageHeight =
  isTallPortrait ? 430 :
  isSquare ? 300 :
  350

      const ratio = Math.min(maxImageWidth / width, maxImageHeight / height, 1)

      width *= ratio
      height *= ratio

      setPlaygroundSize({
        width: playgroundWidth,
        height: playgroundHeight,
      })

      setImageSize({
        width,
        height,
      })

  setAnswerOffset({
  x: (playgroundWidth - width) / 2,
  y: (playgroundHeight - height) / 2,
})
    }

    img.src = image
  }, [image])

  useEffect(() => {
    if (!imageSize.width || !imageSize.height) return

    const nextPieces = createSquarePieces({
      imageWidth: imageSize.width,
      imageHeight: imageSize.height,
      pieceCount,
      playgroundWidth: playgroundSize.width,
      playgroundHeight: playgroundSize.height,
      answerX: answerOffset.x,
      answerY: answerOffset.y,
    })

    setPieces(nextPieces)
    setGroups(createInitialGroups(nextPieces))
    setDragging(null)
    setCompleted(false)
    completeCalledRef.current = false
  }, [imageSize, pieceCount, playgroundSize, answerOffset])

  const playCorrectSound = () => {
    const sound = correctSoundRef.current.cloneNode()
    sound.volume = 0.45
    sound.play().catch(() => {})
  }

  const playgroundStyle = useMemo(() => {
    return {
      ...styles.playground,
      width: `${playgroundSize.width}px`,
      height: `${playgroundSize.height}px`,
    }
  }, [playgroundSize])

  const answerStyle = useMemo(() => {
    return {
      ...styles.answerArea,
      left: `${answerOffset.x}px`,
      top: `${answerOffset.y}px`,
      width: `${imageSize.width}px`,
      height: `${imageSize.height}px`,
      opacity: settings?.useBackgroundHint ? 0.24 : 0,
    }
  }, [answerOffset, imageSize, settings])

  const getGroupBounds = (group) => {
    const groupPieces = group.pieceIds
      .map((id) => pieces.find((piece) => piece.id === id))
      .filter(Boolean)

    const minX = Math.min(...groupPieces.map((piece) => piece.localCorrectX))
    const minY = Math.min(...groupPieces.map((piece) => piece.localCorrectY))
    const maxX = Math.max(
      ...groupPieces.map((piece) => piece.localCorrectX + piece.width)
    )
    const maxY = Math.max(
      ...groupPieces.map((piece) => piece.localCorrectY + piece.height)
    )

    return {
      minX,
      minY,
      width: maxX - minX,
      height: maxY - minY,
    }
  }

  const startDrag = (e, piece) => {
    e.preventDefault()

    if (completed) return

    const group = getPieceGroup(groups, piece.id)
    if (!group) return

    const rect = playgroundRef.current.getBoundingClientRect()

    const nextGroups = bringGroupToFront(groups, group.id)
    const nextGroup = nextGroups.find((item) => item.id === group.id)

    setGroups(nextGroups)

    setDragging({
      groupId: group.id,
      offsetX: e.clientX - rect.left - nextGroup.x,
      offsetY: e.clientY - rect.top - nextGroup.y,
    })
  }

  const moveDrag = (e) => {
    if (!dragging || completed) return

    const rect = playgroundRef.current.getBoundingClientRect()

    const draggingGroup = groups.find(
      (group) => group.id === dragging.groupId
    )

    if (!draggingGroup) return

    const bounds = getGroupBounds(draggingGroup)

    const nextX = e.clientX - rect.left - dragging.offsetX
    const nextY = e.clientY - rect.top - dragging.offsetY

    const clampedX = clamp(
      nextX,
      -bounds.minX,
      playgroundSize.width - bounds.width - bounds.minX
    )

    const clampedY = clamp(
      nextY,
      -bounds.minY,
      playgroundSize.height - bounds.height - bounds.minY
    )

    setGroups((prev) =>
      moveGroup({
        groups: prev,
        groupId: dragging.groupId,
        nextX: clampedX,
        nextY: clampedY,
      })
    )
  }

  const endDrag = () => {
    if (!dragging || completed) {
      setDragging(null)
      return
    }

    setGroups((prevGroups) => {
      const draggingGroup = prevGroups.find(
        (group) => group.id === dragging.groupId
      )

      if (!draggingGroup) return prevGroups

      const targetGroups = prevGroups.filter(
        (group) => group.id !== draggingGroup.id
      )

      const connection = findBestConnection({
        draggingGroup,
        targetGroups,
        pieces,
        snapDistance: 24,
      })

      if (!connection) return normalizeGroupZIndexes(prevGroups)

      playCorrectSound()

      const nextGroups = mergeGroups({
        groups: prevGroups,
        draggingGroupId: draggingGroup.id,
        targetGroupId: connection.targetGroup.id,
        nextGroupX: connection.nextGroupX,
        nextGroupY: connection.nextGroupY,
      })

      if (isPuzzleComplete(nextGroups) && !completeCalledRef.current) {
        completeCalledRef.current = true
        setCompleted(true)

        setTimeout(() => {
          onComplete?.()
        }, 450)
      }

      return normalizeGroupZIndexes(nextGroups)
    })

    setDragging(null)
  }

  return (
    <div style={styles.wrap}>
      <div
        ref={playgroundRef}
        style={playgroundStyle}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          style={{
            ...answerStyle,
            backgroundImage: `url(${image})`,
            backgroundSize: "100% 100%",
            
          }}
        >
        
        </div>

        {groups.map((group) => (
          <div
            key={group.id}
            style={{
              ...styles.group,
              left: `${group.x}px`,
              top: `${group.y}px`,
              zIndex: group.zIndex,
              animation: group.effectAt ? "snapBounce 0.18s ease-out" : "none",
              filter: group.effectAt
                ? "drop-shadow(0 0 10px rgba(255,210,64,0.85))"
                : "none",
            }}
          >
            {group.pieceIds.map((pieceId) => {
              const piece = pieces.find((item) => item.id === pieceId)
              if (!piece) return null

              const pieceWorld = getPieceWorldPosition(piece, {
                ...group,
                x: 0,
                y: 0,
              })

              return (
                <div
                  key={piece.id}
                  style={{
                    ...styles.piece,
                    width: `${piece.width}px`,
                    height: `${piece.height}px`,
                    left: `${pieceWorld.x}px`,
                    top: `${pieceWorld.y}px`,
                    backgroundImage: `url(${image})`,
                    backgroundSize: `${imageSize.width}px ${imageSize.height}px`,
                    backgroundPosition: `-${piece.localCorrectX}px -${piece.localCorrectY}px`,
              
                  }}
                  onPointerDown={(e) => startDrag(e, piece)}
                >
                
                </div>
              )
            })}
          </div>
        ))}

        {completed && <div style={styles.completeFlash} />}
      </div>
    </div>
  )
}

const styles = {
  wrap: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    paddingTop: "0px",
  },

  playground: {
    position: "relative",
    borderRadius: "5px",
    background: "rgba(255,255,255,0.34)",
    border: "1px solid rgba(196,170,130,0.5)",
    overflow: "hidden",
    touchAction: "none",
  },

  answerArea: {
  position: "absolute",
  objectFit: "fill",
  borderRadius: "10px",
  pointerEvents: "none",
  overflow: "hidden",
  boxSizing: "border-box",

  border: "8px solid rgba(168,132,84,0.38)",

  boxShadow: `
    inset 0 0 18px rgba(80,40,10,0.22),
    0 0 12px rgba(0,0,0,0.08)
  `,
},

  group: {
    position: "absolute",
    touchAction: "none",
    transformOrigin: "center",
  },

  piece: {
    position: "absolute",
    border: "1px solid rgba(120,85,45,0.42)",
    boxShadow: `
  inset 0 0 8px rgba(80,40,10,0.18),
  inset 0 0 2px rgba(255,220,170,0.15)
`,
    boxSizing: "border-box",
    backgroundRepeat: "no-repeat",
    borderRadius: "2px",
    touchAction: "none",
    overflow: "hidden",
  },

  completeFlash: {
    position: "absolute",
    inset: 0,
    background: "rgba(255,220,90,0.18)",
    pointerEvents: "none",
    animation: "completeFlash 0.45s ease-out",
  },
}