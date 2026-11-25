// The stack of themes: pick one with the buttons, or by clicking a card behind, and it comes to the front. Without this
// script the three are simply stacked, with the first in front, and the buttons stay hidden.
;(() => {
  const switcher = document.querySelector('.themes__switch')
  if (!switcher) return

  const cards = [...document.querySelectorAll('.themes__card')]
  const buttons = [...switcher.querySelectorAll('button')]
  const notes = [...document.querySelectorAll('.themes__list li')]

  // The themes, the one in front first; the others keep their order behind it
  let order = cards.map((card) => card.dataset.theme)

  const render = () => {
    for (const card of cards) card.dataset.pos = String(order.indexOf(card.dataset.theme))
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.theme === order[0]))
    for (const note of notes) note.classList.toggle('is-front', note.dataset.theme === order[0])
  }

  const bring = (theme) => {
    order = [theme, ...order.filter((other) => other !== theme)]
    render()
  }

  switcher.addEventListener('click', (event) => {
    const button = event.target.closest('button')
    if (button) bring(button.dataset.theme)
  })
  for (const card of cards) card.addEventListener('click', () => bring(card.dataset.theme))

  document.documentElement.classList.add('js-themes')
  switcher.hidden = false
})()
