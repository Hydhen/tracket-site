// The switch above the screenshot: Open, Closed, Tree. Without this script the Open view is simply shown.
;(() => {
  const switcher = document.querySelector('.app__switch')
  if (!switcher) return

  const tabs = [...switcher.querySelectorAll('[role="tab"]')]
  const caption = document.getElementById('app-caption')

  const CAPTIONS = {
    open: "What's assigned to you, grouped by status. Pick one to see it next to the list.",
    closed: 'What you finished, most recent first. Resolved and closed tickets are kept apart from the open ones.',
    tree: 'An epic and everything under it, with its progress. Unfold a story to reach its sub-tasks.',
  }

  const show = (tab, focus = false) => {
    for (const other of tabs) {
      const selected = other === tab
      other.setAttribute('aria-selected', String(selected))
      other.tabIndex = selected ? 0 : -1
      document.getElementById(other.getAttribute('aria-controls')).hidden = !selected
    }
    caption.textContent = CAPTIONS[tab.id.replace('tab-', '')]
    if (focus) tab.focus()
  }

  switcher.addEventListener('click', (event) => {
    const tab = event.target.closest('[role="tab"]')
    if (tab) show(tab)
  })

  // Arrow keys move between the views, as in any tab list
  switcher.addEventListener('keydown', (event) => {
    const at = tabs.indexOf(document.activeElement)
    if (at < 0) return
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
    if (step) show(tabs[(at + step + tabs.length) % tabs.length], true)
    else if (event.key === 'Home') show(tabs[0], true)
    else if (event.key === 'End') show(tabs[tabs.length - 1], true)
    else return
    event.preventDefault()
  })

  switcher.hidden = false
})()
