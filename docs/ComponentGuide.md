# Component Guide

This template now ships with a reusable component registry in `assets/js/components.js`.

## Registered components

- `hero` (`#top`)
- `kpi-cards` (`.exec-scorecard` + `#impact`)
- `timeline` (`#leadership`)
- `experience` (`#experience`)
- `success-stories` (`#success-stories`)
- `testimonials` (`#testimonials`)
- `recognition` (`#recognition`)
- `contact` (`#contact`)
- `footer` (`footer`)

## Runtime API

```js
PortfolioComponents.list();                 // array of component names
PortfolioComponents.get('hero');            // component instance
PortfolioComponents.render('hero', {...});  // update one component
PortfolioComponents.renderMany({
  hero: { valueStatement: '...' },
  contact: { title: '...' }
});
```

## Homepage presets

`assets/js/customizer.js` uses the same component API to apply three homepage presets:

- CEO
- CTO
- CIO
- Program Director
- Delivery Manager
- Engineering Manager
- Product Leader
- Consultant

Presets update hero messaging only; all portfolio sections and features stay intact.

## Backward compatibility

- Existing static HTML remains the source of truth.
- If a component payload is not provided, the authored markup is unchanged.
- Existing modules (`theme.js`, `palette.js`, `main.js`) continue to work.

## Visual catalog

Open [component-catalog.html](</D:/My Portfolio Website/component-catalog.html>) to review reusable UI blocks and examples.
