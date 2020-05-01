// evaluate progress on *?requestId=* URLs only
const progressIndicatorUrls = /\?requestId=/i;

// always install updated SW immediately
self.addEventListener('install', event => {
  self.skipWaiting();
})

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const scope = self.registration.scope;

  // redirect index.html to service-worker-enabled page
  if (event.request.url === scope || event.request.url === scope+'index.html') {
    const newUrl = scope+'sw-installed.html';
    console.log('respondWith', newUrl);
    event.respondWith(fetch(newUrl))
  } else if (progressIndicatorUrls.test(event.request.url)) {
    console.log('VER',2,event.request.url)
    event.respondWith(fetchWithProgressMonitor(event))
  }
})

function fetchWithProgressMonitor(event) {
  /*  opaque request responses won't give us access to Content-Length and
   *  Response.body.getReader(), which are required for calculating download
   *  progress.  Respond with a newly-constructed Request from the original Request
   *  that will give us access to those.
   *  See https://stackoverflow.com/questions/39109789/what-limitations-apply-to-opaque-responses

   *  'Access-Control-Allow-Origin' header in the response must not be the
   *  wildcard '*' when the request's credentials mode is 'include'.  We'll omit credentials in this demo.
   */
  const newRequest = new Request(event.request, {
    mode: 'cors',
    credentials: 'omit'
  })
  return fetch(newRequest).then(response => respondWithProgressMonitor(event.clientId, response));
}

function respondWithProgressMonitor(clientId, response) {
  if (!response.body) {
    console.warn("ReadableStream is not yet supported in this browser.  See https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream")
    return response;
  }
  if (!response.ok) {
    // HTTP error code response
    return response;
  }

  // server must send custom x-file-size header if gzip or other content-encoding is used
  const contentEncoding = response.headers.get('content-encoding');
  const contentLength = response.headers.get(contentEncoding ? 'x-file-size' : 'content-length');
  if (contentLength === null) {
    // don't track download progress if we can't compare against a total size
    console.warn('Response size header unavailable. Cannot measure progress');
    return response;
  }

  let loaded = 0;
  debugReadIterations=0; // direct correlation to server's response buffer size
  const total = parseInt(contentLength,10);
  const reader = response.body.getReader();

  return new Response(
    new ReadableStream({
      start(controller) {        
        // get client to post message. Awaiting resolution first read() progress
        // is sent for progress indicator accuracy
        let client;
        clients.get(clientId).then(c => {
          client = c;
          read();
        });

        function read() {
          debugReadIterations++;
          reader.read().then(({done, value}) => {
            if (done) {
              console.log('read()', debugReadIterations);
              controller.close();
              return;
            }

            controller.enqueue(value);
            loaded += value.byteLength;
            // console.log('    SW', Math.round(loaded/total*100)+'%');
            dispatchProgress({client, loaded, total});
            read();
          })
          .catch(error => {
            // error only typically occurs if network fails mid-download
            console.error('error in read()', error);
            controller.error(error)
          });
        }
      },

      // Firefox excutes this on page stop, Chrome does not
      cancel(reason) {
        console.log('cancel()', reason);
      }
    })
  )
}

function dispatchProgress({client, loaded, total}) {
  client.postMessage({loaded,total})
}