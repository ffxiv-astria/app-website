# WKWebView Integration

This page documents the App-side contract for `/recap/travel/embed`.

## URL

Production:

```text
https://astria.cxmeow.top/recap/travel/embed
```

Local demo checks:

```text
http://127.0.0.1:4321/recap/travel/embed?demo=1
http://127.0.0.1:4321/recap/travel/embed?demo=minimal
http://127.0.0.1:4321/recap/travel/embed?debug=invalid
```

## Payload Ownership

The App calculates and trims `RecapPayload`. The Web page renders the payload and creates the share image.

Do not send these fields to the Web page:

- order ID
- account ID
- SNDA ID
- credentials
- raw official-account identifiers

Character names can be displayed.

## Swift Sketch

```swift
import WebKit

final class TravelRecapBridge: NSObject, WKScriptMessageHandler, WKNavigationDelegate {
    private let payloadJSON: String
    private let scriptHandler: WeakScriptMessageHandler
    let webView: WKWebView

    init(payloadJSON: String) {
        self.payloadJSON = payloadJSON
        let scriptHandler = WeakScriptMessageHandler()

        let configuration = WKWebViewConfiguration()
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        configuration.userContentController.add(scriptHandler, name: "astriaRecap")

        self.scriptHandler = scriptHandler
        self.webView = WKWebView(frame: .zero, configuration: configuration)
        super.init()

        scriptHandler.target = self
        webView.navigationDelegate = self
    }

    func load() {
        let url = URL(string: "https://astria.cxmeow.top/recap/travel/embed")!
        webView.load(URLRequest(url: url))
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        let script = """
        window.AstriaRecap?.render(\(payloadJSON));
        """
        webView.evaluateJavaScript(script)
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "astriaRecap",
              let body = message.body as? [String: Any],
              let type = body["type"] as? String else {
            return
        }

        switch type {
        case "recap-ready":
            break
        case "recap-payload-accepted":
            break
        case "recap-payload-rejected":
            break
        case "share-image-created":
            if let payload = body["payload"] as? [String: Any],
               let dataURL = payload["dataUrl"] as? String {
                handleShareImage(dataURL)
            }
        default:
            break
        }
    }

    private func handleShareImage(_ dataURL: String) {
        guard let comma = dataURL.firstIndex(of: ",") else { return }
        let base64 = String(dataURL[dataURL.index(after: comma)...])
        guard let data = Data(base64Encoded: base64) else { return }
        // Present UIActivityViewController, save to Photos, or pass to the native share sheet.
        _ = data
    }
}
```

Use the project's existing weak bridge helper, or define a tiny one like this:

```swift
final class WeakScriptMessageHandler: NSObject, WKScriptMessageHandler {
    weak var target: WKScriptMessageHandler?

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        target?.userContentController(userContentController, didReceive: message)
    }
}
```

## Events

All messages use this shape:

```ts
{
  type: string;
  payload: object;
  schemaVersion: 1;
  timestamp: string;
}
```

Important events:

- `recap-ready`: runtime loaded.
- `recap-payload-accepted`: payload rendered. Payload includes `slideCount`, `coreSlideCount`, and `optionalSlideCount`.
- `recap-payload-rejected`: payload rejected. Payload includes `reason`.
- `recap-slide-changed`: current slide changed.
- `share-image-created`: share PNG data URL created.
- `share-image-failed`: share PNG generation failed.

## Conditional Slides

The App can send only core slides for the first integration pass. Mark core slides with:

```json
{
  "optional": false,
  "priority": 10
}
```

Optional slides should include why they exist:

```json
{
  "optional": true,
  "priority": 120,
  "triggerReason": "鸟区 18:00-21:00 成功出发次数大于 0",
  "emptyBehavior": "hide"
}
```

The Web page sorts slides by `priority`, then by original order. If an optional slide lacks enough display fields or metrics, the Web page drops it during validation.

## Security Checklist

- Load only `https://astria.cxmeow.top/recap/travel/embed` in production.
- Reject navigation to non-whitelisted hosts in `WKNavigationDelegate`.
- Do not inject raw JSON by string concatenation unless it comes from `JSONEncoder`.
- Keep recap payload local; the Web page does not upload it by default.
- Do not enable third-party scripts on recap pages.
