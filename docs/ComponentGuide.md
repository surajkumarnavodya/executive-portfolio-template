# Component Guide

This template now ships with a reusable component registry in `assets/js/components.js`.

## Registered components

Each component registers against `[data-component="name"]` — an explicit
opt-in attribute on the element itself, not an id or tag guess. A page only
gets a component's behaviour if its markup carries the matching attribute;
nothing renders into a same-named id/tag by accident.

- `hero` (`[data-component="hero"]`)
- `about` (`[data-component="about"]`)
- `kpi-cards` (`[data-component="kpi-cards"]`)
- `experience` (`[data-component="experience"]`)
- `delivery-framework` (`[data-component="delivery-framework"]`)
- `success-stories` (`[data-component="success-stories"]`)
- `insights` (`[data-component="insights"]`)
- `testimonials` (`[data-component="testimonials"]`)
- `recognition` (`[data-component="recognition"]`)
- `contact` (`[data-component="contact"]`)
- `footer` (`[data-component="footer"]`)

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
