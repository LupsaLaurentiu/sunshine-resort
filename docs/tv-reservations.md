# Reservation-driven TV integration

## Bundled Montserrat typography (0.3.5)

The entire TV interface now uses Montserrat Variable, including headings, sidebar,
buttons, information, Wi-Fi details and the exit dialog. Both normal and genuine
italic faces are bundled through `@fontsource-variable/montserrat` 5.3.0, with
Romanian diacritics and the font's other supplied character sets. Vite emits local
WOFF2 assets, so the TV does not contact a font CDN. The package's original font
license is copied into the IPK as `Montserrat-OFL.txt`. The existing logo image is
reused as before.

Validation: TypeScript/Vite/IPK build and browser checks confirmed actual custom-font
rendering, local font requests, Romanian diacritics, normal/italic faces, all UI
font families, long Wi-Fi values, pagination, RO/EN and 1080p/720p bounds. Version
0.3.5 was installed on the personal LG; inspector checks confirmed actual Montserrat
rendering, loaded normal/italic diacritics, local font files, preserved pairing and
no document overflow.

## Horizontal action arrows (0.3.4)

Welcome and Recommendations now use horizontal right-pointing arrows. Back and
previous-page arrows remain horizontal left-pointing arrows. The diagonal icon
variant and its upward focus animation were removed; focus movement is horizontal.
The TypeScript/Vite/IPK build passed and 0.3.4 was installed on the personal LG.

## Refined action icons and exit dialog (0.3.3)

Button arrows now use shared local SVG icons with consistent thin rounded strokes,
including the welcome action, recommendations/back action and text pagination.
The header TV-exit action uses a television icon and a subtle underline. No slider
controls were reintroduced.

The exit dialog reuses the canonical logo and now has a softly blurred/dimmed
backdrop, a warm gradient surface, rounded corners and gentle entrance motion.
Its two actions have distinct treatments and a soft focus glow. Stay remains the
default; arrows navigate between actions, OK confirms and Back dismisses. The
dialog provides a description for assistive technology and small remote-key hints.
Reduced motion disables the new transitions/animations.

Validation: TypeScript/Vite/IPK build and browser checks passed for icon rendering,
dialog branding and layout, default focus, remote arrows/OK/Back, focus isolation,
cancel behaviour and one simulated platform exit call, gallery suspension, labelled
pagination, RO/EN, 1080p/720p bounds and reduced motion. The personal LG was updated
to 0.3.3 with the existing app ID and pairing.
LG inspector checks confirmed the SVG icons, loaded dialog logo, rounded layout,
12px backdrop blur, default Stay focus and suspended gallery progress. Remote
left/right, Stay/OK and Back worked in RO/EN. The real exit action was not invoked
during this hardware check; its handler was verified once in the isolated browser.
Home in Romanian was restored afterward.

## Automatic galleries and continuous progress (0.3.2)

The visible countdown, previous/next photo buttons and pause/play control were
removed from both galleries. Home has no slider controls; the attractions page
retains the Recommendations button and its separate text pagination.

The progress bar now uses a continuous linear CSS transform animation. Its cycle
completion advances the photograph, keeping the bar and image change synchronized.
There is no 100ms polling interval or per-frame React/style update. Opening an exit
dialog, reading recommendations or hiding the app pauses the same animation and
resuming continues from its current position. Language changes do not reset it.
Reduced motion stops autoplay and hides the progress bar; removing that preference
resumes automatic playback.

Validation: TypeScript/Vite/IPK build and targeted browser checks passed. Progress
changed in all 24 sampled animation frames without DOM style mutations. Checks
also covered automatic slide advance at the bar boundary, absence of the removed
controls, dialog/reading/visibility pause and resume, language continuity, retained
recommendations pagination, reduced motion and 1080p/720p bounds. The personal LG
was updated to 0.3.2 with the existing app ID.
LG inspector checks confirmed the old slider UI is absent, the progress changed
in all 20 sampled frames, and completing the CSS animation cycle advanced the
photograph correctly. Recommendations remained accessible and device pairing was
preserved. Home was restored after verification.

