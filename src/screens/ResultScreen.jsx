import { useEffect, useState } from "react"
import { getClassicPiecePath } from "../puzzles/classic/classicPath"

function getGridOptions(pieceCount) {
  const options = []

  for (let cols = 1; cols <= pieceCount; cols += 1) {
    if (pieceCount % cols !== 0) continue

    options.push({
      cols,
      rows: pieceCount / cols,
    })
  }

  return options
}

function getBestGridByImageRatio({
  imageWidth,
  imageHeight,
  pieceCount,
}) {
  const options = getGridOptions(pieceCount)

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

  return scored[0] ?? { cols: 2, rows: 2 }
}

function getClassicEdges({ row, col, rows, cols }) {
  const right =
    col === cols - 1
      ? 0
      : (row + col) % 2 === 0
        ? 1
        : -1

  const bottom =
    row === rows - 1
      ? 0
      : (row + col) % 2 === 0
        ? -1
        : 1

  const left =
    col === 0
      ? 0
      : -(
          (row + (col - 1)) % 2 === 0
            ? 1
            : -1
        )

  const top =
    row === 0
      ? 0
      : -(
          ((row - 1) + col) % 2 === 0
            ? -1
            : 1
        )

  return {
    top,
    right,
    bottom,
    left,
  }
}

export default function ResultScreen({
  t,
  image,
  pieceCount,
  settings,
  result,
  isMultiMode,
  hasNextPuzzle,
  onNext,
  onConfirm,
  onPuzzleShare,
  onLinkShare,
}) {
  const message = (() => {
    const list = t.resultMessages ?? []
    return list[Math.floor(Math.random() * list.length)] ?? t.complete
  })()

  const isTimeout = result?.type === "timeout"

  const resultTitle = isTimeout ? t.timeoutTitle : `🎉 ${t.complete}`
  const resultMessage = isTimeout ? t.timeoutMessage : message
  const shareMessage =
    t.shareMessages?.[
      Math.floor(Math.random() * t.shareMessages.length)
    ] ?? ""

  const previewBoxWidth = 300
  const previewBoxHeight = 300

  const [imageSize, setImageSize] = useState({
    width: previewBoxWidth,
    height: previewBoxHeight,
  })

  useEffect(() => {
    if (!image) return

    const img = new Image()

    img.onload = () => {
      let width = img.width
      let height = img.height

      const ratio = Math.min(
        previewBoxWidth / width,
        previewBoxHeight / height,
        1
      )

      width *= ratio
      height *= ratio

      setImageSize({
        width,
        height,
      })
    }

    img.src = image
  }, [image])

  const { cols, rows } = getBestGridByImageRatio({
    imageWidth: imageSize.width,
    imageHeight: imageSize.height,
    pieceCount,
  })
  const isClassicPuzzle =
  settings?.puzzleType === "classic"

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.title}>{resultTitle}</div>

        {isTimeout ? (
          <div style={styles.duckBox}>
            <img
              src="/img/duck/duck_fail.png"
              style={styles.duckImage}
              alt=""
            />
          </div>
        ) : (
          <div style={styles.previewBox}>
            <div
              style={{
                ...styles.previewInner,
                width: `${imageSize.width}px`,
                height: `${imageSize.height}px`,
              }}
            >
              <img src={image} style={styles.preview} alt="" />

 {isClassicPuzzle ? (
  <svg
    width={imageSize.width}
    height={imageSize.height}
    viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
    style={styles.classicOverlay}
  >
    {Array.from({ length: rows }).map((_, row) =>
      Array.from({ length: cols }).map((_, col) => {
        const pieceWidth = imageSize.width / cols
        const pieceHeight = imageSize.height / rows

        const padding = Math.min(pieceWidth, pieceHeight) * 0.34

        const path = getClassicPiecePath(
          pieceWidth,
          pieceHeight,
          padding,
          getClassicEdges({
            row,
            col,
            rows,
            cols,
          })
        )

        return (
          <path
            key={`${row}-${col}`}
            d={path}
            transform={`translate(${col * pieceWidth - padding}, ${
              row * pieceHeight - padding
            })`}
            style={styles.classicLine}
          />
        )
      })
    )}
  </svg>
) : (
  <div
    style={{
      ...styles.gridOverlay,
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
    }}
  >
    {Array.from({ length: cols * rows }).map((_, index) => (
      <div key={index} style={styles.gridCell} />
    ))}
  </div>
)}
            </div>
          </div>
        )}

        <div style={styles.message}>{resultMessage}</div>

        <div style={styles.shareRow}>
          {isTimeout ? (
            <button
              style={{
                ...styles.actionBtn,
                ...styles.retryBtn,
              }}
              onClick={onNext}
            >
              {t.retry}
            </button>
          ) : (
            <button
              style={{
                ...styles.actionBtn,
                ...styles.puzzleShareBtn,
              }}
              onClick={() => onPuzzleShare("")}
            >
              {t.puzzleShare}
            </button>
          )}

          <button
            style={{
              ...styles.actionBtn,
              ...styles.linkShareBtn,
            }}
            onClick={() => onLinkShare(shareMessage)}
          >
            {t.linkShare}
          </button>
        </div>

        <button
          style={{
            ...styles.actionBtn,
            ...styles.nextBtn,
          }}
          onClick={hasNextPuzzle && !isTimeout ? onNext : onConfirm}
        >
          {hasNextPuzzle && !isTimeout ? t.nextStage : t.confirm}
        </button>
      </div>
    </div>
  )
}

