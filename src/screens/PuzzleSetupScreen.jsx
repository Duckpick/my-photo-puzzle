import {
  PIECE_OPTIONS,
  TIME_OPTIONS,
  HINT_TYPES,
  PLAY_MODES,
  PUZZLE_TYPES,
  PHOTO_MODE,
} from "../constants/config"
import Dropdown from "../components/Dropdown"

function getLabel(item, language) {
  return language === "ko" ? item.ko : item.en
}

export default function PuzzleSetupScreen({
  t,
  language,
  photoMode,
  selectedImages,
  settings,
  onChangeSetting,
  onBack,
  onStart,
}) {
  const availableModes = PLAY_MODES.filter((mode) => {
    if (
      photoMode === PHOTO_MODE.SINGLE &&
      (mode.id === "sequence" || mode.id === "random")
    ) {
      return false
    }

    return true
  })

  return (
    <div style={styles.wrap}>
      <div style={styles.topRow}>
        <button style={styles.backBtn} onClick={onBack}>
          ‹
        </button>

        <div style={styles.title}>{t.puzzleSettings}</div>

        <div style={styles.emptyBox} />
      </div>

      <div style={styles.photoSection}>
        <div style={styles.sectionTitle}>{t.selectedPhotos}</div>

        <div
          style={{
            ...styles.photoListBox,
            justifyContent:
              selectedImages.length === 1 ? "center" : "flex-start",
          }}
        >
          {selectedImages.map((image, index) => (
            <img key={index} src={image} style={styles.photoThumb} />
          ))}
        </div>
      </div>

      <div style={styles.settingBox}>
        <SettingRow
          icon="🧩"
          label={t.puzzleType}
          closeText={t.close}
          value={settings.puzzleType}
          onChange={(value) => onChangeSetting("puzzleType", value)}
          options={PUZZLE_TYPES.map((item) => ({
            value: item.id,
            label: getLabel(item, language),
          }))}
        />

        <SettingRow
  icon="▦"
  label={t.pieceCount}
  closeText={t.close}
  value={settings.pieceCount}
  onChange={(value) => onChangeSetting("pieceCount", Number(value))}
  options={PIECE_OPTIONS.map((piece) => ({
    value: piece,
    label: language === "ko" ? `${piece}조각` : `${piece} Pieces`,
  }))}
/>

        <SettingRow
          icon="🕒"
          label={t.timeLimit}
          closeText={t.close}
          value={settings.timeLimit}
          onChange={(value) => onChangeSetting("timeLimit", value)}
          options={TIME_OPTIONS.map((item) => ({
            value: item.id,
            label: getLabel(item, language),
          }))}
        />

        <SettingRow
          icon="💡"
          label={t.hintOption}
          closeText={t.close}
          value={settings.hintType}
          onChange={(value) => onChangeSetting("hintType", value)}
          options={HINT_TYPES.map((item) => ({
            value: item.id,
            label: getLabel(item, language),
          }))}
        />

        <SettingRow
          icon="🚩"
          label={t.playMode}
          closeText={t.close}
          value={settings.playMode}
          onChange={(value) => onChangeSetting("playMode", value)}
          options={availableModes.map((item) => ({
            value: item.id,
            label: getLabel(item, language),
          }))}
        />
      </div>

      <button style={styles.startBtn} onClick={onStart}>
        ▶ {t.startGame}
      </button>
    </div>
  )
}

function SettingRow({ icon, label, value, onChange, options, closeText }) {
  return (
    <div style={styles.settingRow}>
      <div style={styles.settingLeft}>
        <div style={styles.settingIcon}>{icon}</div>
        <div style={styles.settingLabel}>{label}</div>
      </div>

      <Dropdown
        value={value}
        options={options}
        onChange={onChange}
        closeText={closeText}
      />
    </div>
  )
}

const styles = {
  wrap: {
    paddingBottom: "24px",
  },

  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "18px",
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
    fontSize: "28px",
    fontWeight: "900",
    color: "#2a1b10",
  },

  emptyBox: {
    width: "42px",
    height: "42px",
  },

  photoSection: {
    marginBottom: "14px",
  },

  sectionTitle: {
    fontSize: "17px",
    fontWeight: "900",
    color: "#2a1b10",
    marginBottom: "8px",
  },

  photoListBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    overflowX: "auto",
    border: "1px solid rgba(196, 170, 130, 0.45)",
    background: "rgba(255,255,255,0.38)",
    borderRadius: "16px",
    padding: "8px",
    minHeight: "80px",
    boxSizing: "border-box",
  },

  photoThumb: {
    width: "66px",
    height: "66px",
    borderRadius: "14px",
    objectFit: "cover",
    flexShrink: 0,
    border: "1px solid rgba(234,220,200,0.9)",
    background: "#fff",
  },

  settingBox: {
  position: "relative",
  border: "1px solid rgba(196, 170, 130, 0.55)",
  borderRadius: "20px",
  overflow: "visible",
  background: "rgba(255,255,255,0.45)",
},

  settingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "68px",
    padding: "9px 12px",
    borderBottom: "1px solid rgba(196, 170, 130, 0.35)",
    boxSizing: "border-box",
    gap: "10px",
  },

  settingLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: 0,
  },

  settingIcon: {
    width: "32px",
    fontSize: "24px",
    textAlign: "center",
    flexShrink: 0,
  },

  settingLabel: {
    fontSize: "17px",
    fontWeight: "900",
    color: "#2a1b10",
    whiteSpace: "nowrap",
  },

  startBtn: {
    width: "100%",
    marginTop: "16px",
    padding: "19px",
    borderRadius: "26px",
    background: "linear-gradient(180deg, #ff8a1c, #ff6700)",
    border: "none",
    color: "#fff",
    fontSize: "25px",
    fontWeight: "900",
    boxShadow: "0 8px 16px rgba(255,103,0,0.3)",
  },
}