## Glowing text focus and accessible language selection (0.3.1)

Sidebar focus now enlarges the text by 9% with a warm glow and a 280ms transition;
the rectangular outline/background is removed for sidebar items. The dot has a
short matching glow animation. Other controls retain their existing focus styles.
All section labels remain visible, and reduced motion removes the animation.

RO and EN are separate, permanently visible options below the sidebar, labelled
Română and English. Right from any section focuses the current language; left/right
moves between RO/EN, and OK selects a language without changing the page. Up returns
to the sidebar item the guest came from. Down from Contact also reaches the language
row; left from RO returns to the previous sidebar item. Up from Home reaches the
header TV-exit button and Down returns to the current section. The footer describes
the language shortcut. Language changes preserve the current carousel and focus.

Validation: TypeScript/Vite/IPK build and targeted browser checks passed for no-box
focus, text scale/glow/transition, language access from all seven sections, both
translations, page/focus preservation, Contact/header paths, dialog focus isolation,
pointer access, 1080p/720p bounds and reduced motion. The LG package was updated to
0.3.1 with the same app ID and stored device identity.
LG inspector verification confirmed a 1.09 text scale, visible glow, transparent
sidebar button background and no outline. Remote Right reached RO/EN, English
selection preserved House rules, Up returned to that sidebar item, and the existing
pairing remained valid. Home in Romanian was restored after verification.

## Separate galleries and persistent section navigation (0.3.0)

The initial Home screen now shows four existing website photographs of apartments
and the pool. Local attractions is the second page and has its own four Maramureș
photographs. Both galleries use the same eight-second timer, crossfade, pause/manual
controls and reduced-motion handling; images are optimized and bundled in the TV
package. The welcome name appears on Home only. PMS attraction recommendations
remain available through the Recommendations button on the attractions page.

A persistent right-side menu follows the visual pattern of
`portfolio-lau/Portfolio/src/MainComponent/SectionNavigation.tsx`: section labels
with dot indicators. All labels remain visible, including inactive ones; no hover
is needed. Home, Local attractions, Wi-Fi, House rules, Facilities, Useful information
and Contact are available on every page, with gold marking the current section.
Background shading preserves text contrast over both photo collections. Up/down
moves between sidebar items, OK opens one, and Back returns Home or opens the exit
dialog from Home. The shared header retains the canonical logo, RO/EN and TV exit.

Validation: eight TV tests and TypeScript/Vite/IPK builds passed. Browser checks
covered gallery separation, all labels visible, pointer/remote input, autoplay,
pause/manual controls, all information pages, long Wi-Fi values, text pagination,
RO/EN, dialogs, reduced motion and 1080p/720p bounds. A separate fictional-guest
check confirmed the 100-character name fits without overlapping the photo caption
and is removed immediately on offline events. The personal LG was updated to 0.3.0.
Inspector checks confirmed existing pairing, loaded room photographs on Home,
loaded attraction photographs on the second page, all seven labels permanently
visible, remote section navigation, advancing autoplay and Wi-Fi access. Home was
restored after verification. One timer check was inconclusive when the selected
page changed during the observation; a subsequent stable-page check confirmed
the timer advanced correctly.

## Full-screen welcome gallery (0.2.1)

The initial welcome screen now uses the attraction gallery across the entire TV
viewport. The guest/standard welcome remains on the left, while slide captions and
pause/previous/next controls sit at the lower right. Layered gradients keep the
text readable and controls stay within the TV safe area. Wi-Fi has a direct welcome
shortcut; Stay information opens the existing bilingual sections. The large duplicate
welcome emblem was removed; the canonical logo remains in the header and launcher.

The hero reuses the existing carousel timer, local photographs and reduced-motion
behaviour. An exit dialog pauses autoplay. Entering information unmounts the hero;
returning opens the full-screen gallery again. Names over 70 characters use smaller
type, with the 100-character API maximum checked for safe-area fit. Offline handling
still clears the guest name immediately while retaining resort information.

