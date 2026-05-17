import "../Bubble Sort/BubbleSortVisualizer.css"

function SortingVisualizerShell({
  algo,
  onBack,
  eyebrow = "Interactive walkthrough",
  stats,
  stageLabel,
  visual,
  visualClassName = "bars",
  visualStyle,
  pseudocodeLines,
  activePseudocodeLine,
  stepIndex,
  stepsLength,
  isPlaying,
  message,
  manualInput,
  inputError,
  manualInputId,
  placeholder,
  onManualInputChange,
  onApplyManualValues,
  onPrevious,
  onTogglePlay,
  onNext,
  onReset,
  onShuffle,
  extraControls,
}) {
  const progress =
    stepsLength > 1 ? Math.round((stepIndex / (stepsLength - 1)) * 100) : 100
  const statItems = stats || [
    `Time ${algo?.complexity || "O(?)"}`,
    "Interactive",
    `${stepsLength} steps`,
  ]

  return (
    <main
      className="visualizer-page"
      style={{ "--accent": algo?.accent || "#a78bfa" }}
    >
      <header className="visualizer-topbar">
        <button className="ghost-btn" type="button" onClick={onBack}>
          ← Algorithms
        </button>
        <span className="visualizer-chip">{algo?.tagLabel || "Sorting"}</span>
      </header>

      <section className="visualizer-hero">
        <div className="visualizer-copy">
          <p className="section-label">{eyebrow}</p>
          <h1>{algo?.title || "Sorting Algorithm"}</h1>
          <p>{algo?.desc}</p>
          <div className="visualizer-stats">
            {statItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="sort-stage" aria-label={stageLabel}>
          <div className="sort-workspace">
            <div className={visualClassName} style={visualStyle}>
              {visual}
            </div>

            <aside className="pseudocode-panel" aria-label="Sorting pseudocode">
              <span className="pseudocode-title">Pseudocode</span>
              <ol>
                {pseudocodeLines.map((line, index) => (
                  <li
                    className={activePseudocodeLine === index ? "active" : ""}
                    key={`${index}-${line}`}
                  >
                    <code>{line}</code>
                  </li>
                ))}
              </ol>
            </aside>
          </div>

          <div className="step-panel">
            <div>
              <span className="step-count">
                Step {stepIndex + 1} / {stepsLength}
              </span>
              <p>{message}</p>
            </div>
            <div className="progress-track">
              <div style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="control-strip">
        <button
          type="button"
          onClick={onPrevious}
          disabled={stepIndex === 0}
        >
          Previous
        </button>
        <button
          type="button"
          className="primary-btn"
          onClick={onTogglePlay}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={stepIndex === stepsLength - 1}
        >
          Next
        </button>
        <button type="button" onClick={onReset}>
          Reset
        </button>
        {onShuffle && (
          <button type="button" onClick={onShuffle}>
            Shuffle
          </button>
        )}
        {manualInputId && (
          <form className="manual-array-form" onSubmit={onApplyManualValues}>
            <label htmlFor={manualInputId}>Custom array</label>
            <input
              id={manualInputId}
              type="text"
              value={manualInput}
              onChange={(event) => onManualInputChange(event.target.value)}
              placeholder={placeholder}
              aria-describedby={
                inputError ? `${manualInputId}-error` : undefined
              }
            />
            <button type="submit">Apply</button>
            {inputError && (
              <span id={`${manualInputId}-error`} className="manual-array-error">
                {inputError}
              </span>
            )}
          </form>
        )}
        {extraControls}
      </section>
    </main>
  )
}

export default SortingVisualizerShell
