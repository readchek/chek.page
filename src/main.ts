const header = document.querySelector<HTMLElement>("#site-header")!
const hero = document.querySelector<HTMLElement>(".hero")!
const video = document.querySelector<HTMLVideoElement>("#film")!
const playButton = document.querySelector<HTMLButtonElement>("#film-play")!
const soundButton = document.querySelector<HTMLButtonElement>("#film-sound")!
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)")

// The header sits on the blue hero until the hero scrolls away.
new IntersectionObserver(([entry]) => header.classList.toggle("is-solid", !entry!.isIntersecting), {
  rootMargin: "-76px 0px 0px 0px",
}).observe(hero)

const reveals = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add("is-visible")
      reveals.unobserve(entry.target)
    }
  },
  { rootMargin: "0px 0px -8% 0px" },
)
for (const element of document.querySelectorAll(".reveal")) reveals.observe(element)

// The tall cut plays on phones held upright; its poster should match.
if (matchMedia("(max-width: 640px) and (orientation: portrait)").matches) {
  video.poster = video.dataset.posterTall!
}

function setLabel(button: HTMLButtonElement, pressed: boolean, label: string) {
  button.setAttribute("aria-pressed", String(pressed))
  button.querySelector(".film-label")!.textContent = label
}
video.addEventListener("play", () => setLabel(playButton, true, "Pause"))
video.addEventListener("pause", () => setLabel(playButton, false, "Play"))
video.addEventListener("volumechange", () =>
  setLabel(soundButton, !video.muted, video.muted ? "Sound on" : "Sound off"),
)
soundButton.addEventListener("click", () => {
  video.muted = !video.muted
  if (video.paused) {
    pausedByViewer = false
    void video.play()
  }
})

// Play the film muted while it's on screen, unless someone paused it or
// prefers less motion. Nothing downloads until it first comes into view.
let pausedByViewer = false
playButton.addEventListener("click", () => {
  pausedByViewer = !video.paused
  if (pausedByViewer) video.pause()
  else void video.play()
})
const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  ?.saveData
new IntersectionObserver(
  ([entry]) => {
    if (!entry!.isIntersecting) return video.pause()
    if (!reducedMotion.matches && !saveData && !pausedByViewer) void video.play().catch(() => {})
  },
  { threshold: 0.5 },
).observe(video)
