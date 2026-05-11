import { useEffect, useMemo, useRef, useState } from "react"
import { gsap } from "gsap"
import AlgoCard from "./AlgoCard"

const DESKTOP_PATTERN = [
  "rotate(10deg) translate(-300px)",
  "rotate(5deg) translate(-150px)",
  "rotate(-3deg)",
  "rotate(-10deg) translate(150px)",
  "rotate(2deg) translate(300px)",
]

const TABLET_PATTERN = [
  "rotate(10deg) translate(-220px)",
  "rotate(5deg) translate(-110px)",
  "rotate(-3deg)",
  "rotate(-10deg) translate(110px)",
  "rotate(2deg) translate(220px)",
]

const MOBILE_PATTERN = [
  "rotate(8deg) translate(-108px)",
  "rotate(4deg) translate(-54px)",
  "rotate(-2deg)",
  "rotate(-7deg) translate(54px)",
  "rotate(2deg) translate(108px)",
]

const chunkItems = (items, size) =>
  items.reduce((groups, item, index) => {
    const groupIndex = Math.floor(index / size)
    groups[groupIndex] = [...(groups[groupIndex] || []), item]
    return groups
  }, [])

const getNoRotationTransform = (transformStr) => {
  const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr)

  if (hasRotate) {
    return transformStr.replace(/rotate\([\s\S]*?\)/, "rotate(0deg)")
  }

  return transformStr === "none" ? "rotate(0deg)" : `${transformStr} rotate(0deg)`
}

const getPushedTransform = (baseTransform, offsetX) => {
  const translateRegex = /translate\(([-0-9.]+)px\)/
  const match = baseTransform.match(translateRegex)

  if (match) {
    const currentX = parseFloat(match[1])
    return baseTransform.replace(translateRegex, `translate(${currentX + offsetX}px)`)
  }

  return baseTransform === "none"
    ? `translate(${offsetX}px)`
    : `${baseTransform} translate(${offsetX}px)`
}

function useCardPattern() {
  const [pattern, setPattern] = useState(DESKTOP_PATTERN)

  useEffect(() => {
    const updatePattern = () => {
      if (window.innerWidth < 560) {
        setPattern(MOBILE_PATTERN)
      } else if (window.innerWidth < 820) {
        setPattern(TABLET_PATTERN)
      } else {
        setPattern(DESKTOP_PATTERN)
      }
    }

    updatePattern()
    window.addEventListener("resize", updatePattern)

    return () => window.removeEventListener("resize", updatePattern)
  }, [])

  return pattern
}

function BounceCards({
  items,
  onSelect,
  animationDelay = 0.25,
  animationStagger = 0.06,
  easeType = "elastic.out(1, 0.8)",
  enableHover = true,
}) {
  const containerRef = useRef(null)
  const transformStyles = useCardPattern()
  const groups = useMemo(() => chunkItems(items, 5), [items])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".bounce-card")

      gsap.killTweensOf(cards)
      gsap.set(cards, { opacity: 0, scale: 0 })

      gsap.to(cards, {
        opacity: 1,
        scale: 1,
        stagger: animationStagger,
        ease: easeType,
        delay: animationDelay,
      })
    }, containerRef)

    return () => ctx.revert()
  }, [items, animationDelay, animationStagger, easeType])

  const getCard = (groupIndex, cardIndex) => {
    const selector = `.bounce-card[data-group="${groupIndex}"][data-card="${cardIndex}"]`
    return containerRef.current?.querySelector(selector)
  }

  const pushSiblings = (groupIndex, hoveredIdx) => {
    if (!enableHover) return

    groups[groupIndex].forEach((_, i) => {
      const card = getCard(groupIndex, i)
      const baseTransform = transformStyles[i] || "none"

      gsap.killTweensOf(card)

      if (i === hoveredIdx) {
        gsap.to(card, {
          transform: getNoRotationTransform(baseTransform),
          duration: 0.4,
          ease: "back.out(1.4)",
          overwrite: "auto",
        })
      } else {
        const offsetX = i < hoveredIdx ? -95 : 95
        const distance = Math.abs(hoveredIdx - i)

        gsap.to(card, {
          transform: getPushedTransform(baseTransform, offsetX),
          duration: 0.4,
          ease: "back.out(1.4)",
          delay: distance * 0.05,
          overwrite: "auto",
        })
      }
    })
  }

  const resetSiblings = (groupIndex) => {
    if (!enableHover) return

    groups[groupIndex].forEach((_, i) => {
      const card = getCard(groupIndex, i)

      gsap.killTweensOf(card)
      gsap.to(card, {
        transform: transformStyles[i] || "none",
        duration: 0.4,
        ease: "back.out(1.4)",
        overwrite: "auto",
      })
    })
  }

  return (
    <div className="bounce-cards" ref={containerRef}>
      {groups.map((group, groupIndex) => (
        <div className="bounce-row" key={group.map((item) => item.id).join("-")}>
          {group.map((algo, cardIndex) => (
            <div
              className="bounce-card"
              key={algo.id}
              data-card={cardIndex}
              data-group={groupIndex}
              style={{ transform: transformStyles[cardIndex] || "none" }}
              onMouseEnter={() => pushSiblings(groupIndex, cardIndex)}
              onMouseLeave={() => resetSiblings(groupIndex)}
            >
              <AlgoCard algo={algo} onSelect={onSelect} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default BounceCards
