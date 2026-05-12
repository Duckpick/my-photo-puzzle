import { useState } from "react"

export default function Dropdown({
  value,
  options,
  onChange,
  closeText,
}) {
  const [open, setOpen] = useState(false)

  const selected =
    options.find((item) => String(item.value) === String(value)) ?? options[0]

  return (
    <>
      <button
        type="button"
        style={styles.trigger}
        onClick={() => setOpen(true)}
      >
        <span style={styles.selectedText}>{selected?.label}</span>
        <span style={styles.arrow}>⌄</span>
      </button>

      {open && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <div style={styles.list}>
              {options.map((item) => {
                const isActive = String(item.value) === String(value)

                return (
                  <button
                    key={item.value}
                    type="button"
                    style={{
                      ...styles.option,
                      ...(isActive ? styles.optionActive : {}),
                    }}
                    onClick={() => {
                      onChange(item.value)
                      setOpen(false)
                    }}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              style={styles.closeBtn}
              onClick={() => setOpen(false)}
            >
              {closeText}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

const styles = {
  trigger: {
    width: "132px",
    height: "40px",
    borderRadius: "14px",
    border: "1px solid #eadcc8",
    background: "#fffaf1",
    color: "#2a1b10",
    fontSize: "14px",
    fontWeight: "900",
    padding: "0 11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 3px 8px rgba(120,80,30,0.08)",
    flexShrink: 0,
  },

  selectedText: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    paddingRight: "6px",
  },

  arrow: {
    fontSize: "18px",
    fontWeight: "900",
    color: "#7a5632",
    lineHeight: "1",
  },

  overlay: {
    position: "absolute",
    left: "12px",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 50,
    display: "flex",
    justifyContent: "center",
    pointerEvents: "auto",
  },

  popup: {
    width: "100%",
    maxWidth: "280px",
    maxHeight: "300px",
    borderRadius: "22px",
    background: "#fffaf1",
    border: "1px solid #eadcc8",
    boxShadow: "0 16px 40px rgba(50,30,10,0.28)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  list: {
    padding: "10px",
    overflowY: "auto",
    maxHeight: "226px",
  },

  option: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "14px",
    border: "none",
    background: "transparent",
    color: "#2a1b10",
    fontSize: "17px",
    fontWeight: "900",
    textAlign: "left",
    marginBottom: "4px",
  },

  optionActive: {
    background: "linear-gradient(180deg, #ff8a1c, #ff6700)",
    color: "#fff",
  },

  closeBtn: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderTop: "1px solid #eadcc8",
    background: "#fff7e8",
    color: "#2a1b10",
    fontSize: "17px",
    fontWeight: "900",
  },
}