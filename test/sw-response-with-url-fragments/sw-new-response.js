// base64 SVG image
const img64 = 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gU3ZnIFZlY3RvciBJY29ucyA6IGh0dHA6Ly93d3cub25saW5ld2ViZm9udHMuY29tL2ljb24gLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwMCAxMDAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMDAwIDEwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPG1ldGFkYXRhPiBTdmcgVmVjdG9yIEljb25zIDogaHR0cDovL3d3dy5vbmxpbmV3ZWJmb250cy5jb20vaWNvbiA8L21ldGFkYXRhPg0KPGc+PHBhdGggZmlsbD0iIzBiMCIgZD0iTTcyMi43LDEwSDI3Ny4zQzEyOS42LDEwLDEwLDEyOS42LDEwLDI3Ny4zdjQ0NS41QzEwLDg3MC4zLDEyOS42LDk5MCwyNzcuMyw5OTBoNDQ1LjVDODcwLjMsOTkwLDk5MCw4NzAuMyw5OTAsNzIyLjdWMjc3LjNDOTkwLDEyOS42LDg3MC4zLDEwLDcyMi43LDEweiBNODkyLDY3OC4yQzg5Miw3OTYuMiw3OTYuMiw4OTIsNjc4LjIsODkySDMyMS44QzIwMy43LDg5MiwxMDgsNzk2LjIsMTA4LDY3OC4yVjMyMS44QzEwOCwyMDMuNywyMDMuNywxMDgsMzIxLjgsMTA4aDM1Ni40Qzc5Ni4yLDEwOCw4OTIsMjAzLjcsODkyLDMyMS44VjY3OC4yTDg5Miw2NzguMnoiLz48cGF0aCBmaWxsPSIjMGIwIiBkPSJNNTA4LjgsNjYzLjljLTksOS41LTIwLjcsMTQuMi0zMi41LDE0LjJzLTIzLjUtNC44LTMyLjUtMTQuMmwtMTUzLjEtMTYyYy05LjQtMTAtMTMuNi0yMy4yLTEzLjEtMzYuM2MwLjQtMTEuOCw0LjYtMjMuNSwxMy4xLTMyLjRjOC41LTksMTkuNS0xMy40LDMwLjctMTMuOGMxMi4zLTAuNSwyNC44LDMuOSwzNC4zLDEzLjhsMTIwLjcsMTI3LjZMNjg4LjksMzM2YzkuNC0xMCwyMS45LTE0LjQsMzQuMy0xMy44YzExLjEsMC41LDIyLjEsNC45LDMwLjYsMTMuOGM4LjUsOSwxMi43LDIwLjcsMTMuMSwzMi40YzAuNSwxMy4xLTMuNiwyNi4zLTEzLjEsMzYuM0w1MDguOCw2NjMuOXoiLz48L2c+DQo8L3N2Zz4=';
const imgUrl = 'data:image/svg+xml;base64,'+img64;
const imgBytes = atob(img64);

// create blob for testing responses
const imgByteArray = new Uint8Array(imgBytes.length);
for (let i=0; i<imgBytes.length; i++) {
  imgByteArray[i] = imgBytes.charCodeAt(i);
}
const blob = new Blob([imgByteArray], {type: 'image/svg+xml'});

self.addEventListener('install', event => {
  self.skipWaiting();
})

self.addEventListener('fetch', event => {
  const url = event.request.url
  if (/\/sw-image\.svg/.test(url)) {

    if (/\?fetch/.test(url)) {
      console.log('fetch', url);
      event.respondWith(fetch(imgUrl))
    }

    else if (/\?blob-response/.test(url)) {
      console.log('blob-response', url);
      event.respondWith(new Response(blob))
    }

    else if (/\?stream-response/.test(url)) {
      console.log('stream-response', url);
      event.respondWith(
        new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(imgByteArray);
              controller.close();
            }
          }),
          {
            headers: {
              'content-type': 'image/svg+xml'
            }
          }
        )
      )
    }

  }
})
