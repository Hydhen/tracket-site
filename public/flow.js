// The "Move and edit" scene: tickets are picked, dragged onto a status, then dragged onto the edit zone.
// Skipped with reduced motion (and when GSAP didn't start): the section is then the still frame in the HTML.
;(() => {
  const { gsap } = window
  const root = document.querySelector('.flow')
  if (!root || !gsap || !window.__motion) return

  const $ = (selector) => root.querySelector(selector)
  const $$ = (selector) => [...root.querySelectorAll(selector)]

  const win = $('.flow__window')
  const list = $('.flow__list')
  const rows = $$('.frow')
  const overlay = $('.flow__overlay')
  const zone = $('.flow__zone')
  const nodes = { review: $('[data-node="review"]') }
  const dialog = $('.flow__dialog')
  const priority = $('[data-val="priority"]')
  const due = $('[data-val="due"]')
  const apply = $('.dlg__btn--go')
  const toast = $('.flow__toast')
  const toastText = $('.flow__toast-text')
  const undo = $('.flow__undo')
  const cursor = $('.flow__cursor')
  const ghost = $('.flow__ghost')
  const caption = $('.flow__caption')
  const changes = $$('.frow__prio, .frow__due')

  const FIRST_CAPTION = 'Ctrl+click picks tickets.'

  const setStatus = (row, kind, label) => {
    const pill = $$('.pill')[rows.indexOf(row)]
    pill.className = `pill pill--${kind}`
    pill.textContent = label
  }

  // Where an element is, in the window's own coordinates (the cursor lives there)
  const pos = (el, fx = 0.5, fy = 0.5) => {
    const w = win.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    return { x: r.left - w.left + r.width * fx, y: r.top - w.top + r.height * fy }
  }

  // Everything back to the start of the scene
  const reset = () => {
    for (const row of rows) {
      row.classList.remove('is-marked', 'is-dragging', 'is-flash')
      setStatus(row, 'todo', 'To do')
    }
    for (const el of [zone, nodes.review]) el.classList.remove('is-hot')
    priority.textContent = 'Pick a value'
    due.textContent = 'Pick a day'
    priority.classList.remove('is-set')
    due.classList.remove('is-set')
    undo.style.display = ''
    caption.textContent = FIRST_CAPTION
    gsap.set(changes, { opacity: 0 })
    gsap.set([overlay, dialog], { autoAlpha: 0 })
    gsap.set(toast, { autoAlpha: 0, y: 10 })
    gsap.set(ghost, { opacity: 0 })
    gsap.set(cursor, { opacity: 0, scale: 1, transformOrigin: '0 0' })
    gsap.set(list, { opacity: 1 })
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

    const say = (t, text) => tl.add(() => (caption.textContent = text), t)
    const go = (el, t, d = 0.7, fx = 0.5, fy = 0.5) =>
      tl.to(cursor, { x: () => pos(el, fx, fy).x, y: () => pos(el, fx, fy).y, duration: d, ease: 'power2.inOut' }, t)
    const click = (t) => tl.to(cursor, { scale: 0.8, duration: 0.07, yoyo: true, repeat: 1 }, t)
    const classes = (t, els, add, remove = []) =>
      tl.add(() => {
        for (const el of els) {
          el.classList.remove(...remove)
          if (add) el.classList.add(add)
        }
      }, t)
    // Ctrl+click on a row: it moves there, clicks, and the row is picked
    const pick = (row, t) => {
      go(row, t, 0.6, 0.6)
      click(t + 0.7)
      classes(t + 0.72, [row], 'is-marked')
    }
    // Press on a picked ticket, drag everything picked: the overlay covers the detail
    const dragStart = (t, label, group) => {
      tl.add(() => (ghost.textContent = label), t)
      tl.to(ghost, { opacity: 1, duration: 0.15 }, t)
      classes(t, group, 'is-dragging', ['is-marked'])
      tl.to(overlay, { autoAlpha: 1, duration: 0.3 }, t + 0.1)
    }
    const dropEnd = (t, group) => {
      tl.to(ghost, { opacity: 0, duration: 0.15 }, t)
      tl.to(overlay, { autoAlpha: 0, duration: 0.25 }, t)
      classes(t, group, null, ['is-dragging'])
    }
    const showToast = (t, text, withUndo) => {
      tl.add(() => {
        toastText.textContent = text
        undo.style.display = withUndo ? '' : 'none'
      }, t)
      tl.to(toast, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power3.out' }, t)
    }

    const first = rows.slice(0, 3)
    const edited = rows.slice(0, 2)

    // The list arrives, with the cursor next to the first ticket
    tl.fromTo(list, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0)
    tl.set(cursor, { x: () => pos(rows[0], 0.6).x + 40, y: () => pos(rows[0], 0.6).y + 40 }, 0)
    tl.to(cursor, { opacity: 1, duration: 0.3 }, 0.3)
    say(0.3, FIRST_CAPTION)

    // Act 1: three tickets are picked and moved together
    pick(rows[0], 0.6)
    pick(rows[1], 1.8)
    pick(rows[2], 3.0)
    say(4.0, 'Drag them onto a status.')
    dragStart(4.2, '3 tickets', first)
    go(nodes.review, 4.5, 1.1)
    classes(5.5, [nodes.review], 'is-hot')
    dropEnd(6.0, first)
    classes(6.0, [nodes.review], null, ['is-hot'])
    tl.add(() => {
      for (const row of first) {
        setStatus(row, 'doing', 'In review')
        row.classList.add('is-flash')
      }
    }, 6.0)
    showToast(6.0, '3 tickets moved to IN REVIEW', true)
    say(6.0, 'They move together, and Undo is one click away.')
    go(undo, 6.5, 0.6)
    tl.to(toast, { autoAlpha: 0, y: 10, duration: 0.3 }, 8.0)

    // Act 2: two of them are edited together
    say(8.2, 'Or change the same fields on all of them.')
    pick(rows[0], 8.4)
    pick(rows[1], 9.6)
    dragStart(10.8, '2 tickets', edited)
    go(zone, 11.1, 0.9)
    classes(11.9, [zone], 'is-hot')
    dropEnd(12.4, edited)
    classes(12.4, [zone], null, ['is-hot'])
    tl.to(dialog, { autoAlpha: 1, duration: 0.3 }, 12.5)
    tl.fromTo(dialog.children, { y: 14 }, { y: 0, duration: 0.4, ease: 'power3.out', stagger: 0.05 }, 12.5)
    say(12.5, 'Fill in what should change.')

    go(priority, 13.0, 0.7, 0.8)
    click(13.8)
    tl.add(() => {
      priority.textContent = 'High'
      priority.classList.add('is-set')
    }, 13.9)
    go(due, 14.4, 0.5, 0.8)
    click(14.95)
    tl.add(() => {
      due.textContent = 'Nov 20'
      due.classList.add('is-set')
    }, 15.05)
    go(apply, 15.6, 0.6)
    click(16.3)

    tl.to(dialog, { autoAlpha: 0, duration: 0.25 }, 16.45)
    tl.to(changes.filter((_, i) => i < 4), { opacity: 1, duration: 0.4, stagger: 0.05 }, 16.5)
    classes(16.5, edited, 'is-flash')
    showToast(16.5, '2 tickets updated: priority, due date', false)
    say(16.5, 'Changed on both at once.')

    // Then it starts over
    tl.to(toast, { autoAlpha: 0, y: 10, duration: 0.3 }, 18.6)
    tl.to(cursor, { opacity: 0, duration: 0.3 }, 18.6)
    tl.to(list, { opacity: 0, duration: 0.4 }, 19.0)
    tl.to({}, { duration: 0.2 })

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
