# Thunder Creatives — website

Single-page, black-theme motion site built with **three.js** (WebGL kinetic-type hero + particle field),
**GSAP + ScrollTrigger** (all scroll animation) and **Lenis** (smooth scroll). No build step.

## Run it
ES modules + textures need a web server (opening `index.html` directly from disk won't work):

```bash
python serve.py          # → http://localhost:5500
# or: npx serve .   /   VS Code "Live Server"
```

## Sections
| Section | What moves |
|---|---|
| Loader | Bolt stroke draws, counter, curtain wipe |
| Hero | three.js: giant warped type (“WE CAUSE / CREATIVE / STORMS”), tilted project panels, brand bolt — waves, mouse bulge, RGB split on scroll, flies apart as you scroll |
| Studio (About) | Line reveals, words light up on scroll, scroll-reactive marquee, pinned horizontal studio reel |
| Services | 8 cards — icons draw in, 3D tilt, red flood from cursor on hover |
| Work | Pinned **circular wheel**: scroll rotates projects, centre item drives the info block and right-side image panel; click to open a project drawer |
| Clients | Logo + name rails |
| Contact | Magnetic “Let’s talk” → slide-in form drawer |
| Footer | Outline wordmark, socials, back to top |

## Editing content
* **Projects / services / wheel categories:** `js/data.js`
* **Images:** `assets/img/` (optimised copies of the originals in the parent folder)
* **Hero words / images:** `LINES` and `loadAsync(...)` in `js/hero.js`

## Before going live — replace placeholders
* Email / phone / location in the Contact section (`index.html`) and `CONTACT_EMAIL` in `js/main.js`
* Social links in the footer (`href="#"`)
* The contact form opens the visitor's mail app (`mailto:`). Hook it to a form backend
  (Formspree, Netlify Forms, your own API…) in `initDrawers()` → `form` submit handler for real submissions.
