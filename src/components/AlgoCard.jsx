import BorderGlow from "./BorderGlow"

const difficultyLabel = ["", "Beginner", "Intermediate", "Advanced"]

function hexToHsl(hex) {
  const value = hex.replace("#", "")
  const r = parseInt(value.slice(0, 2), 16) / 255
  const g = parseInt(value.slice(2, 4), 16) / 255
  const b = parseInt(value.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lightness = (max + min) / 2
  const delta = max - min
  let hue = 0
  let saturation = 0

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1))

    if (max === r) {
      hue = 60 * (((g - b) / delta) % 6)
    } else if (max === g) {
      hue = 60 * ((b - r) / delta + 2)
    } else {
      hue = 60 * ((r - g) / delta + 4)
    }
  }

  return `${Math.round((hue + 360) % 360)} ${Math.round(saturation * 100)} ${Math.round(lightness * 100)}`
}

function AlgoCard({ algo }) {
  return (
    <BorderGlow
      glowColor={hexToHsl(algo.accent)}
      colors={[algo.accent, "#f472b6", "#38bdf8"]}
      backgroundColor="#13131f"
      borderRadius={24}
      glowRadius={34}
      fillOpacity={0.35}
    >
      <div
        className="algo-card"
        style={{ "--accent": algo.accent }}
      >
        <div className="card-glow" />

        <span className="card-tag">{algo.tagLabel}</span>

        <div className="card-icon">{algo.icon}</div>

        <h3 className="card-title">{algo.title}</h3>

        <div className="diff-bar">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`diff-seg ${i <= algo.difficulty ? "filled" : ""}`}
            />
          ))}
          <span className="diff-label">{difficultyLabel[algo.difficulty]}</span>
        </div>

        <p className="card-desc">{algo.desc}</p>

        <div className="card-meta">
          <span className="meta-item">⏱ {algo.complexity}</span>
        </div>
      </div>
    </BorderGlow>
  )
}

export default AlgoCard
