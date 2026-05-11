import Aurora from "./Aurora"
import BlurText from "./BlurText"
// import SplitText from "./SplitText";

function Hero() {
  return (
    <div className="hero">
      <Aurora
        colorStops={["#7c3aed", "#f472b6", "#38bdf8"]}
        amplitude={1.2}
        speed={0.4}
      />

      <div className="badge">
        <div className="dot" />
        Interactive Learning
      </div>

   





{/* <SplitText
  text="Hello, yodhkasjhskjahdkhaskhsau!"
  className="text-2xl font-semibold text-center"
  delay={50}
  duration={1.25}
  ease="power3.out"
  splitType="chars"
  from={{ opacity: 0, y: 40 }}
  to={{ opacity: 1, y: 0 }}
  threshold={0.1}
  rootMargin="-100px"
  textAlign="center"
  onLetterAnimationComplete={handleAnimationComplete}
  showCallback
/> */}

      <h1>
        <BlurText text="Learn Algorithms Visually" />
      </h1>

      <p>
        Animated, beginner-friendly walkthroughs of sorting and recursion —
        built for people who think in pictures.
      </p>
    </div>
  )
}

export default Hero