Validation: eight TV tests and the TypeScript/Vite/IPK build passed. Browser checks
covered viewport coverage at 1080p/720p, pointer and remote controls, dialog focus,
Wi-Fi/back navigation, timer/pause, translations, reduced motion and maximum-length
fictional guest privacy. Version 0.2.1 was installed and launched on the personal LG;
inspector checks confirmed full-screen photos, loaded images, accessible controls,
pairing persistence and Wi-Fi/back navigation without document overflow.

## TV animations, photographs and launcher branding (0.2.0)

The TV now has subtle entrance, focus and emblem animations. Attractions includes
four existing website photographs with bilingual captions, crossfades and a slow
zoom. Slides advance every eight seconds with a visible progress bar/countdown;
previous, pause/resume and next are accessible with the remote. Manual navigation
resets the timer. Autoplay pauses while the document is hidden, a dialog is open
or the recommendations view is selected. Reduced motion disables animations and
starts the slideshow paused; the guest can explicitly resume it.

The Recommendations button retains the editable PMS attraction text, including
pagination. Photo captions describe the existing photographs rather than claiming
they depict specific monuments. Images are optimized and bundled locally; they do
not require an external photo host or expose guest data. Changing this bundled
gallery requires a new TV package, while PMS recommendations update through the API.

The launcher title is Sunshine Resort. Both webOS icon sizes are now rendered from
the canonical website logo in the same white rendition used in the app. The app ID
is unchanged so an ordinary update retains the existing device pairing.

Validation: eight TV tests, TypeScript/Vite/IPK build and browser checks for image
loading, eight-second advance, pause/resume, manual navigation, PMS recommendations,
pagination, RO/EN, remote arrows/OK, visibility, reduced motion and 1080p bounds passed.
Version 0.2.0 was installed and launched on the personal LG OLED55B53LA on
2026-10-21. Inspector checks confirmed pairing persistence, all four locally
bundled photos loaded, autoplay advanced, pause froze the timer, PMS recommendations
remained available, and the panel stayed within 1080p bounds. The app was returned
to its welcome screen after verification.

## Resort information and branding (2026-10-21)

PMS → Setări now contains a bilingual editor for Wi-Fi, tagline, house rules,
facilities, attractions, useful information and contact. GET/PUT
`/api/admin/tv/settings` require HTTPS and the existing admin JWT. These values
are sent only through authenticated device content responses, never a public
resort endpoint. Wi-Fi credentials are not bundled in the app or logged.

`TvResortSettings` is a single row, loaded with a 15-second per-process cache and
shared concurrent reads. Saving invalidates that process's cache. TV polling
refreshes every 30 seconds; allow up to approximately 45 seconds across instances.
No default Wi-Fi credentials or unapproved house rules are supplied. Initial
attraction names come from the existing public website and can be edited.

The TV reuses `apps/web/public/logo-sunshine.png`, copied automatically during the
build, and the resort's black/gold palette. RO/EN can be switched with the remote.
Six information sections have directional focus navigation; long text is paginated
to fit the television's safe area. Guest lease expiry/network errors clear the
name but retain the last resort information in memory. An authentication failure
clears both. No guest or Wi-Fi content is written to localStorage; only the existing
revocable device credential is persisted by the webOS adapter.

Validation: schema validation, 38 API tests, eight TV client tests, API/website/TV
production builds and a 1920×1080 browser check using fictional data passed.
The additive settings migration was applied on 2026-10-21. Commit `2bed474` was
published to Render and Vercel with explicit user approval. The protected settings
route returns 401 without authentication. The updated real-mode package was
installed and launched on the personal LG OLED55B53LA; inspector checks confirmed
the existing pairing survived, the current logo loaded, all six information
sections appeared, and both RO/EN attraction content arrived from the API, without
document overflow at 1920×1080. Wi-Fi, house rules and other unpublished details
must still be entered by the operator in PMS Settings.

