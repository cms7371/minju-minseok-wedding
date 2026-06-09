# Mobile Wedding Invitation

Static mobile wedding invitation for GitHub Pages.

## Edit content

Most invitation text lives in `scripts/config.js`.

Replace these placeholders before publishing:

- Bride and groom names
- Wedding date and venue
- Map links
- RSVP endpoint or form handling
- `assets/intro.jpg` with the intro photo

## Private info

Contact phone numbers and bank accounts are loaded at runtime instead of being committed to this repository.

Expected data shape:

```json
{
  "people": {
    "groom": {
      "phone": "...",
      "account": {
        "bank": "...",
        "bankDisplay": "...",
        "number": "..."
      }
    }
  }
}
```

`bank` is used for the Toss deep link, `bankDisplay` is shown on the page, and the account number can include hyphens.

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
