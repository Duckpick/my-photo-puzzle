export default function Footer({
  t,
  onPrivacy,
  onContact,
  onSupport,
}) {
  return (
    <div style={styles.footer}>
      <div style={styles.title}>
        {t.aboutTitle}
      </div>

      <div style={styles.text}>
        {t.aboutText}
      </div>

      <div style={styles.noticeBox}>
        <div>{t.photoNotUploaded}</div>
        <div>{t.photoLocalOnly}</div>
        <div>{t.photoRefreshNotice}</div>
      </div>

      <div style={styles.linkBox}>
        <button style={styles.linkBtn} onClick={onPrivacy}>
          {t.privacy}
        </button>

        <button style={styles.linkBtn} onClick={onContact}>
          {t.contact}
        </button>

        <button style={styles.linkBtn} onClick={onSupport}>
          {t.support}
        </button>
      </div>
    </div>
  )
}

const styles = {
  footer: {
    marginTop: "24px",
    padding: "16px 12px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.72)",
    border: "1px solid #eadcc8",
    textAlign: "center",
  },

  title: {
    fontSize: "16px",
    fontWeight: "900",
    color: "#2a1b10",
    marginBottom: "8px",
  },

  text: {
    fontSize: "13px",
    lineHeight: "1.6",
    color: "#5d4a34",
    marginBottom: "14px",
    wordBreak: "keep-all",
  },

  noticeBox: {
    fontSize: "11px",
    lineHeight: "1.7",
    color: "#7a654a",
    marginBottom: "16px",
  },

  linkBox: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  linkBtn: {
    border: "1px solid #eadcc8",
    background: "#fffaf1",
    color: "#2a1b10",
    padding: "7px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "bold",
  },
}