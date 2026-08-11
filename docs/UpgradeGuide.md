# Upgrade Guide

This template keeps backward compatibility for authored HTML while evolving runtime tooling.

## Version compatibility

| Version | Compatible with existing `index.html` content | Notes |
|---|---|---|
| v1.0.x | Yes | Base packaged template |
| v1.1.x | Yes | Palette system + accessibility additions |
| v1.2.x | Yes | Theme customizer, component registry, production bundles |
| v1.3.x | Yes | Expanded presets, visual layout builder, demo imports |

## Safe upgrade workflow

1. Backup your working template folder.
2. Copy new `assets/dist/` and `assets/js/` files.
3. Keep your existing `assets/js/config.js` and merge new keys from the latest default.
4. Open `index.html` and verify script/style tags:
   - `assets/dist/css/template.min.css`
   - `assets/js/config.js`
   - `assets/dist/js/template.min.js`
5. Open `studio.html` and validate demo import / export flow.
6. Run a visual regression check on desktop/tablet/mobile breakpoints.

## Breaking-change policy

- Existing section IDs are preserved.
- Existing config keys remain supported.
- Content authored directly in HTML remains valid.
- New features are additive and opt-in by default.

## Troubleshooting after upgrade

### Customizer state looks stale
- Clear localStorage keys:
  - `pf-theme-customizer-v2`
  - `portfolio-studio-session`

### Layout order does not update
- Ensure section IDs are unchanged (`leadership`, `success-stories`, `ai-leadership`, etc).
- Confirm `main` wrapper still contains the homepage sections.

### Demo packs do not appear in Studio
- Confirm [demo-profiles.json](../assets/demo-data/demo-profiles.json) exists and is valid JSON.
- Open via local server (`http://localhost`) instead of `file://`.
