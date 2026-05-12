import { IMAGE_PATHS } from "../constants/config"

export default function Header({ t, onRule, onSetting }) {
  return (
    <div style={styles.header}>
      <div style={styles.brandBox}>
        <img src={IMAGE_PATHS.logo} alt={t.brand} style={styles.logo} />
        <div style={styles.brandText}>{t.brand}</div>
      </div>

      <div style={styles.buttonBox}>
        <button style={styles.iconBtn} onClick={onRule} aria-label={t.rule}>
          ?
        </button>

        <button style={styles.iconBtn} onClick={onSetting} aria-label={t.setting}>
          ⚙
        </button>
      </div>
    </div>
  )
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "0px",
    marginBottom: "30px",
    position: "relative",
    zIndex: 2,
  },

  brandBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: 0,
  },

  logo: {
    width: "42px",
    height: "42px",
    objectFit: "contain",
    flexShrink: 0,
  },

  brandText: {
    fontSize: "19px",
    fontWeight: "900",
    color: "#2a1b10",
    whiteSpace: "nowrap",
    letterSpacing: "-0.5px",
  },

  buttonBox: {
    display: "flex",
    gap: "8px",
    flexShrink: 0,
  },

  iconBtn: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    border: "1px solid #eadcc8",
    background: "#fffaf1",
    color: "#2a1b10",
    fontSize: "22px",
    fontWeight: "900",
    boxShadow: "0 3px 8px rgba(120,80,30,0.12)",
  },
}