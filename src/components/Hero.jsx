import { motion } from "framer-motion"

function Hero() {
  return (
    <motion.header
      className="hero"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <motion.div
        className="algovis-logo"
        aria-label="ALGOVIS"
        whileHover={{ scale: 1.04 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        <span className="logo-mark" aria-hidden="true">
          {[0, 1, 2, 3].map((bar) => (
            <motion.span
              className="logo-bar"
              key={bar}
              animate={{ scaleY: [0.45, 1, 0.62, 0.9] }}
              transition={{
                duration: 1.4,
                delay: bar * 0.12,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />
          ))}
          <motion.span
            className="logo-node"
            animate={{ x: [0, 34, 68, 102, 0] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </span>

        <motion.span
          className="logo-word"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        >
          ALGOVIS
        </motion.span>
      </motion.div>
    </motion.header>
  )
}

export default Hero
