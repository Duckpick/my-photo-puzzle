import { IMAGE_PATHS } from "../constants/config"

export default function MainScreen({
  t,
  language,
  onSelectSingle,
  onSelectMultiple,
}) {
  return (
    <main style={styles.main}>
<h1 style={styles.title}>
  <span style={styles.titleAccent}>
    {t.mainTitle.split(" ").slice(0, -1).join(" ")}
  </span>

  <span style={styles.titleSpace}> </span>

  <span>
    {t.mainTitle.split(" ").slice(-1).join(" ")}
  </span>
</h1>

      <div style={styles.desc}>{t.mainDesc}</div>

      <div style={styles.duckArea}>
        <div style={styles.puzzleLeft}>🧩</div>
        <div style={styles.puzzleRight}>🧩</div>

        <div style={styles.decorLeft}>✦</div>
        <div style={styles.decorRight}>✦</div>

        <img
          src={IMAGE_PATHS.duckMain}
          alt={t.title}
          style={styles.duck}
        />
      </div>

      <label style={styles.mainButton}>
        <span style={styles.buttonIcon}>🖼️</span>
        {t.selectPhoto}

        <input
          type="file"
          accept="image/*"
          style={styles.hiddenInput}
          onChange={onSelectSingle}
        />
      </label>

      <label style={styles.subButton}>
        <span style={styles.subButtonIcon}>🖼️</span>
        {t.selectMultiplePhoto}

        <input
          type="file"
          accept="image/*"
          multiple
          style={styles.hiddenInput}
          onChange={onSelectMultiple}
        />
      </label>
    </main>
  )
}

const styles = {
  main: {
    position: "relative",
    textAlign: "center",
    paddingTop: "18px",
  },

  title: {
    margin: "0 0 8px",
    minHeight: "54px",
    fontSize: "44px",
    fontWeight: "900",
    color: "#2a1b10",
    lineHeight: "1.08",
    letterSpacing: "-2px",
    wordBreak: "keep-all",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  titleAccent: {
  color: "#ff7a00",
},

  desc: {
    minHeight: "54px",
    fontSize: "18px",
    fontWeight: "800",
    color: "#2a1b10",
    lineHeight: "1.34",
    marginBottom: "16px",
    wordBreak: "keep-all",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "pre-line",
  },

  duckArea: {
    position: "relative",
    height: "180px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "6px",
  },

  duck: {
    width: "175px",
    height: "175px",
    objectFit: "contain",
    position: "relative",
    zIndex: 2,
  },

  puzzleLeft: {
    position: "absolute",
    left: "18px",
    top: "28px",
    fontSize: "50px",
    opacity: 0.25,
    transform: "rotate(-18deg)",
  },

  puzzleRight: {
    position: "absolute",
    right: "18px",
    top: "14px",
    fontSize: "48px",
    opacity: 0.55,
    transform: "rotate(16deg)",
  },

  decorLeft: {
    position: "absolute",
    left: "28px",
    top: "112px",
    color: "#f4c84c",
    fontSize: "32px",
    zIndex: 3,
  },

  decorRight: {
    position: "absolute",
    right: "22px",
    top: "130px",
    color: "#f4c84c",
    fontSize: "30px",
    zIndex: 3,
  },

  hiddenInput: {
    display: "none",
  },

  mainButton: {
    width: "100%",
    padding: "18px",
    borderRadius: "22px",
    background: "linear-gradient(180deg, #ff8a1c, #ff6700)",
    border: "none",
    color: "#fff",
    fontSize: "25px",
    fontWeight: "900",
    boxShadow: "0 8px 16px rgba(255,103,0,0.3)",
    marginBottom: "13px",
    display: "block",
    boxSizing: "border-box",
  },

  subButton: {
    width: "100%",
    padding: "16px",
    borderRadius: "22px",
    background: "#fffaf1",
    border: "1px solid #eadcc8",
    color: "#2a1b10",
    fontSize: "19px",
    fontWeight: "900",
    boxShadow: "0 5px 12px rgba(120,80,30,0.12)",
    display: "block",
    boxSizing: "border-box",
  },

  buttonIcon: {
    marginRight: "12px",
  },

  subButtonIcon: {
    marginRight: "10px",
  },
  titleSpace: {
  width: "10px",
},
}