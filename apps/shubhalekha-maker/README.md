# శుభలేఖ తయారీ సేవ · Shubhalekha Maker

People who don't code fill in a form on their phone at
https://sandeep-miriyala.github.io/yuktai/shubhalekha/make/. This service builds their invitation
with `@yuktishaalaa/shubhalekha` and publishes it as its own Netlify site, for example
`priya-arjun-k7q.netlify.app`.

## Rules

| Rule | Value |
|---|---|
| Invitations a month | 4 (`SLOTS_PER_MONTH`) |
| Edits per invitation | 2, with the private edit link from the email |
| Photos | 5 at most, resized in the phone before upload |
| Events | 1 to 5, within the next 120 days |
| Deleted | 7 days after the last event: the site, the photos and the email address |
| Emails | ready (with the edit link), a reminder 2 days before deletion, deleted |
| Kept by the service | site id and name, delete date, email, a hash of the edit code. The invitation text and photos live only on the invitation site |
| Refused | links in the text, maps that are not Google Maps, bots (hidden field), no consent, a second invitation for the same email |

## Files

```
apps/shubhalekha-maker/
├── netlify.toml              build settings, deploys only when this folder or the package changes
├── public/index.html         a small page that points to the form
├── netlify/functions/
│   ├── slots.mjs             GET  /api/slots   how many are left this month
│   ├── create.mjs            POST /api/create  build and publish a new invitation
│   ├── update.mjs            POST /api/update  edit with the private code (2 times)
│   └── cleanup.mjs           every day 02:00 IST: reminders, then deletes
├── lib/
│   ├── core.mjs              the rules (no Netlify, no email: easy to test)
│   ├── handlers.mjs          the four jobs above
│   ├── netlify.mjs           Netlify API: create site, file-digest deploy, delete
│   ├── mail.mjs              the three emails, sent with Gmail
│   └── deps.mjs              wires Netlify Blobs, the API, Gmail and the package
└── tests/maker.test.mjs      every rule, with a fake Netlify, store and email
```

## Set up (once)

1. **Use a separate Netlify account** for invitations, not the one with your other sites. On the free plan, when the monthly credits run out, every site on that account pauses.
2. Publish the package first (`@yuktishaalaa/shubhalekha` 1.1.0 or newer). This service installs it from npm.
3. On Netlify: **Add new project → Import from GitHub → sandeep-miriyala/yuktai**.
   - Base directory: `apps/shubhalekha-maker`
   - Project name: `shubhalekha-maker` (if it is taken, pick another name and set `NEXT_PUBLIC_SHUBHALEKHA_API` for the site build, see below)
4. **Environment variables** (Netlify → Project configuration → Environment variables). Type them in yourself; never paste them in chats, issues or code:

   | Name | What |
   |---|---|
   | `NETLIFY_AUTH_TOKEN` | A personal access token of the invitations account (User settings → Applications → New access token) |
   | `GMAIL_USER` | The Gmail address the emails come from |
   | `GMAIL_APP_PASSWORD` | A Google app password for that address (Google Account → Security → 2-Step Verification → App passwords) |
   | `ALLOWED_ORIGINS` | Optional. Default `https://sandeep-miriyala.github.io` |
   | `SLOTS_PER_MONTH` | Optional. Default `4` |

5. Deploy. Check `https://shubhalekha-maker.netlify.app/api/slots`: it should answer `{"total":4,"left":4,...}`.

If the project name is not `shubhalekha-maker`, add a repository variable in GitHub
(Settings → Secrets and variables → Actions → Variables) named `NEXT_PUBLIC_SHUBHALEKHA_API`
with the value `https://<your-name>.netlify.app/api`, and pass it to the site build.

## Cost on the free plan

Each new invitation is one production deploy (15 credits) plus its traffic (20 credits a GB).
With 300 credits a month, four invitations with photos and two edits each fit with room to
spare. Deploys of this service itself are skipped unless this folder or the package changed.

## Test

```bash
(cd ../../packages/shubhalekha && npm pack)
npm install --no-save ../../packages/shubhalekha/yuktishaalaa-shubhalekha-*.tgz
npm test
```

GPL-3.0-only · Sandeep Miriyala — Yuktishaalaa AI Lab
