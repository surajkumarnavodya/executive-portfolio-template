# Best Practices

## Commercial marketplace readiness

- Keep real buyer-facing defaults in `index.html` and expose advanced controls in Studio/customizer.
- Preserve semantic structure (`header`, `main`, `section`, `footer`) for accessibility and SEO.
- Keep visual changes token-driven in [variables.css](</D:/My Portfolio Website/assets/css/variables.css>), not hardcoded per component.

## Theme and presets

- Prefer palette-level changes over direct accent overrides.
- Use presets for messaging variants (CEO/CTO/etc), not for structural divergence.
- Export customizer/layout configuration before client handoff.

## Motion and interaction

- Keep transitions under 400ms.
- Respect reduced motion and offer non-animated alternatives.
- Use hover polish for affordance, not decoration.

## Performance

- Ship minified bundles from `assets/dist/`.
- Prefer AVIF/WebP where available.
- Defer non-critical scripts and preload only critical above-the-fold assets.

## Maintainability

- Edit source files in `assets/css/` and `assets/js/`, then regenerate `assets/dist/`.
- Avoid duplicating markup patterns; reuse component classes and registry hooks.
- Keep docs updated with every feature release and behavior change.
