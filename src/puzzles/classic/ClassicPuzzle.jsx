import { useEffect, useMemo, useRef, useState } from "react"
import {
  createSquarePieces,
  findBestConnection,
  getPieceWorldPosition,
  isPuzzleComplete,
  mergeGroups,
} from "./classicLogic"
import {
  bringGroupToFront,
  createInitialGroups,
  getPieceGroup,
  moveGroup,
  normalizeGroupZIndexes,
} from "./groupLogic"
import { getClassicPiecePath } from "./classicPath"

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}


export default function ClassicPuzzle({
  image,
  pieceCount,
  settings,
  onComplete,
}) {
  const playgroundRef = useRef(null)
  const correctSoundRef = useRef(null)
  const completeCalledRef = useRef(false)

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [playgroundSize, setPlaygroundSize] = useState({
    width: 340,
    height: 620,
  })
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
  isTallPortrait ? 310 :
  isSquare ? 270 :
  280

const maxImageHeight =
  isTallPortrait ? 410 :
  isSquare ? 270 :
  300

    const ratio = Math.min(
      maxImageWidth / width,
      maxImageHeight / height,
      1
    )

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
        />

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

              const padding = piece.visualPadding ?? 0
              const path = getClassicPiecePath(
                piece.width,
                piece.height,
                padding,
                piece.edges
              )

              const clipId = `classic-piece-${piece.id}`

              return (
  <div
  key={piece.id}
  style={{
    ...styles.piece,
    width: `${piece.visualWidth}px`,
    height: `${piece.visualHeight}px`,
    left: `${pieceWorld.x - padding}px`,
    top: `${pieceWorld.y - padding}px`,
  }}
>
                
                  <svg
                    width={piece.visualWidth}
                    height={piece.visualHeight}
                    viewBox={`0 0 ${piece.visualWidth} ${piece.visualHeight}`}
                    style={styles.pieceSvg}
                  >
                    <defs>
                      <clipPath id={clipId}>
                        <path d={path} />
                      </clipPath>
                    </defs>

                    <image
                      href={image}
                      x={padding - piece.localCorrectX}
                      y={padding - piece.localCorrectY}
                      width={imageSize.width}
                      height={imageSize.height}
                      clipPath={`url(#${clipId})`}
                      preserveAspectRatio="none"
                    />

                    <path d={path} style={styles.pieceStroke} />
                  </svg>
                  <div
  style={{
    ...styles.pieceHitBox,
    left: `${padding}px`,
    top: `${padding}px`,
    width: `${piece.width}px`,
    height: `${piece.height}px`,
  }}
  onPointerDown={(e) => startDrag(e, piece)}
/>
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
  touchAction: "none",
  overflow: "visible",
  pointerEvents: "none",
},

  pieceSvg: {
    display: "block",
    overflow: "visible",
    filter: "drop-shadow(0 2px 5px rgba(50,30,10,0.28))",
  },
pieceHitBox: {
  position: "absolute",
  zIndex: 5,
  pointerEvents: "auto",
  touchAction: "none",
  background: "transparent",
},
  pieceStroke: {
    fill: "none",
    stroke: "rgba(70,45,22,0.68)",
    strokeWidth: 1.4,
    strokeLinejoin: "round",
  },

  completeFlash: {
    position: "absolute",
    inset: 0,
    background: "rgba(255,220,90,0.18)",
    pointerEvents: "none",
    animation: "completeFlash 0.45s ease-out",
  },
}