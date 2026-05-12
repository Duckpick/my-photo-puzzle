export function getClassicPiecePath(
  width,
  height,
  padding,
  edges
) {
  const left = padding
  const top = padding
  const right = padding + width
  const bottom = padding + height

  const size = Math.min(width, height)

  const head = size * 0.36
  const neck = size * 0.065
  const shoulder = size * 0.17

  const cx = padding + width / 2
  const cy = padding + height / 2

  const edgeTop = edges?.top ?? 0
  const edgeRight = edges?.right ?? 0
  const edgeBottom = edges?.bottom ?? 0
  const edgeLeft = edges?.left ?? 0

  const topPath =
    edgeTop === 0
      ? `L ${right} ${top}`
      : `
        L ${cx - shoulder} ${top}
        C ${cx - shoulder} ${top - neck * edgeTop},
          ${cx - head} ${top - head * edgeTop},
          ${cx} ${top - head * edgeTop}
        C ${cx + head} ${top - head * edgeTop},
          ${cx + shoulder} ${top - neck * edgeTop},
          ${cx + shoulder} ${top}
        L ${right} ${top}
      `

  const rightPath =
    edgeRight === 0
      ? `L ${right} ${bottom}`
      : `
        L ${right} ${cy - shoulder}
        C ${right + neck * edgeRight} ${cy - shoulder},
          ${right + head * edgeRight} ${cy - head},
          ${right + head * edgeRight} ${cy}
        C ${right + head * edgeRight} ${cy + head},
          ${right + neck * edgeRight} ${cy + shoulder},
          ${right} ${cy + shoulder}
        L ${right} ${bottom}
      `

  const bottomPath =
    edgeBottom === 0
      ? `L ${left} ${bottom}`
      : `
        L ${cx + shoulder} ${bottom}
        C ${cx + shoulder} ${bottom + neck * edgeBottom},
          ${cx + head} ${bottom + head * edgeBottom},
          ${cx} ${bottom + head * edgeBottom}
        C ${cx - head} ${bottom + head * edgeBottom},
          ${cx - shoulder} ${bottom + neck * edgeBottom},
          ${cx - shoulder} ${bottom}
        L ${left} ${bottom}
      `

  const leftPath =
    edgeLeft === 0
      ? `L ${left} ${top}`
      : `
        L ${left} ${cy + shoulder}
        C ${left - neck * edgeLeft} ${cy + shoulder},
          ${left - head * edgeLeft} ${cy + head},
          ${left - head * edgeLeft} ${cy}
        C ${left - head * edgeLeft} ${cy - head},
          ${left - neck * edgeLeft} ${cy - shoulder},
          ${left} ${cy - shoulder}
        L ${left} ${top}
      `

  return `
    M ${left} ${top}
    ${topPath}
    ${rightPath}
    ${bottomPath}
    ${leftPath}
    Z
  `
}