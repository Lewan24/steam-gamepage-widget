---
name: Steam Game Widget
description: A quiet editor that puts Steam artwork and the finished game card first.
colors:
  primary: '#245ce8'
  primary-hover: '#194bc9'
  canvas: '#f7f8fa'
  surface: '#ffffff'
  ink: '#202934'
  muted: '#687281'
  line: '#e5e8ed'
  preview-stage: '#eef1f5'
  preview-dark: '#252c37'
  midnight: '#15191f'
  midnight-ink: '#f5f7fa'
  midnight-muted: '#a8b2c1'
  midnight-line: '#303641'
  wishlist-lime: '#a3e635'
typography:
  display:
    fontFamily: 'Manrope, sans-serif'
    fontSize: '37px'
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: '-1.25px'
  title:
    fontFamily: 'Manrope, sans-serif'
    fontSize: '26px'
    fontWeight: 750
    lineHeight: 1.25
    letterSpacing: '-0.6px'
  body:
    fontFamily: 'Manrope, sans-serif'
    fontSize: '14px'
    fontWeight: 500
    lineHeight: 1.6
  label:
    fontFamily: 'Manrope, sans-serif'
    fontSize: '12px'
    fontWeight: 750
  code:
    fontFamily: 'Consolas, monospace'
    fontSize: '10px'
    lineHeight: 1.9
rounded:
  chip: '4px'
  button: '6px'
  input: '7px'
  panel: '12px'
  widget-default: '16px'
spacing:
  tight: '8px'
  control: '12px'
  section: '24px'
  workspace-gap: '26px'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.surface}'
    rounded: '{rounded.button}'
    padding: '10px 15px'
  button-primary-hover:
    backgroundColor: '{colors.primary-hover}'
  button-secondary:
    backgroundColor: '#edf1f7'
    textColor: '#324866'
    rounded: '{rounded.button}'
    padding: '10px 15px'
  input:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.input}'
    padding: '11px 12px'
  panel:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.panel}'
---

# Design System: Steam Game Widget

## Overview

**Creative North Star: "The Quiet Game Workbench"**

The implemented Operate direction is a calm, light tool surrounding expressive Steam artwork. Compact settings and restrained blue controls keep the editor precise; the card is the visual focal point. The editor stays light while the embedded card carries its own theme, accent, layout and corner radius.

This working metaphor and the descriptive color names document the implemented direction; they are not additional user-confirmed brand commitments. Source evidence: `src/styles.css` and `src/config.ts`. Browser screenshot verification was unavailable because the browser host could not be reached.

**Key Characteristics:**

- Light, bordered editor surfaces with compact settings.
- Artwork-led cards with independent theme and accent controls.
- Blue editor actions and a lime CTA on the default Midnight card.
- Explicit focus treatments and restrained motion.

## Colors

Cool pale neutrals create a quiet editor; blue identifies editing actions and the configurable card accent identifies the Steam action. Frontmatter is normative for the extracted reusable colors.

### Primary

- **Workbench Blue:** editor actions, active settings tabs, selected controls and focus outlines.

### Secondary

- **Wishlist Lime:** default card action, review dot and discount badge; independently configurable.

### Neutral

- **Cool Canvas / White Surface:** page background and editor panels.
- **Slate Ink / Muted Slate / Fine Line:** primary text, supporting content and structural dividers.
- **Preview Mist / Preview Charcoal:** selectable surroundings for judging host-page context.
- **Midnight / Midnight Ink / Midnight Muted / Midnight Line:** default card background, text, supporting content and dividers.

Alternative card themes are Porcelain, Ocean, Forest and Plum. Their complete assignments live together in `src/config.ts`. CTA text switches between black and white using relative luminance.

**The Independent Accent Rule.** Changing a card accent must not recolor the editor's blue controls.

## Typography

**Display Font:** Manrope, with sans-serif fallback.
**Body Font:** Manrope, with sans-serif fallback.
**Label/Mono Font:** Manrope for controls; Consolas with monospace fallback for embed code.

**Character:** clear, rounded sans-serif forms support a compact working interface. Strong heading weights and modest negative tracking distinguish hierarchy. Manrope loads remotely through Google Fonts.

### Hierarchy

