'use strict'

const elProgress = document.getElementById('progress');

status('downloading with fetch()...');
fetch('https://fetch-progress.anthum.com/30kbps/images/sunrise-baseline.jpg')
.then(response => {
  if (!response.ok) {
    throw new Error(response.status + ' ' + response.statusText)
  }

  if (!response.body) {
    throw new Error('ReadableStream not yet supported in this browser.')
  }

  const contentLength = response.headers.get('content-length');
  if (!contentLength) {
    throw new Error('Content-Length response header unavailable');
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
