## Deployment

This repository's working `master` branch is available below:

https://anthumchris.github.io/fetch-progress-indicators/


# Fetch() Progress Indicators

This repository attempts to provide working JavaScript examples of displaying progress indicators to users when the [JavaScript Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) is used to retrieve or download large files or average files over slow connections.  The big goal is to provide users with immediate feedback during certain "loading" states while allowing developers to leverage the huge gains of the new Fetch API.  

Prior to the recent addition of [fetch()](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch), the [XMLHttpRequest.onprogress](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequestEventTarget/onprogress) callback handler was used.  All examples currently leverage [`response.body.getReader()`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream), which is not currently implemented in all browsers.  

## Examples
1. The first completed example shows a progress indicator when `fetch()` is used to load a remote image.  `fetch()` is called, the response is parsed with `response.blob()`, and the `<img>` element's `src` attribute value is set to a blob URL.

2. The next (not yet started) example will attempt to use a [ServiceWorker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) to show a progress indicator while the browser natively loads an image using the standard `<img>.src` value with the remote HTTPS image URL.  This native browser loading allows the image to be progressively shown as it's loaded.  We'll try to keep this native functionality and use `ServiceWorker` to show progress bar concurrently without interrupting the natural flow of things.

### Back-End Server

A remote Nginx server running HTTP/2 is limiting download speeds to to 30kbps to ensure that progress bars always show when the remote images are fetched.  Caching is disabled on all responses.  Both Baseline JPEG and Progressive JPEG files are available for testing, and you can find more test files below if needed:

https://dev.anthum.com/retain/5kbps/sunrise-progressive.jpg<br>
https://dev.anthum.com/retain/10kbps/sunrise-progressive.jpg<br>
https://dev.anthum.com/retain/20kbps/sunrise-progressive.jpg<br>
https://dev.anthum.com/retain/30kbps/sunrise-progressive.jpg<br>
https://dev.anthum.com/retain/nolimit/sunrise-progressive.jpg

https://dev.anthum.com/retain/5kbps/sunrise-baseline.jpg<br>
https://dev.anthum.com/retain/10kbps/sunrise-baseline.jpg<br>
https://dev.anthum.com/retain/20kbps/sunrise-baseline.jpg<br>
https://dev.anthum.com/retain/30kbps/sunrise-baseline.jpg<br>
https://dev.anthum.com/retain/nolimit/sunrise-baseline.jpg
