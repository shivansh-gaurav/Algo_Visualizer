// import { useEffect, useRef } from "react"

// export default function Aurora({ colorStops = ["#7c3aed", "#f472b6", "#38bdf8"], amplitude = 1.0, speed = 0.5 }) {
//   const canvasRef = useRef(null)

//   useEffect(() => {
//     const canvas = canvasRef.current
//     const gl = canvas.getContext("webgl")
//     if (!gl) return

//     const resize = () => {
//       canvas.width = canvas.offsetWidth
//       canvas.height = canvas.offsetHeight
//       gl.viewport(0, 0, canvas.width, canvas.height)
//     }
//     resize()
//     window.addEventListener("resize", resize)

//     const vert = `
//       attribute vec2 a_pos;
//       void main() { gl_Position = vec4(a_pos, 0, 1); }
//     `
//     const frag = `
//       precision mediump float;
//       uniform float u_time;
//       uniform vec2 u_res;
//       uniform vec3 u_c0;
//       uniform vec3 u_c1;
//       uniform vec3 u_c2;
//       uniform float u_amp;

//       float wave(vec2 uv, float t, float freq, float phase) {
//         return sin(uv.x * freq + t + phase) * 0.5 + 0.5;
//       }

//       void main() {
//         vec2 uv = gl_FragCoord.xy / u_res;
//         float t = u_time * ${speed.toFixed(2)};

//         float w0 = wave(uv, t, 3.0, 0.0) * u_amp;
//         float w1 = wave(uv, t * 0.8, 4.5, 2.0) * u_amp;
//         float w2 = wave(uv, t * 1.2, 2.0, 4.5) * u_amp;

//         float y = uv.y;
//         float band0 = smoothstep(w0 * 0.4, w0 * 0.4 + 0.3, y) * (1.0 - smoothstep(w0 * 0.4 + 0.3, w0 * 0.4 + 0.6, y));
//         float band1 = smoothstep(w1 * 0.3 + 0.2, w1 * 0.3 + 0.5, y) * (1.0 - smoothstep(w1 * 0.3 + 0.5, w1 * 0.3 + 0.8, y));
//         float band2 = smoothstep(w2 * 0.2 + 0.1, w2 * 0.2 + 0.4, y) * (1.0 - smoothstep(w2 * 0.2 + 0.4, w2 * 0.2 + 0.7, y));

//         vec3 col = u_c0 * band0 * 0.8 + u_c1 * band1 * 0.6 + u_c2 * band2 * 0.5;
//         col *= 0.6;
//         gl_FragColor = vec4(col, 1.0);
//       }
//     `

//     const compile = (type, src) => {
//       const s = gl.createShader(type)
//       gl.shaderSource(s, src)
//       gl.compileShader(s)
//       return s
//     }

//     const prog = gl.createProgram()
//     gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert))
//     gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag))
//     gl.linkProgram(prog)
//     gl.useProgram(prog)

//     const buf = gl.createBuffer()
//     gl.bindBuffer(gl.ARRAY_BUFFER, buf)
//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)

//     const pos = gl.getAttribLocation(prog, "a_pos")
//     gl.enableVertexAttribArray(pos)
//     gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

//     const hex = (h) => {
//       const r = parseInt(h.slice(1,3),16)/255
//       const g = parseInt(h.slice(3,5),16)/255
//       const b = parseInt(h.slice(5,7),16)/255
//       return [r,g,b]
//     }

//     const uTime = gl.getUniformLocation(prog, "u_time")
//     const uRes  = gl.getUniformLocation(prog, "u_res")
//     const uC0   = gl.getUniformLocation(prog, "u_c0")
//     const uC1   = gl.getUniformLocation(prog, "u_c1")
//     const uC2   = gl.getUniformLocation(prog, "u_c2")
//     const uAmp  = gl.getUniformLocation(prog, "u_amp")

//     gl.uniform3fv(uC0, hex(colorStops[0]))
//     gl.uniform3fv(uC1, hex(colorStops[1]))
//     gl.uniform3fv(uC2, hex(colorStops[2]))
//     gl.uniform1f(uAmp, amplitude)

//     let start = null
//     let raf
//     const render = (ts) => {
//       if (!start) start = ts
//       gl.uniform1f(uTime, (ts - start) / 1000)
//       gl.uniform2f(uRes, canvas.width, canvas.height)
//       gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
//       raf = requestAnimationFrame(render)
//     }
//     raf = requestAnimationFrame(render)

//     return () => {
//       cancelAnimationFrame(raf)
//       window.removeEventListener("resize", resize)
//     }
//   }, [])

//   return (
//     <canvas
//       ref={canvasRef}
//       style={{
//         position: "absolute",
//         inset: 0,
//         width: "100%",
//         height: "100%",
//         opacity: 0.45,
//       }}
//     />
//   )
// }

import "./Aurora.css"

export default function Aurora() {
  return (
    <div className="aurora-wrap">
      <div className="aurora-blob a1" />
      <div className="aurora-blob a2" />
      <div className="aurora-blob a3" />
    </div>
  )
}