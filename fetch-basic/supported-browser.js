'use strict'

const elProgress = document.getElementById('progress');

status('downloading with fetch()...');
fetch('https://fetch-progress.anthum.com/30kbps/images/sunrise-baseline.jpg')
.then(response => {
  if (!response.ok) {
    throw Error(response.status+' '+response.statusText)
  }

  if (!response.body) {
    throw Error('ReadableStream not yet supported in this browser.')
  }

  // to access headers, server must send CORS header "Access-Control-Expose-Headers: content-encoding, content-length x-file-size"
  // server must send custom x-file-size header if gzip or other content-encoding is used
  const contentEncoding = response.headers.get('content-encoding');
  const contentLength = response.headers.get(contentEncoding ? 'x-file-size' : 'content-length');
  if (contentLength === null) {
    throw Error('Response size header unavailable');
  }

  const total = parseInt(contentLength, 10);
  let loaded = 0;

  return new Response(
    new ReadableStream({
      start(controller) {
        const reader = response.body.getReader();

        read();
        function read() {
          reader.read().then(({done, value}) => {
            if (done) {
              controller.close();
              return; 
            }
            loaded += value.byteLength;
            progress({loaded, total})
            controller.enqueue(value);
            read();
          }).catch(error => {
            console.error(error);
            controller.error(error)                  
          })
        }
      }
    })
  );
})
.then(response => response.blob())
.then(data => {
  status('download completed')
  document.getElementById('img').src = URL.createObjectURL(data);
})
.catch(error => {
  console.error(error);
  status(error);
})

function progress({loaded, total}) {
  elProgress.innerHTML = Math.round(loaded/total*100)+'%';
}
