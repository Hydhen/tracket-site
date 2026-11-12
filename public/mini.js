// The "Always in sight" scene: a timer starts and its notch slides in, the window shrinks to a pill above another app, then comes back.
// Skipped with reduced motion (and when GSAP didn't start): the section is then the still frame in the HTML.
;(() => {
  const { gsap } = window
  const root = document.querySelector('.mini')
  if (!root || !gsap || !window.__motion) return

  const $ = (selector) => root.querySelector(selector)
  const $$ = (selector) => [...root.querySelectorAll(selector)]

  const desk = $('.mini__desk')
  const app = $('.mini__app')
  const inside = [$('.mini__bar'), $('.mini__body')]
  const notch = $('.mini__notch')
  const pill = $('.mini__pill')
  const cursor = $('.mini__cursor')
  const caption = $('.mini__caption')
  const clocks = $$('[data-mclock]')
  const code = $$('.mini__code .cl')
  // The lines that are already written when the scene starts; the others are typed while the window is a pill
  const written = code.slice(0, 5)
  const typed = code.slice(5)

  const FIRST_CAPTION = 'A timer starts: the notch slides in.'
  const pad = (n) => String(n).padStart(2, '0')
  const showClock = (s) => {
    const text = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`
    for (const el of clocks) el.textContent = text
  }

  // Where an element is, in the desk's own coordinates (the cursor lives there)
  const pos = (el, fx = 0.5, fy = 0.5) => {
    const d = desk.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    return { x: r.left - d.left + r.width * fx, y: r.top - d.top + r.height * fy }
  }
  const spot = (fx, fy) => ({ x: desk.clientWidth * fx, y: desk.clientHeight * fy })

  // Everything back to the start of the scene
  const reset = () => {
    gsap.set(app, { clearProps: 'left,top,width,height,backgroundColor,borderColor,borderRadius' })
    gsap.set(inside, { opacity: 1 })
    gsap.set(pill, { autoAlpha: 0 })
    notch.classList.remove('is-hover')
    pill.classList.remove('is-hover')
    gsap.set(notch, { yPercent: -260, opacity: 0 })
    gsap.set(written, { scaleX: 1, transformOrigin: '0 50%' })
    gsap.set(typed, { scaleX: 0, transformOrigin: '0 50%' })
    gsap.set(cursor, { opacity: 0, scale: 1, transformOrigin: '0 0' })
    caption.textContent = FIRST_CAPTION
    showClock(0)
  }

  let current = null
  let onScreen = true

  const play = () => {
    const tl = gsap.timeline({
      paused: !onScreen,
      onComplete: () => {
        reset()
        current = play()
      },
    })

    // The window as it is, and as the small pill it becomes (measured now: the scene scales with the page)
    const style = getComputedStyle(app)
    const normal = {
      left: app.offsetLeft,
      top: app.offsetTop,
      width: app.offsetWidth,
      height: app.offsetHeight,
      backgroundColor: style.backgroundColor,
      borderColor: style.borderTopColor,
      borderRadius: style.borderTopLeftRadius,
    }
    const w = Math.max(desk.clientWidth * 0.21, 118)
    const h = Math.max(w * 0.24, 28)
    const small = {
      left: (desk.clientWidth - w) / 2,
      top: Math.max(6, desk.clientWidth * 0.012),
      width: w,
      height: h,
      backgroundColor: '#050505',
      borderColor: 'rgba(255,255,255,0.1)',
      borderRadius: h / 2,
    }
    gsap.set(pill, { fontSize: h * 0.46 })

    const say = (t, text) => tl.add(() => (caption.textContent = text), t)
    const go = (point, t, d = 0.8) =>
      tl.to(cursor, { x: () => point().x, y: () => point().y, duration: d, ease: 'power2.inOut' }, t)
    const click = (t) => tl.to(cursor, { scale: 0.8, duration: 0.07, yoyo: true, repeat: 1 }, t)
    const hover = (t, el) => tl.add(() => el.classList.add('is-hover'), t)
    const time = { s: 12 * 60 + 40 }

    tl
      // A timer starts: the notch slides in, and time passes much faster than it does for you
      .to(notch, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 0.5)
      .to(time, { s: 47 * 60 + 12, duration: 13, ease: 'none', onUpdate: () => showClock(Math.round(time.s)) }, 0.5)
      .set(cursor, { x: () => spot(0.9, 0.62).x, y: () => spot(0.9, 0.62).y }, 0)

      // The cursor comes to the notch, and its button appears
      .to(cursor, { opacity: 1, duration: 0.3 }, 2.0)
    say(2.2, 'Point at it: a button appears.')
    go(() => pos(notch, 0.55, 0.55), 2.2, 1.0)
    hover(3.3, notch)
    go(() => pos(notch.querySelector('.mini__btn')), 3.5, 0.45)

    // One click: the window shrinks to a pill, at the top of the screen
    click(4.1)
    say(4.1, 'One click: the window becomes a pill.')
    tl.to(inside, { opacity: 0, duration: 0.25 }, 4.2)
      .to(app, { ...small, duration: 0.9, ease: 'power3.inOut' }, 4.2)
      .to(pill, { autoAlpha: 1, duration: 0.3 }, 4.8)
      .add(() => notch.classList.remove('is-hover'), 4.3)
      .to(notch, { opacity: 0, duration: 0.2 }, 4.2)
    go(() => spot(0.7, 0.55), 5.2, 1.0)

    // It stays on top while the person works in another app
    say(5.6, 'It stays on top of your other windows.')
    tl.to(typed, { scaleX: 1, duration: 0.5, stagger: 0.55, ease: 'power1.out' }, 5.9)

    // The cursor goes back to the pill, and brings the window back
    go(() => pos(pill, 0.4, 0.5), 10.4, 1.0)
    hover(11.5, pill)
    go(() => pos(pill.querySelector('.mini__btn')), 11.7, 0.45)
    click(12.3)
    say(12.3, 'Click it to bring Tracket back, where it was.')
    tl.to(app, { ...normal, duration: 0.9, ease: 'power3.inOut' }, 12.4)
      .to(pill, { autoAlpha: 0, duration: 0.25 }, 12.4)
      .to(inside, { opacity: 1, duration: 0.3 }, 13.0)
      .add(() => pill.classList.remove('is-hover'), 12.5)
      .to(notch, { opacity: 1, duration: 0.2 }, 13.0)
      .to(cursor, { opacity: 0, duration: 0.3 }, 13.5)

    // The timer stops, and the notch goes away
    say(14.2, 'Stop the timer and the notch goes away.')
    tl.to(notch, { yPercent: -260, opacity: 0, duration: 0.5, ease: 'power2.in' }, 14.4).to({}, { duration: 1.6 })

    return tl
  }

  // The scene only plays while it can be seen
  new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting
      current?.paused(!onScreen)
    },
    { threshold: 0.3 },
  ).observe(root)

  reset()
  current = play()
})()