- **Display:** page heading; scales to (30px) and then (28px) at smaller viewports.
- **Title:** game title; layout and container adaptations reduce it as far as (20px).
- **Body:** global baseline; supporting editor text commonly uses (11–13px), card descriptions (11px) with (1.7) line height.
- **Label:** field legends and control labels; dense metadata and helper text use (9–11px).
- **Code:** embed markup with generous line height for long lines.

Tabular numerals stabilize prices and slider values. Long game titles wrap; descriptions clamp to two lines, expanding to three in narrow cards.

## Layout

The desktop shell has a maximum width of (1280px). A (330px) settings column sits beside a flexible preview/output column with a (26px) gap. Panel padding is usually (23–24px). Spacing is compact rather than a strict scale; recurring gaps include (8px), (12px) and (24px).

At (1050px) and below, the settings column becomes (300px) and the gap (18px). At (780px) and below, settings precede preview in one column. At (430px) and below, page gutters become (14px), the copy button spans its row and instructional steps stack. The wide-screen adjustment begins at (1600px), with an additional gutter adjustment at (1360px).

Card container queries at (400px) and (315px) adapt text and actions independently of editor width. Viewport rules also affect the card, including artwork ratio below (430px). Landscape is default; Poster caps configured width at (380px). Configured width ranges from (280px) to (1000px), defaulting to (640px).

## Elevation & Depth

Editor panels are flat white surfaces distinguished by borders, spacing and the cooler canvas. The preview card alone receives a diffuse lift. Artwork has a lower-edge dark gradient for its overlaid label.

### Shadow Vocabulary

- **Preview lift** (`filter: drop-shadow(0 13px 18px #16253f12)`): the widget wrapper against the preview stage.

## Shapes

Panels have gently rounded, clipped corners. Buttons are tighter than panels; inputs sit between their corner sizes. Theme swatches are rounded squares, accent swatches are circles, and genre tags use small corners. Card radius is independently configurable from (0px) to (24px).

## Components

### Buttons

Compact icon-and-label actions use blue for primary and pale blue-gray for secondary. Primary hover uses the darker blue variant; shared hover also subtly adjusts brightness. Focus uses a (2px) blue outline with (4px) offset. Background, color and border transitions take (160ms). Disabled buttons use (0.5) opacity and a wait cursor.

### Chips

Informational genre tags use the card theme's divider fill and muted text, with (3px 8px) padding. Separate layout and theme selection controls use blue borders, outlines or tinted fills with accessible pressed/selected state.

### Cards / Containers

Settings and preview containers use white fill, a single Fine Line border and panel corners. Fine dividers organize headers and footers. The game card uses its configured theme, clipped artwork and padded content. Landscape artwork starts at a (460/200) aspect ratio, with layout and viewport adaptations.

### Inputs / Fields

White fields use a subtle stroke (`#dce1e8`), input corners, and a minimum height of (43px). Focus uses the shared offset outline. Invalid fields use a red border (`#b63b34`) and accompanying error text. The App ID action sits inside the field's right edge. Checked switches use blue and expose focus on the visible track.

### Navigation

Header navigation uses compact (12px), (700) text: muted by default, ink when active and blue on hover. Secondary links disappear selectively at smaller widths. Settings tabs use a blue underline and stronger text when selected; arrow keys change selection.

### Live Steam Card

Appearance controls update the card immediately. The default Midnight card combines Steam artwork, a strong title, muted metadata and a lime CTA. CTA foreground follows accent luminance; its focus outline uses card foreground. Preview size and surface controls change viewing context. Embed markup preserves configuration in URL parameters.

Artwork hover scales to (1.025) over (400ms) with `cubic-bezier(.22,1,.36,1)`. Loading uses a (1.2s) spinner. Reduced-motion preferences remove transitions, minimize animation duration and disable smooth scrolling.

## Do's and Don'ts

### Do:

- **Do** keep blue editor actions independent of the card's configurable accent.
- **Do** preserve each card theme's foreground, muted text and dividers as a set.
- **Do** retain visible keyboard focus and reduced-motion handling.

### Don't:

- **Don't** spread the preview drop shadow across flat editor panels.
- **Don't** force editor panel corners onto a user-configured card.
- **Don't** hard-code a single CTA foreground for every custom accent.
