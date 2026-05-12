export default function AdBox({ text }) {
  return (
    <div style={styles.adBox}>
      {text}
    </div>
  )
}

const styles = {
  adBox: {
    marginTop: "42px",
    height: "100px",
    background: "rgba(255,255,255,0.75)",
    border: "1px dashed #d8c6a8",
    borderRadius: "14px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#9b8360",
    fontSize: "14px",
  },
}