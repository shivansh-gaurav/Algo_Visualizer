import { useCallback, useEffect, useRef } from "react"

function parseHSL(hslStr) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/)

  if (!match) return { h: 40, s: 80, l: 80 }

  return {
    h: parseFloat(match[1]),
    s: parseFloat(match[2]),
    l: parseFloat(match[3]),
  }
}

function buildGlowVars(glowColor, intensity) {
  const { h, s, l } = parseHSL(glowColor)
  const base = `${h}deg ${s}% ${l}%`
  const opacities = [100, 60, 50, 40, 30, 20, 10]
  const keys = ["", "-60", "-50", "-40", "-30", "-20", "-10"]
  const vars = {}

  opacities.forEach((opacity, i) => {
    vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(
      opacity * intensity,
      100,
    )}%)`
  })

  return vars
}

const GRADIENT_POSITIONS = [
  "80% 55%",
  "69% 34%",
  "8% 6%",
  "41% 38%",
  "86% 85%",
  "82% 18%",
  "51% 4%",
]

const GRADIENT_KEYS = [
  "--gradient-one",
  "--gradient-two",
  "--gradient-three",
  "--gradient-four",
  "--gradient-five",
  "--gradient-six",
  "--gradient-seven",
]

const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1]

function buildGradientVars(colors) {
  const vars = {}

  for (let i = 0; i < GRADIENT_KEYS.length; i += 1) {
    const color = colors[Math.min(COLOR_MAP[i], colors.length - 1)]
    vars[GRADIENT_KEYS[i]] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${color} 0px, transparent 50%)`
  }

  vars["--gradient-base"] = `linear-gradient(${colors[0]} 0 100%)`

  return vars
}

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3)
}

function easeInCubic(x) {
  return x * x * x
}

function animateValue({
  start = 0,
  end = 100,
  duration = 1000,
  delay = 0,
  ease = easeOutCubic,
  onUpdate,
  onEnd,
}) {
  const timeoutId = window.setTimeout(() => {
    const t0 = performance.now()

    function tick() {
      const elapsed = performance.now() - t0
      const t = Math.min(elapsed / duration, 1)

      onUpdate(start + (end - start) * ease(t))

      if (t < 1) {
        requestAnimationFrame(tick)
      } else if (onEnd) {
        onEnd()
      }
    }

    requestAnimationFrame(tick)
  }, delay)

  return () => window.clearTimeout(timeoutId)
}

function BorderGlow({
  children,
  className = "",
  edgeSensitivity = 30,
  glowColor = "40 80 80",
  backgroundColor = "#060010",
  borderRadius = 24,
  glowRadius = 34,
  glowIntensity = 1,
  coneSpread = 25,
  animated = true,
  colors = ["#c084fc", "#f472b6", "#38bdf8"],
  fillOpacity = 0.4,
}) {
  const cardRef = useRef(null)

  const getCenterOfElement = useCallback((el) => {
    const { width, height } = el.getBoundingClientRect()

    return [width / 2, height / 2]
  }, [])

  const getEdgeProximity = useCallback(
    (el, x, y) => {
      const [cx, cy] = getCenterOfElement(el)
      const dx = x - cx
      const dy = y - cy
      const kx = dx === 0 ? Infinity : cx / Math.abs(dx)
      const ky = dy === 0 ? Infinity : cy / Math.abs(dy)

      return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1)
    },
    [getCenterOfElement],
  )

  const getCursorAngle = useCallback(
    (el, x, y) => {
      const [cx, cy] = getCenterOfElement(el)
      const dx = x - cx
      const dy = y - cy

      if (dx === 0 && dy === 0) return 0

      let degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90

      if (degrees < 0) degrees += 360

      return degrees
    },
    [getCenterOfElement],
  )

  const handlePointerMove = useCallback(
    (event) => {
      const card = cardRef.current

      if (!card) return

      const rect = card.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const edge = getEdgeProximity(card, x, y)
      const angle = getCursorAngle(card, x, y)

      card.style.setProperty("--edge-proximity", `${(edge * 100).toFixed(3)}`)
      card.style.setProperty("--cursor-angle", `${angle.toFixed(3)}deg`)
    },
    [getEdgeProximity, getCursorAngle],
  )

  useEffect(() => {
    const card = cardRef.current

    if (!animated || !card) return undefined

    const cleanups = []
    const angleStart = 110
    const angleEnd = 465

    card.classList.add("sweep-active")
    card.style.setProperty("--cursor-angle", `${angleStart}deg`)

    cleanups.push(
      animateValue({
        duration: 500,
        onUpdate: (value) => card.style.setProperty("--edge-proximity", value),
      }),
    )
    cleanups.push(
      animateValue({
        ease: easeInCubic,
        duration: 1500,
        end: 50,
        onUpdate: (value) => {
          card.style.setProperty(
            "--cursor-angle",
            `${(angleEnd - angleStart) * (value / 100) + angleStart}deg`,
          )
        },
      }),
    )
    cleanups.push(
      animateValue({
        ease: easeOutCubic,
        delay: 1500,
        duration: 2250,
        start: 50,
        end: 100,
        onUpdate: (value) => {
          card.style.setProperty(
            "--cursor-angle",
            `${(angleEnd - angleStart) * (value / 100) + angleStart}deg`,
          )
        },
      }),
    )
    cleanups.push(
      animateValue({
        ease: easeInCubic,
        delay: 2500,
        duration: 1500,
        start: 100,
        end: 0,
        onUpdate: (value) => card.style.setProperty("--edge-proximity", value),
        onEnd: () => card.classList.remove("sweep-active"),
      }),
    )

    return () => {
      cleanups.forEach((cleanup) => cleanup())
      card.classList.remove("sweep-active")
    }
  }, [animated])

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`border-glow-card ${className}`}
      style={{
        "--card-bg": backgroundColor,
        "--edge-sensitivity": edgeSensitivity,
        "--border-radius": `${borderRadius}px`,
        "--glow-padding": `${glowRadius}px`,
        "--cone-spread": coneSpread,
        "--fill-opacity": fillOpacity,
        ...buildGlowVars(glowColor, glowIntensity),
        ...buildGradientVars(colors),
      }}
    >
      <span className="edge-light" />
      <div className="border-glow-inner">{children}</div>
    </div>
  )
}

export default BorderGlow
