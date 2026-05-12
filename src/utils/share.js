import { getClassicPiecePath } from "../puzzles/classic/classicPath"
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
          (row + col - 1) % 2 === 0
            ? 1
            : -1
        )

  const top =
    row === 0
      ? 0
      : -(
          (row - 1 + col) % 2 === 0
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

function createFileName() {
  const now = new Date()

  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")
  const hh = String(now.getHours()).padStart(2, "0")
  const mi = String(now.getMinutes()).padStart(2, "0")
  const ss = String(now.getSeconds()).padStart(2, "0")

  return `my-photo-puzzle-${yyyy}${mm}${dd}-${hh}${mi}${ss}.png`
}

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

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function formatDate() {
  const now = new Date()

  return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}.${String(now.getDate()).padStart(2, "0")}`
}

function drawSquarePuzzleLines({
  ctx,
  drawX,
  drawY,
  drawW,
  drawH,
  cols,
  rows,
}) {
  ctx.strokeStyle = "rgba(70,45,22,0.78)"
ctx.lineWidth = 2.4

  for (let i = 1; i < cols; i += 1) {
    const x = drawX + (drawW / cols) * i

    ctx.beginPath()
    ctx.moveTo(x, drawY)
    ctx.lineTo(x, drawY + drawH)
    ctx.stroke()
  }

  for (let i = 1; i < rows; i += 1) {
    const y = drawY + (drawH / rows) * i

    ctx.beginPath()
    ctx.moveTo(drawX, y)
    ctx.lineTo(drawX + drawW, y)
    ctx.stroke()
  }

  ctx.strokeStyle = "rgba(70,45,22,0.9)"
ctx.lineWidth = 2.4
  ctx.strokeRect(drawX, drawY, drawW, drawH)
}

function drawClassicPuzzleLines({
  ctx,
  drawX,
  drawY,
  drawW,
  drawH,
  cols,
  rows,
}) {
  const pieceWidth = drawW / cols
  const pieceHeight = drawH / rows
  const padding = Math.min(pieceWidth, pieceHeight) * 0.34

  ctx.strokeStyle = "rgba(70,45,22,0.9)"
ctx.lineWidth = 2.4
ctx.lineJoin = "round"
ctx.lineCap = "round"

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
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

      ctx.save()
      ctx.translate(
        drawX + col * pieceWidth - padding,
        drawY + row * pieceHeight - padding
      )
      ctx.stroke(new Path2D(path))
      ctx.restore()
    }
  }
}

export async function createPuzzleShareImage({
  image,
  title,
  message,
  pieceCount,
  puzzleType,
}) {
  const img = await loadImage(image)

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  canvas.width = 900
  canvas.height = 1180

  ctx.fillStyle = "#fff7e8"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = "900 52px Pretendard, sans-serif"
ctx.textAlign = "center"

const isKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(title)

const accentText = isKorean
  ? "내 사진"
  : "My Photo"

const normalText = isKorean
  ? "퍼즐"
  : "Puzzle"

const accentWidth = ctx.measureText(accentText).width
const normalWidth = ctx.measureText(normalText).width
const spacing = 18

const totalWidth =
  accentWidth + spacing + normalWidth

const startX =
  canvas.width / 2 - totalWidth / 2

ctx.fillStyle = "#ff7a00"
ctx.fillText(accentText, startX + accentWidth / 2, 82)

ctx.fillStyle = "#2a1b10"
ctx.fillText(
  normalText,
  startX +
    accentWidth +
    spacing +
    normalWidth / 2,
  82
)

  ctx.font = "800 28px Pretendard, sans-serif"
  ctx.fillStyle = "#7a5632"
  ctx.fillText("DuckPick Studio", canvas.width / 2, 122)

  const imageBoxX = 78
  const imageBoxY = 190
  const imageBoxW = 744
  const imageBoxH = 720

  const ratio = Math.min(imageBoxW / img.width, imageBoxH / img.height)
  const drawW = img.width * ratio
  const drawH = img.height * ratio
  const framePadding = 26

const frameW = drawW + framePadding * 2
const frameH = drawH + framePadding * 2

const frameX = (canvas.width - frameW) / 2
const frameY = imageBoxY + (imageBoxH - frameH) / 2

const drawX = frameX + framePadding
const drawY = frameY + framePadding

// 그림자
ctx.save()
ctx.shadowColor = "rgba(0,0,0,0.18)"
ctx.shadowBlur = 18
ctx.shadowOffsetY = 8

// 바깥 액자
ctx.fillStyle = "#6f4b2f"
ctx.fillRect(frameX, frameY, frameW, frameH)

ctx.restore()

// 안쪽 액자
ctx.fillStyle = "#d7c2a3"
ctx.fillRect(
  frameX + 8,
  frameY + 8,
  frameW - 16,
  frameH - 16
)

// 안쪽 라인
ctx.strokeStyle = "rgba(255,235,190,0.45)"
ctx.lineWidth = 3
ctx.strokeRect(
  frameX + 10,
  frameY + 10,
  frameW - 20,
  frameH - 20
)

// 이미지
ctx.drawImage(img, drawX, drawY, drawW, drawH)

  const { cols, rows } = getGridByPieceCount(
  pieceCount,
  drawW,
  drawH
)

  if (puzzleType === "classic") {
    drawClassicPuzzleLines({
      ctx,
      drawX,
      drawY,
      drawW,
      drawH,
      cols,
      rows,
    })
  } else {
    drawSquarePuzzleLines({
      ctx,
      drawX,
      drawY,
      drawW,
      drawH,
      cols,
      rows,
    })
  }

  const hasMessage = Boolean(message && message.trim())

const messageY = frameY + frameH + 70
const dateY = hasMessage ? messageY + 62 : frameY + frameH + 78

if (hasMessage) {
  ctx.fillStyle = "#2a1b10"
  ctx.font = "900 36px Pretendard, sans-serif"
  ctx.fillText(message, canvas.width / 2, messageY)
}

ctx.fillStyle = "#7a5632"
ctx.font = "800 32px Pretendard, sans-serif"
ctx.fillText(formatDate(), canvas.width / 2, dateY)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png", 0.95)
  })
}

export async function sharePuzzleImage({
  image,
  title,
  message,
  pieceCount,
  puzzleType,
}) {
  const blob = await createPuzzleShareImage({
    image,
    title,
    message,
    pieceCount,
    puzzleType,
  })

  const fileName = createFileName()

  const file = new File([blob], fileName, {
    type: "image/png",
  })

  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      title,
      files: [file],
    })

    return
  }

  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = downloadUrl
  link.download = fileName

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(downloadUrl)
}

export async function sharePuzzleLink({
  message,
  sharePlayNow,
  url = window.location.origin,
}) {
  const shareText = [message, "", sharePlayNow, url].join("\n")

  if (navigator.share) {
    await navigator.share({
      text: shareText,
    })

    return
  }

  if (navigator.clipboard) {
    await navigator.clipboard.writeText(shareText)
  }
}