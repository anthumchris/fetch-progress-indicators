Examples for showing progress bars and progress indicators for `fetch()`.  Uses the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), [Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API), and [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).

<img clear="both" align="left" width="200px" src="https://raw.githubusercontent.com/AnthumChris/fetch-progress-indicators/master/images/logo-streams-300.png" /><br>


# Demo

https://fetch-progress.anthum.com/

<br><br>

### Examples
* [Fetch](https://fetch-progress.anthum.com/fetch-basic/): A ReadableStream is used to show download progress during a `fetch()` download.
* [Fetch - Enhanced](https://fetch-progress.anthum.com/fetch-enhanced/): Same as above with robust code for preventing multiple downloads and handling other real-world UI interactions and edge cases.
* [Service Worker](https://fetch-progress.anthum.com/sw-basic/): A ReadableStream is used in a Service Worker to simulatenously show download progress for the `FetchEvent` of an inline `<img>` tag.  

### Gzip & Content-Encoding Support

- https://github.com/AnthumChris/fetch-progress-indicators/issues/13

### Browser Support
The aforementioned APIs are new/expermiental and do not currently work on all browsers. Testing was done with the browsers below:

| Browser | Test Results |
| :--- | :--- |
| Chrome 64 | Full support |
| Firefox 58/59  | Full support (requires [activation of experimental flags](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams#Browser_support))  |
| iOS Safari 8 | Unsupported |
| iOs Safari 11 | Fetch support only. Service Workers unsupported |
| Mac Safari 11.0 | Fetch support only. Service Workers unsupported |
| Mac Safari 11.1 | Full Support |
| IE/Edge | Not tested (no device available) |

# Background

Prior to the recent addition of [fetch()](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch), the [XMLHttpRequest.onprogress](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequestEventTarget/onprogress) callback handler was traditionally used to show progress bars and progress indicators.  The Fetch API is great and we should use it, but "onprogress" handlers are not currently implemented with Fetch.  These examples allow us to leverage Fetch while providing users with immediate feedback during certain "loading" states.  Progress indicators could be especially useful to users on slow networks.

# Lessons & Conclusions

This repository began as a proof of concept for showing progress indicators from Service Workers.  Everything seemed to work out and a few important lessons and caveats were discovered:
1. Firefox successfully stops network reading and cancels downloads on fetch events that implement custom `ReadableStream` readers when the user signals the cancelation/abort of a page load (e.g. pressing ESC, clicking stop button, invoking `window.stop()`)
1. Chrome and Safari don't stop network reading and files continue to download when a page load cancel/abort occurs.
1. The `abort` event does not seem to be firing on Chrome, Firefox, or Safari as defined in the HTML spec [7.8.12 Aborting a document load](https://html.spec.whatwg.org/multipage/browsing-the-web.html#abort-a-document).
   1. `<img onabort>` callbacks are not called.
   1. `window.onabort` callbacks are not called.
   2. see [Abort Event Detection Test](https://fetch-progress.anthum.com/test/abort-event.html)
1. A Firefox bug was discovered when using hash fragments in URLs: https://bugzilla.mozilla.org/show_bug.cgi?id=1443850


### Back-End Image Server

To properly exemplify progress indicators for slow downloads or large files, a small (100kb) JPEG is being served from a remote HTTP/2 Nginx server that limits download speeds.  The buffer/packet size is also reduced to show smoother, or more frequent progress updates (more iterations of `ReadableStreamDefaultReader.read()`).  Otherwise, `read()` would send fewer progress updates that result in choppy progress indicators. Caching is disabled to force network requests for repeated tests.

Both Baseline and Progressive JPEG files are available for testing with other speeds:

https://fetch-progress.anthum.com/10kbps/images/sunrise-baseline.jpg<br>
https://fetch-progress.anthum.com/20kbps/images/sunrise-baseline.jpg<br>
https://fetch-progress.anthum.com/30kbps/images/sunrise-baseline.jpg<br>
https://fetch-progress.anthum.com/60kbps/images/sunrise-baseline.jpg<br>
https://fetch-progress.anthum.com/120kbps/images/sunrise-baseline.jpg

https://fetch-progress.anthum.com/10kbps/images/sunrise-progressive.jpg<br>
https://fetch-progress.anthum.com/20kbps/images/sunrise-progressive.jpg<br>
https://fetch-progress.anthum.com/30kbps/images/sunrise-progressive.jpg<br>
https://fetch-progress.anthum.com/60kbps/images/sunrise-progressive.jpg<br>
https://fetch-progress.anthum.com/120kbps/images/sunrise-progressive.jpg
