const difficultyLabel = ["", "Beginner", "Intermediate", "Advanced"]

function AlgoCard({ algo }) {
  return (
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
  )
}

export default AlgoCard
