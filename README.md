# second-saturn

Astria天穹 public website and web recap surface.

## Routes

- `/`: official homepage, download entry, feature introduction.
- `/legal/privacy`: privacy policy.
- `/legal/terms`: terms of service.
- `/account-deletion`: account deletion information and contact entry.
- `/recap/travel`: public web version of the annual travel recap.
- `/recap/travel/embed`: lightweight WKWebView version for the app.
- `/travel-annual-recap`: legacy redirect to `/recap/travel`.

## Travel Recap Embed Contract

The app owns statistics and privacy trimming. The web page owns rendering, animation, slide navigation, and share-card layout.

The embed page accepts a `RecapPayload` with `schemaVersion: 1`.

Contract references:

- [`docs/recap-payload.schema.json`](docs/recap-payload.schema.json)
- [`docs/recap-payload-example-minimal.json`](docs/recap-payload-example-minimal.json)
- [`docs/recap-payload-example-full.json`](docs/recap-payload-example-full.json)
- [`docs/wkwebview-integration.md`](docs/wkwebview-integration.md)

Supported injection paths:

```js
window.__ASTRIA_RECAP_PAYLOAD__ = payload;
```

```js
window.AstriaRecap.render(payload);
```

```js
window.postMessage({ type: 'astria:recap-payload', payload }, '*');
```

The page also exposes:

```js
window.AstriaRecap.createShareImage();
window.AstriaRecap.getPayloadStatus();
window.AstriaRecap.showEmpty();
```

## App Bridge Events

The page dispatches a browser event and, when available, posts to `window.webkit.messageHandlers.astriaRecap`.

```js
window.addEventListener('astria:recap-event', (event) => {
  console.log(event.detail.type, event.detail.payload);
});
```

WKWebView message handler name:

```swift
configuration.userContentController.add(scriptMessageHandler, name: "astriaRecap")
```

Event types:

- `recap-ready`: page runtime is ready.
- `recap-payload-accepted`: payload passed validation and rendered.
- `recap-payload-rejected`: payload failed validation.
- `recap-slide-changed`: current slide changed.
- `share-image-created`: PNG data URL was created.
- `share-image-failed`: PNG generation failed.

`recap-payload-accepted` includes `slideCount`, `coreSlideCount`, and `optionalSlideCount`.

Payload rejection reasons:

- `payload-not-object`
- `schema-version-mismatch`
- `slides-empty`

The share image event payload includes:

```ts
{
  dataUrl: string;
  format: "image/png";
  title: string;
}
```

For local visual checks, `/recap/travel/embed?demo=1` renders the demo payload. `/recap/travel/embed?debug=invalid` renders the rejected-payload state. The default embed route waits for app data.

`/recap/travel/embed?demo=minimal` renders only core slides, matching the first App integration pass.

Slides can include conditional metadata:

```ts
{
  optional?: boolean;
  priority?: number;
  triggerReason?: string;
  emptyBehavior?: "hide" | "show-empty" | "show-muted";
}
```

The page sorts slides by `priority` and drops invalid optional slides during validation. Share cards can use `variant: "standard" | "chocobo-rush" | "zero-page" | "gatekeeper" | "quiet-window"`.

Sensitive identifiers must not be included in the payload: order ID, account ID, SNDA ID, credentials, or raw official-account identifiers.

## Security Notes

- Serve production pages only over HTTPS.
- Restrict the App-side WKWebView to `astria.cxmeow.top`.
- Do not add third-party analytics or remote scripts to recap pages.
- The web page should not upload recap payloads by default.
- Recommended server CSP baseline:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

## Development

```sh
pnpm build
pnpm exec astro preview --host 127.0.0.1
```

The project guide prefers background dev mode when available:

```sh
astro dev --background
```
