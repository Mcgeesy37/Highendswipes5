/* ================================
   CoreSetup Studio – main.js
   ================================= */

// Jahr im Footer automatisch setzen
const year = document.getElementById("year");
if (year) {
  year.textContent = new Date().getFullYear();
}


/* ================================
   Mobile Navigation
   ================================= */

const menuBtn = document.getElementById("menuBtn");
const mobileNav = document.getElementById("mobileNav");

if (menuBtn && mobileNav) {

  menuBtn.addEventListener("click", () => {

    const isOpen = mobileNav.classList.toggle("is-open");

    menuBtn.setAttribute(
      "aria-expanded",
      isOpen ? "true" : "false"
    );

  });

  mobileNav.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {
      mobileNav.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
    });

  });

}


/* ================================
   Reveal Animation on Scroll
   ================================= */

const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver((entries) => {

  entries.forEach(entry => {

    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
    }

  });

}, {
  threshold: 0.15
});

revealElements.forEach(el => observer.observe(el));


/* ================================
   Cursor Spotlight Effekt
   ================================= */

const spotlight = document.querySelector(".spotlight");

let mouseX = window.innerWidth * 0.5;
let mouseY = window.innerHeight * 0.3;

let targetX = mouseX;
let targetY = mouseY;

function animateSpotlight() {

  mouseX += (targetX - mouseX) * 0.08;
  mouseY += (targetY - mouseY) * 0.08;

  if (spotlight) {

    spotlight.style.left = mouseX + "px";
    spotlight.style.top = mouseY + "px";

  }

  requestAnimationFrame(animateSpotlight);

}

animateSpotlight();

window.addEventListener("pointermove", (e) => {

  targetX = e.clientX;
  targetY = e.clientY;

});


/* ================================
   WebGL Background
   ================================= */

const canvas = document.getElementById("bg-webgl");

if (canvas) {

  const gl = canvas.getContext("webgl");

  if (!gl) {
    console.log("WebGL nicht verfügbar");
  }

  const vertexShaderSource = `
  attribute vec2 position;
  varying vec2 vUv;

  void main() {
      vUv = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0.0, 1.0);
  }
  `;

  const fragmentShaderSource = `
  precision highp float;

  varying vec2 vUv;

  uniform float time;
  uniform vec2 resolution;

  float random(vec2 st){
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  float noise(vec2 st){
      vec2 i = floor(st);
      vec2 f = fract(st);

      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));

      vec2 u = f*f*(3.0-2.0*f);

      return mix(a, b, u.x)
           + (c - a)* u.y * (1.0 - u.x)
           + (d - b)* u.x * u.y;
  }

  void main() {

      vec2 uv = vUv;
      vec2 p = (uv - 0.5) * vec2(resolution.x/resolution.y,1.0);

      float t = time * 0.05;

      float n = noise(p*2.0 + t);

      vec3 base = vec3(0.03,0.03,0.035);

      vec3 gold = vec3(0.71,0.61,0.36);

      float glow = smoothstep(0.4,0.9,n);

      vec3 color = base + gold * glow * 0.08;

      gl_FragColor = vec4(color,1.0);
  }
  `;


  function compileShader(type, source) {

    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;

    }

    return shader;

  }


  const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  gl.useProgram(program);


  const vertices = new Float32Array([
    -1,-1,
     1,-1,
    -1, 1,

    -1, 1,
     1,-1,
     1, 1
  ]);


  const buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);


  const position = gl.getAttribLocation(program, "position");

  gl.enableVertexAttribArray(position);

  gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);


  const timeLocation = gl.getUniformLocation(program,"time");
  const resolutionLocation = gl.getUniformLocation(program,"resolution");


  function resizeCanvas() {

    const dpr = Math.min(window.devicePixelRatio,2);

    const width = window.innerWidth * dpr;
    const height = window.innerHeight * dpr;

    canvas.width = width;
    canvas.height = height;

    gl.viewport(0,0,width,height);

    gl.uniform2f(resolutionLocation,width,height);

  }

  window.addEventListener("resize", resizeCanvas);

  resizeCanvas();


  let start = performance.now();

  function render(now) {

    const time = (now - start) * 0.001;

    gl.uniform1f(timeLocation,time);

    gl.drawArrays(gl.TRIANGLES,0,6);

    requestAnimationFrame(render);

  }

  requestAnimationFrame(render);

}