Implemented scope: secure TV registration, one active TV per physical apartment,
admin assignment/revocation/privacy controls, and reservation-derived content.
The existing demo remains available separately. No booking, payment or scheduler
business rules were changed.

## Current validation and blockers

- Prisma schema validation and client generation passed.
- API build, 38 targeted API tests, eight TV client tests and the full website
  production build passed.
- Supabase was resumed and the additive TV migration was applied successfully
  on 2026-10-18. No existing reservation or payment records were changed.
- The existing public backend is `https://sunshine-resort-api.onrender.com/api`.
  The real-mode LG package is configured locally against that HTTPS endpoint.
- The LG runs the real-reservation application, paired to DELUXE-01. Real guest
  display was verified during the eligible stay on 2026-10-19; the branded resort
  information update was installed and inspected on 2026-10-21.

The user authorized selecting any apartment for the personal LG, subsequently
paired to DELUXE-01. Do not create or change a real reservation just to make a name
appear; no eligible stay correctly produces the standard welcome.

## Deployment order

1. Restore the configured database connection locally in `apps/api/.env`. Never
   paste database URLs, passwords, device bearer tokens or JWTs into chat.
2. Inspect `npx prisma migrate status` against the intended database. The migration
   `20261018180000_tv_devices` only adds `TvDevice` and `TvPairing` tables, unique
   indexes and the apartment foreign key. If unrelated migrations are pending,
   review them before applying anything. `prisma migrate deploy` applies **all**
   pending migrations; do not use `migrate reset` or `db push` on production.
3. Apply the reviewed migrations using the existing deployment workflow, generate
   the Prisma client and build/redeploy the API. Never start a second full API
   against a production DB casually: the existing app starts PMS scheduler jobs.
4. Provide HTTPS with a certificate the TV trusts. Direct HTTPS requests pass the
   transport guard. Behind a trusted TLS-terminating reverse proxy, explicitly set
  `TV_BEHIND_HTTPS_PROXY=true` (Render's managed ingress is detected automatically
  using its platform-provided `RENDER=true`); the proxy must overwrite `X-Forwarded-Proto` and
   the backend must not also be publicly reachable over HTTP. Do not enable that
   flag as an HTTP development bypass. Keep its default unset otherwise.
5. Deploy/restart the web app against the same HTTPS API. Its normal admin JWT
   authentication protects the new **Camere** apartment cards.
6. In `apps/tv/.env.reservations.local`, configure only the public URL:

   ```dotenv
   VITE_TV_API_URL=https://your-api.example/api
   ```

7. Build the dedicated real-reservation package from `apps/tv`:

   ```powershell
   npm test
   npm run package:reservations
   npm run tv:close
   npm exec -- ares-install --device sunshine-lg artifacts/reservations/com.sunshine.resort.welcome.poc_0.3.5_all.ipk
   npm run tv:launch
   ```

   This package has the same app ID as the PoC and replaces it on the test TV.
   `npm run tv:install` continues to refer to the separate demo artifact directory.
   Do not install a real-mode package before the backend is ready.

8. If not already paired, the TV shows a temporary pairing code. In PMS → Camere,
   enter it on the physical apartment's TV card, then associate. Existing pairing
   survives ordinary app updates; the code is not required on every launch. The TV
   retries and displays its apartment's content without a client-supplied room ID.

## Identity and API

The TV generates a random 256-bit credential and stores it in its platform adapter.
The server stores its SHA-256 hash, never the credential. Registration accepts only
the credential, not an apartment. The temporary eight-character code expires after
10 minutes, is stored hashed, and can be consumed only once by an authenticated
administrator. Pairing approval and apartment uniqueness are transactional.

| Endpoint | Authorization |
|---|---|
| `POST /api/tv/pairing` | HTTPS; rate limited; cannot assign a room |
| `GET /api/tv/me/content` | HTTPS + opaque device bearer credential |
| `GET /api/admin/tv/devices` | HTTPS + existing admin JWT |
| `POST /api/admin/tv/pairings/approve` | HTTPS + admin JWT; `{code, roomId}` |
| `PATCH /api/admin/tv/devices/:id` | HTTPS + admin JWT; room assignment, `hideGuestName`, `forceStandard` |
| `POST /api/admin/tv/devices/:id/revoke` | HTTPS + admin JWT; revokes identity and releases room |

