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

Contact phone numbers and bank accounts are loaded from R2 instead of being committed to this repository.

1. Edit `/Users/minseok/Desktop/workspace/private-info.json`.
2. Upload it to R2 at `private-info.json`.
3. The site reads it from `https://assets.minju-minseok-wedding.life/private-info.json`.

R2 CORS must allow the site origin, for example `https://minju-minseok-wedding.life`. Add `http://localhost:4173` and `http://localhost:4174` if you want to test the JSON fetch locally.

For local testing, `scripts/local-overrides.js` is ignored by Git and can point localhost at a local-only R2 host:

```js
export default {
  r2Host: "<local-r2-host>",
};
```

Expected JSON shape:

```json
{
  "people": {
    "groom": {
      "phone": "010-0000-0000",
      "account": {
        "bank": "국민",
        "bankDisplay": "국민은행",
        "number": "123456-78-901234"
      }
    }
  }
}
```

`bank` is used for the Toss deep link, `bankDisplay` is shown on the page, and the account number can include hyphens. The Toss link is generated as `supertoss://send?bank=...&accountNo=...` with non-digits removed from the account number.

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
