# CampusConnect — Design System: "Campus Neo-Brutalist"

**Source:** Stitch project `8507093053342368850` (CampusConnect Student Portal UI), asset `assets/3c39fe8b623e4d1e96defe5a2a865417`.
**Raw tokens:** `design/design-system.json`
**Screen references:** `design/screens/*.png` (visual) and `design/screens/*.html` (exported markup).

This is the **only** design system for CampusConnect. Do NOT redesign the visual language. Every agent MUST follow this spec (plan §37 Rule 8, TASK-004).

---

## 1. Brand Personality

Neo-Brutalism for an energetic academic environment. Rejects "soft" SaaS look. Bold, unapologetic, highly structured.

- **Heavy linework:** every container and interactive element has a thick **2px border** using the darkest neutral (`on-background` `#1d1b20`).
- **Physicality:** depth = "hard shadows" (non-diffused offsets). No Gaussian blurs, no light-source gradients.
- **Micro-interactions:** "squish" press effect — element translates down+right, shadow removed.

## 2. Color Tokens

Deep purple seed (`#4f378a`, FIDELITY variant) → rich lavender/indigo range with ochre/gold tertiary.

| Role | Token | Hex |
|---|---|---|
| Background | `background` / `surface` | `#fdf7ff` (pale lavender, NOT pure white) |
| Surface bright (inputs) | `surface_bright` | `#fdf7ff` |
| Surface container lowest (card bodies) | `surface_container_lowest` | `#ffffff` |
| Surface container (chips/nav bg) | `surface_container` | `#f2ecf4` |
| On surface (text) | `on_surface` | `#1d1b20` |
| **Borders + hard shadows (critical)** | `on-background` | `#1d1b20` |
| Secondary text (dates/locations) | `on_surface_variant` | `#494551` |
| Primary (actions) | `primary` | `#381e72` |
| Primary container | `primary_container` | `#6750a4` |
| On primary | `on_primary` | `#ffffff` |
| Secondary | `secondary` | `#63597c` |
| Secondary container (chips) | `secondary_container` | `#e1d4fd` |
| Tertiary (ochre/gold) | `tertiary` | `#765b00` |
| Tertiary container (chips) | `tertiary_container` | `#c9a74d` |
| Error | `error` | `#ba1a1a` |
| Error container | `error_container` | `#ffdad6` |
| Outline | `outline` | `#7a7582` |

Full map incl. fixed variants: `design/design-system.json`.

## 3. Typography

Two-font strategy.

| Style | Font | Size | Weight | Line height | Letter spacing |
|---|---|---|---|---|---|
| Headline XL (page titles) | **Lexend** | 48px | 800 | 1.1 | -0.02em |
| Headline LG | Lexend | 32px | 700 | 1.2 | -0.01em |
| Headline LG mobile | Lexend | 28px | 700 | 1.2 | — |
| Headline MD | Lexend | 24px | 700 | 1.3 | — |
| Body LG | Plus Jakarta Sans | 18px | 500 | 1.6 | — |
| Body MD | Plus Jakarta Sans | 16px | 400 | 1.5 | — |
| Label bold | Plus Jakarta Sans | 14px | 700 | 1.2 | — |
| Label xs caps | Plus Jakarta Sans | 12px | 700 | 1.2 | 0.05em |

**Rules:**
- Headline XL → `uppercase` (brutalist poster style).
- Use `on_surface_variant` for secondary info (locations, dates).

## 4. Spacing & Layout

- **Rule of 8:** all padding and small gaps are multiples of 8px.
- **Grid:** 12-column implied on desktop, 24px gutter (so hard shadows don't overlap).
- **Margins:** 40px horizontal desktop (editorial), 16px mobile.
- **Vertical rhythm:** section gaps 48–64px.
- **Container max width:** 1280px, centered.

| Token | Value |
|---|---|
| `base` | 8px |
| `gutter` | 24px |
| `margin-mobile` | 16px |
| `margin-desktop` | 40px |
| `container-max` | 1280px |

## 5. Elevation (Hard Shadows)

No ambient lighting. Depth = structural offsets using `#1d1b20`.

- **Level 0 (Flat):** backgrounds, passive containers. No shadow.
- **Level 1 (Interaction):** buttons → `4px 4px 0px 0px #1d1b20`.
- **Level 2 (Cards):** primary containers → `8px 8px 0px 0px #1d1b20`.
- **Hover:** shadow grows to 12px, element translates `-2px` both axes.
- **Active/Pressed:** shadow → 0px, element translates `+4px` (squish).

## 6. Shapes

Mix of hard corners (cards) + hyper-rounded (buttons/chips).

- **Cards/containers:** `rounded-xl` (1.5rem / 24px).
- **Buttons & chips:** `full` pill radius.
- **Inputs:** `rounded-lg` (1rem / 16px).
- **All borders:** consistent **2px** width.

## 7. Components

### Buttons
- **Primary:** fill `primary`, text `on_primary`, 2px border, `4px 4px 0 0 #1d1b20` shadow. **Uppercase label**.
- **Ghost/inactive:** fill `surface`, text `on_surface`, 2px border. Shadow only on hover.

### Cards
- Body: `surface_container_lowest`.
- Card images: `border-b-2` separator.
- Hover: 10% opacity color wash in the category's container color.

### Inputs
- Background `surface_bright`.
- Focus: border thickens/becomes `primary`, input elevates with 6px hard shadow.

### Chips/Tags
- Pill, `label-bold` text, 2px solid `on-background` border.
- Fill: `tertiary_container` or `secondary_container`.

### Navigation (Top App Bar)
- Fixed `80px` height, `border-b-2`, 4px hard shadow.

## 8. Screens (Reference)

`design/screens/` — desktop + mobile UI screenshots and exported HTML for: Home, Event Detail (Hackathon 2026), Resources Management, Resource Booking (Projector), My Bookings, Login & Sign Up, Events Management, Admin Dashboard, Booking Requests Management, CampusConnect - Interactive Waves, Untitled Prototype (mobile).

Use these as the visual target. Screenshots show the intended look; exported HTML shows structure. Where a screen contradicts this spec, follow the spec (this file) and note the discrepancy in the task PR.
