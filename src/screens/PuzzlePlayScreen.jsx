import { useEffect, useMemo, useState } from "react"
import { TIME_OPTIONS } from "../constants/config"
import { getPuzzleComponent } from "../puzzles"

function getTimeSeconds(timeLimit) {
  const option = TIME_OPTIONS.find((item) => item.id === timeLimit)
  return option ? option.seconds : null
}

function formatTime(seconds) {
  if (seconds === null) return null

  const min = Math.floor(seconds / 60)
  const sec = seconds % 60

  return `${min}:${String(sec).padStart(2, "0")}`
}

export default function PuzzlePlayScreen({
  t,
  selectedImages,
  settings,
  onComplete,
  onTimeout,
  onExit,
}) {
  const mainImage = selectedImages[0]
  const PuzzleComponent = getPuzzleComponent(settings.puzzleType)

  const [showOriginal, setShowOriginal] = useState(false)

  const timeSeconds = useMemo(
    () => getTimeSeconds(settings.timeLimit),
    [settings.timeLimit]
  )

  const [remainSeconds, setRemainSeconds] = useState(timeSeconds)

  const showOriginalButton = settings.hintType === "popup"
  const useBackgroundHint = settings.hintType === "background"
  const isDangerTime =
  remainSeconds !== null && remainSeconds <= 30

const isCriticalTime =
  remainSeconds !== null && remainSeconds <= 10

  useEffect(() => {
    setRemainSeconds(timeSeconds)
  }, [timeSeconds])

  useEffect(() => {
    if (remainSeconds === null) return
    if (remainSeconds <= 0) return

    const timerId = setTimeout(() => {
      setRemainSeconds((prev) => {
        if (prev === null) return prev
        return Math.max(prev - 1, 0)
      })
    }, 1000)

    return () => clearTimeout(timerId)
  }, [remainSeconds])

  useEffect(() => {
    if (remainSeconds !== 0) return

    onTimeout()
  }, [remainSeconds, onTimeout])

  return (
    <div style={styles.wrap}>
      <div style={styles.topRow}>
        <button style={styles.backBtn} onClick={onExit}>
          ‹
        </button>

        <div
  style={{
    ...styles.title,
    color: isDangerTime ? "#ff3b30" : "#2a1b10",
    animation: isCriticalTime ? "dangerBlink 1s infinite" : "none",
  }}
>
  {remainSeconds !== null
    ? `⏰ ${formatTime(remainSeconds)}`
    : `${settings.pieceCount}${t.usedPiece}`}
</div>

        {showOriginalButton ? (
          <button
            style={styles.hintBtn}
            onClick={() => setShowOriginal(true)}
          >
            {t.originalHint}
          </button>
        ) : (
          <div style={styles.emptyTopBox} />
        )}
      </div>

      <div style={styles.playArea}>
        {mainImage ? (
          <PuzzleComponent
            image={mainImage}
            pieceCount={settings.pieceCount}
            settings={{
              ...settings,
              useBackgroundHint,
            }}
            onComplete={onComplete}
          />
        ) : (
          <div style={styles.emptyText}>{t.selectedPhotos}</div>
        )}
      </div>

      {showOriginal && (
        <div style={styles.originalOverlay}>
          <div style={styles.originalPopup}>
            <div style={styles.originalTitle}>{t.originalImageTitle}</div>

            <img
              src={mainImage}
              alt=""
              style={styles.originalImage}
            />

            <button
              style={styles.closeBtn}
              onClick={() => setShowOriginal(false)}
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  wrap: {
    minHeight: "760px",
  },

  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },

  backBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    border: "none",
    background: "transparent",
    color: "#2a1b10",
    fontSize: "40px",
    fontWeight: "500",
    lineHeight: "34px",
  },

  title: {
    fontSize: "22px",
    fontWeight: "900",
    color: "#2a1b10",
  },

  hintBtn: {
    width: "64px",
    height: "40px",
    padding: "0 12px",
    borderRadius: "14px",
    border: "1px solid #eadcc8",
    background: "#fffaf1",
    color: "#2a1b10",
    fontSize: "13px",
    fontWeight: "900",
  },

  emptyTopBox: {
    width: "64px",
    height: "40px",
  },

  playArea: {
    width: "100%",
    minHeight: "650px",
    position: "relative",
  },

  emptyText: {
    fontSize: "16px",
    fontWeight: "900",
    color: "#8a6b45",
    textAlign: "center",
    marginTop: "80px",
  },

  originalOverlay: {
  position: "fixed",
  inset: 0,
  zIndex: 99999,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  padding: "92px 24px 24px",
  boxSizing: "border-box",
},

  originalPopup: {
    width: "86%",
    maxWidth: "330px",
    maxHeight: "72vh",
    background: "#fffaf1",
    border: "1px solid #eadcc8",
    borderRadius: "22px",
    padding: "14px",
    boxSizing: "border-box",
    boxShadow: "0 18px 48px rgba(0,0,0,0.35)",
  },

  originalTitle: {
    fontSize: "18px",
    fontWeight: "900",
    color: "#2a1b10",
    textAlign: "center",
    marginBottom: "10px",
  },

  originalImage: {
    width: "100%",
    maxHeight: "52vh",
    objectFit: "contain",
    display: "block",
    borderRadius: "14px",
    background: "#fff",
    marginBottom: "12px",
  },

  closeBtn: {
    width: "100%",
    height: "46px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(180deg, #ff8a1c, #ff6700)",
    color: "#fff",
    fontSize: "17px",
    fontWeight: "900",
  },
  dangerBlink: {},
}
if (typeof document !== "undefined") {
  const style = document.createElement("style")

  style.innerHTML = `
    @keyframes dangerBlink {
      0% { opacity: 1; }
      50% { opacity: 0.35; }
      100% { opacity: 1; }
    }
  `

  document.head.appendChild(style)
}