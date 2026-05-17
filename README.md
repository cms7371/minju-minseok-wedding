# Mobile Wedding Invitation

Static mobile wedding invitation for GitHub Pages.

## Edit content

Most invitation text lives in `scripts/config.js`.

Replace these placeholders before publishing:

- Bride and groom names
- Wedding date and venue
- Map links
- Contact phone numbers
- Bank account fields
- RSVP endpoint or form handling
- `assets/cover.png` with a real couple photo if available

## Preview locally

```sh
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## GitHub Pages

Use one of these options:

- Repository named `<username>.github.io`: publish from `main`.
- Project page repository: publish from `main` branch root.

For a custom domain, copy `CNAME.example` to `CNAME` and replace the value with the purchased domain.

