# Reservation-driven TV integration

Implemented scope: secure TV registration, one active TV per physical apartment,
admin assignment/revocation/privacy controls, and reservation-derived content.
The existing demo remains available separately. No booking, payment or scheduler
business rules were changed.

## Current validation and blockers

- Prisma schema validation and client generation passed.
- API build, 32 targeted API tests, five TV client tests and the full website
  production build passed.
- Supabase was resumed and the additive TV migration was applied successfully
  on 2026-10-18. No existing reservation or payment records were changed.
- The existing public backend is `https://sunshine-resort-api.onrender.com/api`.
  The real-mode LG package is configured locally against that HTTPS endpoint.
- The installed LG application is still the earlier fictional-data demo. Physical
  pairing and real reservation display have not been tested.

The user authorized selecting any apartment for the personal LG. Once database
access is restored, use the first available active apartment by code. Do not create
or change a real reservation just to make a name appear; no eligible stay correctly
produces the standard welcome.

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
   authentication protects the new **Televizoare** section.
6. In `apps/tv/.env.reservations.local`, configure only the public URL:

   ```dotenv
   VITE_TV_API_URL=https://your-api.example/api
   ```

7. Build the dedicated real-reservation package from `apps/tv`:

   ```powershell
   npm test
   npm run package:reservations
   npm run tv:close
   npm exec -- ares-install --device sunshine-lg artifacts/reservations/com.sunshine.resort.welcome.poc_0.1.0_all.ipk
   npm run tv:launch
   ```

   This package has the same app ID as the PoC and replaces it on the test TV.
   `npm run tv:install` continues to refer to the separate demo artifact directory.
   Do not install a real-mode package before the backend is ready.

8. The TV shows a temporary pairing code. In PMS → Televizoare, enter the code and
   select the physical apartment, then associate. The TV retries and displays its
   apartment's current content without any client-supplied room ID.

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

All real-mode hardware checks currently remain **NOT TESTED**. The earlier LG
autostart limitation and decision to validate the final resort hardware still apply.

Official migration reference:
https://www.prisma.io/docs/orm/v6/prisma-migrate/workflows/development-and-production