const styles = {
  wrap: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    minHeight: "760px",
    paddingTop: "10px",
  },

  card: {
    width: "100%",
    background: "rgba(255,255,255,0.58)",
    border: "1px solid rgba(196,170,130,0.45)",
    borderRadius: "18px",
    padding: "16px",
    boxSizing: "border-box",
  },

  title: {
    fontSize: "28px",
    fontWeight: "900",
    color: "#2a1b10",
    textAlign: "center",
    marginBottom: "12px",
  },

  previewBox: {
  width: "100%",
  height: "300px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  borderRadius: "5px",
  background: "transparent",
  marginBottom: "14px",
},

  previewInner: {
    position: "relative",
    overflow: "hidden",
    display: "block",
  },

  preview: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  },

  duckBox: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "14px",
  },

  duckImage: {
    width: "190px",
    height: "190px",
    objectFit: "contain",
    display: "block",
  },

  gridOverlay: {
    position: "absolute",
    inset: 0,
    display: "grid",
    pointerEvents: "none",
  },

classicOverlay: {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  overflow: "visible",
},

classicLine: {
  fill: "none",
  stroke: "rgba(90,70,45,0.58)",
strokeWidth: 1.2,
  strokeLinejoin: "round",
  strokeLinecap: "round",
},

  gridCell: {
  border: "1px solid rgba(110,85,55,0.34)",
  boxSizing: "border-box",
},

  message: {
    fontSize: "17px",
    fontWeight: "800",
    color: "#5b4636",
    textAlign: "center",
    marginBottom: "14px",
    lineHeight: "1.45",
    wordBreak: "keep-all",
  },

  shareRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "10px",
  },

  actionBtn: {
    width: "100%",
    height: "56px",
    borderRadius: "18px",
    border: "none",
    color: "#fff",
    fontSize: "19px",
    fontWeight: "900",
    marginBottom: "10px",
  },

  retryBtn: {
    background: "linear-gradient(180deg, #ffb84d, #ff8a1c)",
    boxShadow: "0 8px 18px rgba(255,138,28,0.24)",
  },

  puzzleShareBtn: {
    background: "linear-gradient(180deg, #8f6cff, #6f55d9)",
    boxShadow: "0 8px 18px rgba(111,85,217,0.22)",
  },

  linkShareBtn: {
    background: "linear-gradient(180deg, #31c96b, #1fa653)",
    boxShadow: "0 8px 18px rgba(31,166,83,0.22)",
  },

  nextBtn: {
    background: "linear-gradient(180deg, #ff8a1c, #ff6700)",
    boxShadow: "0 8px 18px rgba(255,103,0,0.28)",
  },
}