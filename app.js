const ProgressBar = (function(){
  const loading = document.getElementById('loading');
  const progress = document.getElementById('progress');
  let started = false, pct;

  function evalProgress({loaded, total}) {
    if (!started) {
      loading.style.opacity=1;
      started = true;
    }
    pct = Math.round(loaded/total*100)+'%';
    console.log(pct);
    progress.style.width=pct;
    if (loaded === total) {
      console.log('download complete');
      loading.classList.add('done');
    }
  }

  return {
    evalProgress
  }
})()


function setImage(id, url) {
  const img = document.getElementById(id);
  img.src=url;
  img.offsetWidth; // animation enabler
  img.classList.add('loaded');
}

function ProgressResponse(response, onProgress) {
  if (!response.body) {
    console.warn("ReadableStream is not yet supported in this browser.  See https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream")
    return response;
  }
  if (!response.ok) {
    // HTTP error code response
    return response;
  }

  const contentLength = response.headers.get('content-length');

  if (contentLength === null) {
    // don't track download progress if we can't compare against a total size
    console.warn('No Content-Length no header in response.  See https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Access-Control-Expose-Headers');
    return response;
  }

  let loaded = 0;
  const total = parseInt(contentLength,10);
  const reader = response.body.getReader();
  return new Response(
    new ReadableStream({
      start(controller) {
        return consume();
        function consume() {
          return reader.read().then(({done, value}) => {
            if (done) {
              controller.close();
              return;
            }

            controller.enqueue(value);
            loaded += value.byteLength;
            onProgress.call(null, {loaded, total});
            return consume();
          });
        }
      }
    })
  )
}

console.log('downloading...');
fetch('https://dev.anthum.com/retain/30kbps/sunrise-progressive.jpg')
.then(response => new ProgressResponse(response, ProgressBar.evalProgress))
.then(response => response.blob())
.then(blob => URL.createObjectURL(blob))
.then(url => setImage('img', url))
.catch(error => console.error('error', error));
