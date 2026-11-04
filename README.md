# Tracket website

The website for [Tracket](https://github.com/Hydhen/tracket), a lightweight Jira Cloud client for Windows:
**https://hydhen.github.io/tracket-site/**

It is a single static page in [`public/`](public): HTML, CSS and a little JavaScript. There is no build step, and it
makes no request to any other site: its fonts and its animation library are served from the page itself.

## Why a separate repository

The page's animation uses [GSAP](https://gsap.com), whose license is free to use but isn't an open-source license. The
Tracket application is fully open source, so the page lives here, and the application's repository contains no GSAP.

## Working on it

Open `public/index.html` in a browser. Pushing to `main` publishes the `public/` folder with the **Pages** workflow.

The page respects the reduced-motion setting: without motion, it is a static page.

## License

The page's own code is under the [MIT license](LICENSE). Third-party files keep their own licenses, listed in
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md): GSAP (in `public/vendor/`) and two fonts (in `public/fonts/`).
