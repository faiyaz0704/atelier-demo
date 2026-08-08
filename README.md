# Atelier — Static Demo Website

Integrated, cross-linked static demo built from the Atelier theme prototypes for FK Digital client presentation.

## Run locally
Open `index.html` directly in a browser, or serve the folder (`python3 -m http.server`) and visit `localhost:8000`.

## Structure
```
atelier-demo/
├── index.html      (Home)
├── shop.html        (Collections / product grid)
├── product.html      (Product detail — Structured Wool Overcoat)
├── about.html        (Our Story)
├── contact.html       (Contact)
├── assets/images/     (all supplied photography)
└── README.md
```

## Pages
| Page | File | Linked from |
|---|---|---|
| Home | index.html | Every page's logo, nav, footer |
| Shop | shop.html | Nav WOMEN/MEN, footer COLLECTIONS |
| Product | product.html | All product/bestseller/new-arrival cards on Home and Shop |
| About | about.html | Footer ABOUT on every page |
| Contact | contact.html | Footer CONTACT on every page |

## What's genuinely functional
- Full cross-page navigation (desktop + mobile menu) on all 5 pages
- Mobile hamburger menu, hero carousel, shop filter/sort, product image gallery, review carousel, countdown timer — all real client-side JS, no dead code
- Contact form has real validation and a demo success state (no backend — see limitations)
- Every product card, bestseller card, and "new arrivals" card now routes to the one product detail page supplied (`product.html`), since only one product template was provided

## Known limitation — missing product photography
Only **7 images** were supplied: `dress.jpg`, `halfzip.jpg`, `polo.jpg`, `best_dress.jpg`, `hero1.jpg`, `hero2.jpg`, `hero3.jpg`. The prototypes reference **10 additional product images that were never supplied**: `overcoat.jpg`, `overcoat-back.jpg`, `overcoat-detail.jpg`, `overcoat-worn.jpg` (all 4 images for the product detail page itself), `blazer.jpg`, `trouser.jpg`, `best_coat.jpg`, `best_knit.jpg`, `shirt.jpg`, `skirt.jpg`, `tote.jpg`, `jacket.jpg`.

Per the brief, I have **not** faked these with stock photos or placeholders — that would misrepresent the product to a prospective client. Those `<img>` tags are left pointing at their correctly-named paths in `assets/images/`, so real photography can be dropped in later with zero code changes. Right now they'll render as broken image icons. This is the one thing standing between this demo and being fully presentable — flagging it clearly rather than papering over it.

A 4th hero slide (`hero4.jpg`) referenced in the original markup was also never supplied and had no matching indicator dot to begin with (a pre-existing prototype bug — 4 slides, 3 dots). I removed that slide rather than fake a 4th hero image; the carousel now correctly cycles 3 slides / 3 dots.

## Deployment readiness
Ready to upload to Cloudflare Pages / Netlify / GitHub Pages as-is (pure static HTML, no build step, no PHP/DB dependency). The only pre-launch blocker is the missing product photography above.
