Don't put your resume PDF in this folder.

This folder's own name ("downloads") is exactly the kind of guessable path a
scanner or bot tries first, and it's also listed in robots.txt's Disallow
rules -- which anyone can read, so that listing actively advertises this
folder's existence rather than hiding it. A resume dropped here is easier to
find "cold" (without ever visiting the page) than one isn't.

Instead: put the PDF anywhere under assets/ using a random, non-guessable
folder and filename -- see the "Resume PDF missing" row in
docs/ReleaseQA.md for the exact convention and generation commands.

The template links to it from two places (the hero "Download Resume" button
and the contact section). Both read the path from assets/js/config.js ->
contact.resume, and the static href on each <a download> in index.html /
engineering.html should match it too, so a visitor without JavaScript (or a
search-engine crawler) sees the same real path -- so you only need to pick
the path once, then update it in three places: config.js, and the two
matching hrefs in index.html and engineering.html.

(This folder is also referenced by the Studio customizer's demo/sample
profiles as a generic placeholder path -- that's unrelated to the live
site's actual resume link and does not need to change.)
