# Sunshine Resort TV — LG webOS PoC

Reservation integration has now been implemented separately from this demo. See
[deployment, pairing, security and remaining blockers](../../docs/tv-reservations.md).
The installed TV remains in fictional-data mode until the database and HTTPS API
deployment are ready; building the new code does not itself enable live reservations.

Isolated React/TypeScript prototype connected to the NestJS demo endpoint. Fictional
guest only; no device credentials, local guest storage, migrations or PMS changes.

## Structure

- `src/shared`: platform-independent UI, HTTP client, fallback and minimal contracts.
- `src/platform/webos.ts`: LG close and lifecycle adapter. A future Android entry
  point can inject a different `TvPlatform` without changing the UI.
- `webos/appinfo.json`: LG package manifest.
- `scripts/prepare-assets.mjs`: reuses the website logo and optimizes separate room/pool and Maramureș galleries for offline TV playback.
- `scripts/prepare-webos.mjs`: copies the manifest and renders 80/130px launcher icons from the existing Sunshine Resort logo; `sharp` is a build-only dependency.
- Typography: [Montserrat Variable](https://fontsource.org/fonts/montserrat) is bundled locally in normal/italic faces, including Romanian diacritics. The IPK contains the original font license as `Montserrat-OFL.txt`.
- `dist`: generated, packaged static application with relative asset paths.
- `artifacts`: generated `.ipk`; not committed.

Each existing application has its own npm manifest/lockfile; this prototype follows
that convention. No root workspace or new shared package is needed for one consumer.

Verified locally: TypeScript check, Vite production build and official CLI 3.2.6
packaging on Node 22.23.2. The `.ipk` was generated successfully, installed and
launched on the physical LG. The user confirmed rendering, remote navigation,
normal exit, other TV applications/inputs and return to Welcome. See the hardware
record below for the remaining untested scenarios.

## Windows development and build

Node 22.23.2 and npm 10.9.8 were found on the development computer. No global webOS
CLI was installed. This app pins the official `@webos-tools/cli` locally, so global
installation is unnecessary. LG's installation page still recommends older Node
versions; actual CLI build/package behavior must be checked on the installed Node.

## Demo API connection (approved scope extension)

`GET /api/tv/demo/content` is implemented in the existing NestJS API's `TvDemoModule`.
It returns only fictional John Smith / placeholder resort information, uses no
database, and sets `Cache-Control: no-store`. Only this GET/OPTIONS route permits
all CORS origins without credentials (including packaged webOS origins); the main
API's existing CORS policy is preserved on every other route. This is a public demo,
not a production device authentication contract. Never populate it with real guests.

For LAN testing without connecting to the production DB or starting PMS schedulers:

```powershell
Set-Location C:\Users\Laurentiu\Workplace\sunshine-resort\apps\api
npm run start:tv-demo
```

This runs the exact same NestJS module on port 3002. Keep that process running.
The full API also mounts the module on its normal port when started or deployed;
the deployed API has not been updated by this local test.

In `apps/tv`, copy `.env.example` to `.env.local`, set
`VITE_TV_DEMO_CONTENT_URL=http://<PC-LAN-IP>:3002/api/tv/demo/content`, then rebuild,
package and reinstall. `localhost` on the TV points to the TV, not the PC. Current
test URL: `http://192.168.1.64:3002/api/tv/demo/content`. LAN addresses can change.
This Vite setting is public build configuration; never put secrets in it.

Requests run at launch, resume and every 30 seconds after the previous request.
Each request has an 8-second timeout. HTTP, JSON or network errors clear the guest
and show the standard welcome; retry continues automatically. A 45-second memory
lease also bounds stale display. Hidden apps clear the content and revalidate on
return. No API URL configured means the standard screen, never a local John Smith
fallback. The footer indicates `API connected` or the current failure state.

HTTP is only for this fictional-data LAN test. Production must use outbound HTTPS,
per-device authentication and reservation expiry. If LAN requests fail, inspect the
TV console/network and Windows firewall; do not disable the firewall globally.

Verified: API build, two Nest HTTP/CORS tests, two TV contract/error tests, TV build
and IPK packaging. The updated IPK was installed and launched on the physical LG;
official Web Inspector confirmed the rendered footer `API connected`.
Inspector network emulation on the physical LG also confirmed that a failed
request shows `Welcome to Sunshine Resort` / `API unavailable`, and restoring
network access plus an online event restores `Welcome, John Smith` / `API connected`.
This checks the error/recovery path; it is not a physical Wi-Fi outage test or a
timed verification of the periodic 30-second retry.

```powershell
# apps/api
npm test -- --runInBand tv-demo
# apps/tv
npm test
```

```powershell
Set-Location C:\Users\Laurentiu\Workplace\sunshine-resort\apps\tv
npm ci
npm run webos -- -V
npm run dev
# Stop the dev server with Ctrl+C before continuing.
npm run package:webos
```

If npm is configured for offline mode and packages are missing:

```powershell
npm ci --offline=false
```

Optional global install, only if commands outside npm scripts are wanted:

```powershell
npm install -g @webos-tools/cli@3.2.6
ares -V
```

No emulator, Android SDK, root access or firmware modification is required.
Browser preview supports arrows/Enter and Escape for Back. Closing a normal browser
tab via `window.close()` is typically blocked; test actual exit on the television.

## Physical setup — stop for user confirmation here

1. TV and computer must be on the same reachable LAN, without Wi-Fi client isolation.
2. Open Developer Mode on the LG OLED55B53LA. Confirm Dev Mode Status is ON.
   Complete the requested TV restart, then reopen Developer Mode.
3. Enable **Key Server** and read the current IP on the TV. `192.168.1.50` is only
   the initial DHCP address, not an application identity.
4. Confirm these physical steps before attempting connection/install.

After confirmation, in the app directory:

```powershell
npm exec -- ares-config --profile tv
npm run device:setup
```

Choose `add`: name `sunshine-lg`, host the current TV IP, port `9922`, SSH user
`prisoner`, no password, profile `tv`; save. For DHCP changes choose `modify`.

```powershell
npm exec -- ares-setup-device --list
npm run device:key
# Type the TV passphrase directly into your own terminal when prompted.
# Never paste passphrases or private key files into chat or commit them.
npm run device:info
```

If unreachable, verify the IP and TV power state, Key Server, subnet and isolation.
Use `Test-NetConnection 192.168.1.50 -Port 9922` (substitute current IP).
Do not disable the Windows firewall wholesale. Device registration and SSH keys
are development tooling state, separate from future production device pairing.

## Install, launch, inspect, rebuild

```powershell
npm run tv:install
npm run tv:launch
npm run tv:inspect
```

Web Inspector provides Console logs (`[Sunshine lifecycle]`), JavaScript errors,
DOM and network debugging. If automatic browser opening fails, open the inspector
URL printed by the CLI in Chrome. Relaunch the app after starting Inspector to
capture startup logs. It is not a persisted system-log collector.

After changing code:

```powershell
npm run package:webos
npm run tv:close
npm run tv:install
npm run tv:launch
```

If the app is already closed, the close command may report it is not running;
continue with install. Current package path:
`artifacts/com.sunshine.resort.welcome.poc_0.3.6_all.ipk`.
If changing manifest version or ID, also update scripts with explicit package names.

## Hardware test record

Test session: 2026-10-18. CLI reported model `OLED55B53LA.DEUQLJP`, SDK `10.3.2`,
firmware `33.31.75`. Quick Start and Always Ready settings were not inspected.
Installation/launch were verified by CLI; viewing/navigation outcomes below were
reported by the user. Separate pointer, Cancel and offline tests were not confirmed.

| Test | Expected check | Result |
|---|---|---|
| Launch from LG Home | Sunshine branding, John Smith, tagline | PASS: rendering and return from Home confirmed |
| Arrows + OK | Visible focus, open information, return | PASS: user confirmed navigation |
| Magic Remote pointer | Buttons clickable | NOT TESTED |
| Back from information | Welcome page | PASS: user confirmed |
| Back at welcome | Custom confirmation; Cancel stays, Exit closes | PASS: normal exit confirmed; Cancel not separately tested |
| Home | LG launcher accessible | PASS: user confirmed |
| Netflix | Launch and use normally; return via Home | PASS: user confirmed |
| YouTube | Launch and use normally; return via Home | PASS: user confirmed |
| HDMI / live TV | Select input/tuner and watch; return via Home | PASS: requested TV/input test group confirmed; individual inputs not recorded |
| Standby while welcome visible | Record restored screen and lifecycle event | OBSERVED: clock after first Power press, second Power press, then Home on power-on; exact power mode and lifecycle events unverified |
| Standby while another app visible | Record restored screen; no forced takeover | NOT TESTED |
| Full restart / cold boot | Record actual launch behavior | NOT TESTED |
| Offline launch | Packaged screens still available | NOT TESTED |

Short Back opens our confirmation at root; Home is never intercepted. No kiosk,
background relaunch timer, app switching hacks or privileged launch services.
Visibility/relaunch events appear in Console and a small footer status.

## Hardware decision

Agreed with the user: retain the personal LG as a UI development and remote-control
test device. Automatic startup is not validated for resort use. Full cold boot is
still untested; the observed power sequence must not be described as a cold-boot test.

Before selecting the eight resort televisions, require a demonstration on the exact
model and firmware of supported automatic Welcome launch after both standby and
power loss, while preserving normal Home/Back, streaming apps and live TV/input use.
Record the startup mechanism, production installation/update method and any required
licenses. Neither a platform name nor an external Android device alone satisfies
these acceptance criteria. No production hardware has been selected.

## Autostart and Developer Mode limitations

LG states there is no public API for ordinary apps to launch automatically when
the TV powers on. Standby resume is distinct from cold boot and may vary with
firmware/settings/memory. This prototype does not implement autostart. The television
must be tested before any procurement decision; hospitality hardware requires its
own documented integration. An external device also needs separate validation.

Developer Mode is time-limited. Use EXTEND in the TV's Developer Mode app before
expiry. LG documents that disabling Developer Mode uninstalls development apps.
This sideloading workflow is for testing, not a production deployment strategy.

## Future integration boundary

Future production adapters will use outbound HTTPS to NestJS, secure per-device
identity mapped server-side to `Room`, reservation-based eligibility and bounded
guest content expiry. DHCP addresses will not authorize guests. Guest, TV and admin
networks should be isolated with explicit required outbound access. None of these
production features are implemented in this PoC.

## Official references

- CLI installation: https://webostv.developer.lge.com/develop/tools/cli-installation
- CLI commands: https://webostv.developer.lge.com/develop/tools/cli-dev-guide
- Developer Mode / keys: https://webostv.developer.lge.com/develop/getting-started/developer-mode-app
- Back behavior: https://webostv.developer.lge.com/develop/guides/back-button
- Lifecycle: https://webostv.developer.lge.com/develop/guides/app-lifecycle-management
- LG autostart response: https://forum.webostv.developer.lge.com/t/how-to-make-the-app-launch-automatically-after-power-on/28121
