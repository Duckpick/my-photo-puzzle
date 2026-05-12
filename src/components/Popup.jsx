export default function Popup({
  title,
  children,
  onClose,
  closeText,
}) {
  return (
    <div style={styles.dim}>
      <div style={styles.box}>
        <div style={styles.title}>
          {title}
        </div>

        <div style={styles.content}>
          {children}
        </div>

        <button style={styles.closeBtn} onClick={onClose}>
          {closeText}
        </button>
      </div>
    </div>
  )
}

const styles = {
  dim: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "60px",
    zIndex: 999999,
    overflowY: "auto",
  },

  box: {
    width: "320px",
    padding: "18px",
    borderRadius: "18px",
    background: "#fffaf1",
    border: "1px solid #eadcc8",
    color: "#2a1b10",
    boxSizing: "border-box",
    margin: "12px auto 24px",
    maxHeight: "calc(100vh - 40px)",
    overflowY: "auto",
  },

  title: {
    fontSize: "23px",
    fontWeight: "900",
    color: "#2a1b10",
    marginBottom: "14px",
    textAlign: "center",
  },

  content: {
    fontSize: "15px",
    lineHeight: "1.8",
    color: "#4b3826",
  },

  closeBtn: {
    width: "100%",
    marginTop: "16px",
    padding: "13px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(180deg, #ff8a1c, #ff6700)",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
  },
}