Only device pairing/content endpoints permit cross-origin packaged app requests;
they use no cookies. Existing origin restrictions remain for admin/other API routes.
Rate limiting is per process; multiple API instances would need a shared limiter.
Pending pairing records are pruned after expiry when a new pairing starts.

`Room.tvDeviceId` is a legacy optional text field. Its existing values are preserved
and are not trusted as credentials. The new relational `Room.welcomeDevice` is the
authoritative binding; editing the legacy text in the Rooms screen cannot change
a paired TV's authorization.

Packaged webOS uses app-origin localStorage for the revocable credential only;
it is **not** hardware-backed storage. Physical access, developer tools, an app-origin
script compromise or clearing app storage can expose/remove that credential. There
are no third-party runtime scripts. Restrict development access on deployed devices,
revoke replaced/lost devices, and validate credential storage on final hospitality
hardware. Android can supply a Keystore adapter later. No credential is bundled in
the IPK, passed in a URL or rendered in the UI. Never persist guest content.

## Reservation and privacy rules

- Authorize through `TvDevice.roomId`, then query
  `Reservation.rooms.some.roomId`. Room types and IP addresses do not authorize a TV.
- Only `CONFIRMED` / `CHECKED_IN` stays are eligible. Cancelled/checked-out
  timestamps also exclude a stay. Source does not matter.
- The TV window is fixed at 14:00 check-in, 10:00 check-out, in Europe/Bucharest,
  with each date converted using its applicable DST offset. PMS custom time fields
  are not TV overrides in this version.
- The interval includes check-in and excludes check-out. Gaps, missing identity,
  missing assignment and overlapping eligible stays produce the standard screen.
- Query normalized internal reservations, never Booking.com directly. Availability
  calendar events alone cannot supply guest identity.
- Only the guest display name is selected. No email, phone, payments, IDs/documents
  or reservation identifiers are sent to the TV.
- Responses have `Cache-Control: no-store`, `serverTime`, and `validUntil` bounded
  by both 45 seconds and checkout. The client subtracts request elapsed time and
  schedules expiry using a duration, avoiding reliance on its wall-clock timezone.
- Poll every 30 seconds; errors, lost connectivity or hiding the app clear names.
  Resume revalidates. Changes/revocation are bounded by the refresh/lease, not instant
  while offline. No guest data is written to disk by the application.
- Admin hide/standard switches persist until explicitly cleared. They are TV-wide
  controls, not reservation lifecycle transitions.

Known existing PMS limitations: the scheduler marks confirmed reservations checked
in automatically, there is no `NO_SHOW` status in the schema, and manual checkout
rejects dates before the planned checkout date. This integration does not infer
physical presence or repair those workflows. Operations must record cancellation
or an applied date change; use the TV privacy controls when necessary. Full early
departure/no-show workflows remain separate work.

## Physical acceptance checklist

After deployment and pairing, record actual results:

- Restart app/TV and confirm device identity survives without persisting names.
- Verify exactly the assigned room's eligible reservation, or standard if none.
- Confirm another room cannot be selected through request parameters.
- Verify 14:00 / 10:00 transitions, overlap handling and modified stays.
- Disconnect network near checkout: ensure the name expires on time.
- Hide the name, force standard, reassign and revoke from the PMS.
- Confirm Home/Back and other TV applications still work normally.

Pairing persistence, real guest display and the resort information checks recorded
above have been verified on the personal LG. The remaining lifecycle, exact-time,
offline and administration acceptance scenarios still require physical validation;
automated tests do not replace that checklist. The earlier LG autostart limitation
and decision to validate the final resort hardware still apply.

Official migration reference:
https://www.prisma.io/docs/orm/v6/prisma-migrate/workflows/development-and-production
