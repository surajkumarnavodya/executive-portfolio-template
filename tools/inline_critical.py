#!/usr/bin/env python3
"""
home.html head surgery:

  1. Add a preconnect for cdn.jsdelivr.net (Bootstrap CSS, Bootstrap Icons CSS
     and the icon webfont all come from there; the icon font is a third
     connection hop discovered only after its stylesheet parses).

  2. Replace the render-blocking template.min.css <link> with:
        - an inline <style> holding the first-viewport rules
        - a non-blocking preload->stylesheet swap for the full bundle
        - a <noscript> fallback so the page still styles without JS

CRLF line endings are preserved, matching the rest of the file.
"""
import sys

HTML = "../home.html"
CRIT = "./critical.css"

src = open(HTML, "r", newline="").read()
critical = open(CRIT, "r", newline="").read().strip()

# ---------------------------------------------------------------- 1. preconnect
anchor = '<link rel="preconnect" href="https://fonts.googleapis.com">\r\n'
if 'preconnect" href="https://cdn.jsdelivr.net' in src:
    print("preconnect: already present, skipped")
else:
    assert src.count(anchor) == 1, f"preconnect anchor count = {src.count(anchor)}"
    src = src.replace(
        anchor,
        '<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>\r\n' + anchor,
        1,
    )
    print("preconnect: added for cdn.jsdelivr.net")

# ------------------------------------------------- 2. critical inline + defer
old_link = '<link rel="stylesheet" href="assets/dist/css/template.min.css">\r\n'
assert src.count(old_link) == 1, f"bundle link count = {src.count(old_link)}"

new_block = (
    "<!-- Critical first-viewport CSS, inlined so the telemetry bar, navbar and hero\r\n"
    "     can paint without waiting on the full stylesheet. Generated from\r\n"
    "     assets/dist/css/template.min.css - regenerate this block whenever the\r\n"
    "     bundle changes. Must stay AFTER the Bootstrap links so the cascade order\r\n"
    "     matches the non-critical bundle below. -->\r\n"
    '<style id="critical-css">' + critical + "</style>\r\n"
    "\r\n"
    "<!-- Full stylesheet, loaded without blocking first paint. -->\r\n"
    '<link rel="preload" href="assets/dist/css/template.min.css" as="style"\r\n'
    "      onload=\"this.onload=null;this.rel='stylesheet'\">\r\n"
    "<noscript><link rel=\"stylesheet\" href=\"assets/dist/css/template.min.css\"></noscript>\r\n"
)

src = src.replace(old_link, new_block, 1)
print("critical css: inlined (%d bytes) and bundle switched to preload+swap" % len(critical))

open(HTML, "w", newline="").write(src)
print("written:", HTML)
