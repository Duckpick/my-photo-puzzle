import { useEffect, useRef, useState } from "react"

import Header from "./components/Header"
import Footer from "./components/Footer"
import AdBox from "./components/AdBox"
import Popup from "./components/Popup"

import MainScreen from "./screens/MainScreen"
import PuzzleSetupScreen from "./screens/PuzzleSetupScreen"
import PuzzlePlayScreen from "./screens/PuzzlePlayScreen"
import ResultScreen from "./screens/ResultScreen"

import { TEXT } from "./constants/text"
import {
  APP_CONFIG,
  CONTACT_EMAIL,
  DEFAULT_PUZZLE_SETTINGS,
  PHOTO_MODE,
  SCREEN,
  SETTING_KEY,
STORAGE_KEY,
PUZZLE_SETTING_KEY,
} from "./constants/config"

import { loadJson, saveJson } from "./utils/storage"
import { resizeImage } from "./utils/image"
import { sharePuzzleImage, sharePuzzleLink } from "./utils/share"
import { checkMonthlyCode } from "./utils/code"

function getDefaultLanguage() {
  const saved = loadJson(SETTING_KEY)

  if (saved?.language) return saved.language

  return navigator.language.startsWith("ko") ? "ko" : "en"
}

export default function App() {
  const savedSetting = loadJson(SETTING_KEY, {})
  const savedPuzzleSetting = loadJson(
  PUZZLE_SETTING_KEY,
  DEFAULT_PUZZLE_SETTINGS
)

  const [page, setPage] = useState(window.location.pathname)
  const [screen, setScreen] = useState(SCREEN.MAIN)
  const [popup, setPopup] = useState(null)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [codeInput, setCodeInput] = useState("")
const [codeMessage, setCodeMessage] = useState("")
const [isAdFree, setIsAdFree] = useState(false)

  const [language, setLanguage] = useState(
    savedSetting.language ?? getDefaultLanguage()
  )
  const [soundOn, setSoundOn] = useState(savedSetting.soundOn ?? true)
  const [bgmOn, setBgmOn] = useState(savedSetting.bgmOn ?? false)
  const [volume, setVolume] = useState(savedSetting.volume ?? 0.3)

  const [photoMode, setPhotoMode] = useState(PHOTO_MODE.SINGLE)
  const [selectedImages, setSelectedImages] = useState([])
  const [puzzleSettings, setPuzzleSettings] = useState(savedPuzzleSetting)
const [result, setResult] = useState({
  type: "complete",
})

const [playIndex, setPlayIndex] = useState(0)
const [currentPieceCount, setCurrentPieceCount] = useState(
  DEFAULT_PUZZLE_SETTINGS.pieceCount
)

  const clickSoundRef = useRef(null)

  if (!clickSoundRef.current) {
    clickSoundRef.current = new Audio("/sound/click.wav")
  }

  const t = TEXT[language]
  const isMobile = window.innerWidth <= 420
  const scale = isMobile
    ? 1
    : Math.min(1, window.innerHeight / APP_CONFIG.baseHeight)

  const playClick = () => {
    if (!soundOn) return

    const sound = clickSoundRef.current.cloneNode()
    sound.volume = volume
    sound.play().catch(() => {})
  }

  useEffect(() => {
    saveJson(SETTING_KEY, {
      language,
      soundOn,
      bgmOn,
      volume,
    })
  }, [language, soundOn, bgmOn, volume])
  
  useEffect(() => {
  window.scrollTo(0, 0)
}, [screen])

  useEffect(() => {
    const handlePopState = () => {
      setPage(window.location.pathname)
      window.scrollTo(0, 0)
    }

    window.addEventListener("popstate", handlePopState)

    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const goPage = (path) => {
    window.history.pushState({}, "", path)
    setPage(path)
    window.scrollTo(0, 0)
  }

  const goHome = () => {
    window.history.pushState({}, "", "/")
    setPage("/")
    window.scrollTo(0, 0)
  }

  const resetData = () => {
  const ok = confirm(t.resetConfirm)
  if (!ok) return

  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(SETTING_KEY)
  localStorage.removeItem(PUZZLE_SETTING_KEY)

  setLanguage(getDefaultLanguage())
  setSoundOn(true)
  setBgmOn(false)
  setVolume(0.3)

  setPuzzleSettings(DEFAULT_PUZZLE_SETTINGS)
}

  const handleSelectSingle = async (e) => {
  playClick()

  const file = e.target.files?.[0]
  if (!file) return

  const imageUrl = await resizeImage(file)

  setSelectedImages([imageUrl])
  setPhotoMode(PHOTO_MODE.SINGLE)
  setPuzzleSettings({
  ...savedPuzzleSetting,
  playMode: savedPuzzleSetting.playMode ?? "free",
})
  setScreen(SCREEN.SETUP)

  e.target.value = ""
}

  const handleSelectMultiple = async (e) => {
  playClick()

  const files = Array.from(e.target.files ?? [])
  if (files.length === 0) return

  const imageUrls = await Promise.all(
    files.map((file) => resizeImage(file))
  )

  setSelectedImages(imageUrls)
  setPhotoMode(PHOTO_MODE.MULTIPLE)
  setPuzzleSettings({
  ...savedPuzzleSetting,
  playMode: savedPuzzleSetting.playMode ?? "free",
})
  setScreen(SCREEN.SETUP)

  e.target.value = ""
}

  const changePuzzleSetting = (key, value) => {
  setPuzzleSettings((prev) => {
    const next = {
      ...prev,
      [key]: value,
    }

    saveJson(PUZZLE_SETTING_KEY, next)

    return next
  })
}

  const startPuzzle = () => {
  playClick()

  setPlayIndex(0)
  setCurrentPieceCount(puzzleSettings.pieceCount)
  setResult({
    type: "complete",
    playMode: puzzleSettings.playMode,
    pieceCount: puzzleSettings.pieceCount,
  })

  setScreen(SCREEN.PLAY)
}
const completePuzzle = () => {
  playClick()

  setResult({
    type: "complete",
    playMode: puzzleSettings.playMode,
    pieceCount: currentPieceCount,
    imageIndex: playIndex,
  })

  setScreen(SCREEN.RESULT)
}

const timeoutPuzzle = () => {
  playClick()

  setResult({
    type: "timeout",
    playMode: puzzleSettings.playMode,
    pieceCount: currentPieceCount,
    imageIndex: playIndex,
  })

  setScreen(SCREEN.RESULT)
}
const nextPuzzle = () => {
  playClick()

  if (result.type === "timeout") {
    setResult({
      type: "complete",
      playMode: puzzleSettings.playMode,
      pieceCount: currentPieceCount,
      imageIndex: playIndex,
    })
    setScreen(SCREEN.PLAY)
    return
  }

  if (puzzleSettings.playMode === "free") {
    const nextIndex = playIndex + 1

    if (nextIndex >= selectedImages.length) {
      setScreen(SCREEN.MAIN)
      return
    }

    setPlayIndex(nextIndex)
    setCurrentPieceCount(puzzleSettings.pieceCount)
    setResult({
      type: "complete",
      playMode: "free",
      pieceCount: puzzleSettings.pieceCount,
      imageIndex: nextIndex,
    })
    setScreen(SCREEN.PLAY)
    return
  }

  if (puzzleSettings.playMode === "challenge") {
    const pieceOptions = [2, 4, 6, 8, 10, 12, 16, 20]
    const currentIndex = pieceOptions.indexOf(currentPieceCount)
    const nextPieceCount = pieceOptions[currentIndex + 1]

    if (!nextPieceCount) {
      setScreen(SCREEN.MAIN)
      return
    }

    const nextIndex =
      selectedImages.length <= 1
        ? 0
        : Math.floor(Math.random() * selectedImages.length)

    setPlayIndex(nextIndex)
    setCurrentPieceCount(nextPieceCount)
    setResult({
      type: "complete",
      playMode: "challenge",
      pieceCount: nextPieceCount,
      imageIndex: nextIndex,
    })
    setScreen(SCREEN.PLAY)
  }
}
const goMainFromResult = () => {
  playClick()
  setScreen(SCREEN.MAIN)
}

  const renderInfoLinks = () => (
    <div style={styles.footerLinks}>
      <button style={styles.footerLinkBtn} onClick={() => goPage("/privacy")}>
        {t.privacy}
      </button>

      <button style={styles.footerLinkBtn} onClick={() => goPage("/contact")}>
        {t.contact}
      </button>

      <button style={styles.footerLinkBtn} onClick={() => goPage("/support")}>
        {t.support}
      </button>
    </div>
  )

  if (page === "/privacy") {
    return (
      <div style={styles.page}>
        <div style={styles.app}>
          <button style={styles.backBtn} onClick={goHome}>
            {t.home}
          </button>

          <div style={styles.infoPage}>
            <div style={styles.infoPageTitle}>{t.privacyTitle}</div>
            <p>{t.privacyText1}</p>
            <p>{t.privacyText2}</p>
            <p>{t.photoNotUploaded}</p>
            <p>{t.photoLocalOnly}</p>
            <p>{t.photoRefreshNotice}</p>
            <p>Google Ads Policy: https://policies.google.com/technologies/ads</p>
            <p>Contact: {CONTACT_EMAIL}</p>
            {renderInfoLinks()}
          </div>
        </div>
      </div>
    )
  }

  if (page === "/contact") {
    return (
      <div style={styles.page}>
        <div style={styles.app}>
          <button style={styles.backBtn} onClick={goHome}>
            {t.home}
          </button>

          <div style={styles.infoPage}>
            <div style={styles.infoPageTitle}>{t.contactTitle}</div>
            <p>{t.contactText}</p>
            <p>Email: {CONTACT_EMAIL}</p>
            {renderInfoLinks()}
          </div>
        </div>
      </div>
    )
  }

  if (page === "/support") {
    return (
      <div style={styles.page}>
        <div style={styles.app}>
          <button style={styles.backBtn} onClick={goHome}>
            {t.home}
          </button>

          <div style={styles.infoPage}>
            <div style={styles.infoPageTitle}>{t.supportTitle}</div>
            <p>{t.supportText}</p>
            {renderInfoLinks()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      {!isMobile && <div style={styles.sideAd}>{t.ad}</div>}

      <div style={{ ...styles.app, transform: `scale(${scale})` }}>
        {screen === SCREEN.MAIN && (
          <>
            <Header
              t={t}
              onRule={() => {
                playClick()
                setPopup("rule")
              }}
              onSetting={() => {
                playClick()
                setPopup("setting")
              }}
            />

            <MainScreen
  t={t}
  language={language}
  onSelectSingle={handleSelectSingle}
  onSelectMultiple={handleSelectMultiple}
/>

            <div style={{ marginBottom: "42px" }}>
  <AdBox text={t.ad} />
</div>

<Footer
              t={t}
              onPrivacy={() => goPage("/privacy")}
              onContact={() => goPage("/contact")}
              onSupport={() => goPage("/support")}
            />
          </>
        )}

        {screen === SCREEN.SETUP && (
          <PuzzleSetupScreen
  t={t}
  language={language}
  photoMode={photoMode}
  selectedImages={selectedImages}
  settings={puzzleSettings}
  onChangeSetting={changePuzzleSetting}
            onBack={() => {
              playClick()
              setScreen(SCREEN.MAIN)
            }}
            onStart={startPuzzle}
          />
        )}
        
{screen === SCREEN.PLAY && (
  <PuzzlePlayScreen
    key={`${playIndex}-${currentPieceCount}-${puzzleSettings.playMode}`}
    t={t}
    selectedImages={[selectedImages[playIndex] ?? selectedImages[0]]}
    settings={{
      ...puzzleSettings,
      pieceCount: currentPieceCount,
    }}
    onComplete={completePuzzle}
    onTimeout={timeoutPuzzle}
    onExit={() => {
      playClick()
      setScreen(SCREEN.SETUP)
    }}
  />
)}
{screen === SCREEN.RESULT && (
  <ResultScreen
    t={t}
    image={selectedImages[result.imageIndex ?? playIndex] ?? selectedImages[0]}
    pieceCount={result.pieceCount ?? currentPieceCount}
    settings={puzzleSettings}
    result={result}
    isMultiMode={photoMode === PHOTO_MODE.MULTIPLE}
    hasNextPuzzle={
      result.playMode === "challenge"
        ? (result.pieceCount ?? currentPieceCount) < 20
        : playIndex < selectedImages.length - 1
    }
    onPuzzleShare={async (message) => {
      playClick()

      const shareImage =
        selectedImages[result.imageIndex ?? playIndex] ?? selectedImages[0]

      await sharePuzzleImage({
        image: shareImage,
        title: t.mainTitle,
        message,
        pieceCount: result.pieceCount ?? currentPieceCount,
        puzzleType: puzzleSettings.puzzleType,
      })
    }}
    onLinkShare={async (message) => {
      playClick()

      await sharePuzzleLink({
        message,
        sharePlayNow: t.sharePlayNow,
      })
    }}
    onNext={nextPuzzle}
onConfirm={goMainFromResult}
  />
)}

        {popup && (
          <Popup
            title={   popup === "rule"     ? t.rule     : popup === "code"       ? t.codeInput       : t.setting }
            closeText={t.close}
            onClose={() => {
              playClick()
              setPopup(null)
            }}
          >
{popup === "rule" ? (
  <>
    {t.rules.map((rule) => (
      <div key={rule}>{rule}</div>
    ))}
  </>
) : popup === "code" ? (
  <>
    <input
      value={codeInput}
      onChange={(e) => {
        setCodeInput(e.target.value)
        setCodeMessage("")
      }}
      placeholder={t.codePlaceholder}
      style={styles.codeInput}
    />

    {codeMessage && (
      <div style={styles.codeMessage}>
        {codeMessage}
      </div>
    )}

   <button
  style={styles.codeConfirmBtn}
      onClick={() => {
        playClick()

        const valid = checkMonthlyCode(codeInput)

        if (valid) {
  setIsAdFree(true)
  setCodeMessage(t.codeSuccess)
  return
}

        setCodeMessage(t.codeFail)
      }}
    >
      {t.confirm}
    </button>
  </>
) : (
              <>
                <button
                  style={styles.popupBtn}
                  onClick={() => {
                    playClick()
                    resetData()
                  }}
                >
                  {t.resetRecord}
                </button>

                <button
                  style={styles.popupBtn}
                  onClick={async () => {
                    playClick()

                    if (installPrompt) {
                      installPrompt.prompt()
                      await installPrompt.userChoice
                      setInstallPrompt(null)
                      return
                    }

                    alert(
                      language === "ko"
                        ? "브라우저 메뉴에서 '홈 화면에 추가'를 선택하세요."
                        : "Use your browser menu and choose 'Add to Home Screen'."
                    )
                  }}
                >
                  {t.addHome}
                </button>
                
                <button
  style={styles.popupBtn}
  onClick={() => {
    playClick()
    setCodeInput("")
    setCodeMessage("")
    setPopup("code")
  }}
>
  {t.codeInput}
</button>

                <div style={styles.settingRow}>
                  {t.sound}
                  <button
                    onClick={() => {
                      playClick()
                      setSoundOn(!soundOn)
                    }}
                    style={soundOn ? styles.onBtn : styles.offBtn}
                  >
                    {soundOn ? "ON" : "OFF"}
                  </button>
                </div>

                <div style={styles.settingRow}>
                  {t.bgm}
                  <button
                    onClick={() => {
                      playClick()
                      setBgmOn(!bgmOn)
                    }}
                    style={bgmOn ? styles.onBtn : styles.offBtn}
                  >
                    {bgmOn ? "ON" : "OFF"}
                  </button>
                </div>

                <div style={styles.settingRow}>
                  {t.language}
                  <button
                    onClick={() => {
                      playClick()
                      setLanguage(language === "ko" ? "en" : "ko")
                    }}
                    style={styles.langBtn}
                  >
                    {language === "ko" ? "한국어 🇰🇷" : "English 🇺🇸"}
                  </button>
                </div>

                <div style={styles.settingRow}>
                  {t.volume}
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                  />
                </div>
              </>
            )}
          </Popup>
        )}
      </div>

      {!isMobile && <div style={styles.sideAd}>{t.ad}</div>}
    </div>
  )
}

const styles = {
  page: {
    width: "100vw",
    minHeight: "100vh",
    background: "#111",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    color: "#2a1b10",
    fontFamily: "Pretendard, system-ui, sans-serif",
  },

  app: {
    position: "relative",
    width: "390px",
    minWidth: "390px",
    flexShrink: 0,
    minHeight: "844px",
    transformOrigin: "top center",
    background:
      "linear-gradient(180deg, #fffaf1 0%, #fff7e8 48%, #dff0a8 100%)",
    padding: "18px",
    boxSizing: "border-box",
    overflow: "visible",
  },

  sideAd: {
    width: "160px",
    height: "600px",
    margin: "20px 16px",
    background: "#222",
    borderRadius: "12px",
    border: "1px solid #333",
    color: "#777",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    flexShrink: 0,
  },

  backBtn: {
    marginBottom: "18px",
    border: "1px solid #eadcc8",
    background: "#fffaf1",
    color: "#2a1b10",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "bold",
  },

  infoPage: {
    padding: "18px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.75)",
    border: "1px solid #eadcc8",
    color: "#4b3826",
    lineHeight: "1.7",
    fontSize: "14px",
  },

  infoPageTitle: {
    color: "#2a1b10",
    fontSize: "24px",
    fontWeight: "900",
    marginBottom: "16px",
  },

  footerLinks: {
    marginTop: "16px",
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  footerLinkBtn: {
    marginTop: "4px",
    border: "1px solid #eadcc8",
    background: "#fffaf1",
    color: "#2a1b10",
    padding: "7px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  popupBtn: {
    width: "100%",
    padding: "13px",
    marginBottom: "10px",
    borderRadius: "12px",
    border: "1px solid #eadcc8",
    background: "#fff",
    color: "#2a1b10",
    fontSize: "15px",
    fontWeight: "bold",
  },
  codeConfirmBtn: {
  width: "100%",
  padding: "13px",
  marginBottom: "10px",
  borderRadius: "12px",
  border: "none",
  background: "#2db94d",
  color: "#fff",
  fontSize: "15px",
  fontWeight: "bold",
},
  codeInput: {
  width: "100%",
  height: "52px",
  padding: "0 14px",
  marginBottom: "10px",
  borderRadius: "12px",
  border: "1px solid #eadcc8",
  background: "#fff",
  color: "#2a1b10",
  fontSize: "16px",
  fontWeight: "800",
  boxSizing: "border-box",
  outline: "none",
},

codeMessage: {
  marginBottom: "10px",
  color: "#5b4636",
  fontSize: "14px",
  fontWeight: "800",
  textAlign: "center",
},

  settingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "12px",
    fontSize: "14px",
    gap: "12px",
  },

  onBtn: {
    background: "#28a745",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    fontWeight: "bold",
  },

  offBtn: {
    background: "#ddd",
    color: "#333",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    fontWeight: "bold",
  },

  langBtn: {
    background: "#fff",
    color: "#2a1b10",
    border: "1px solid #eadcc8",
    padding: "6px 12px",
    borderRadius: "8px",
    fontWeight: "bold",
  },
}