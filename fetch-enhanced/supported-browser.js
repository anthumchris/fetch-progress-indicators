'use strict'

class ProgressReportFetcher {
  constructor(onProgress = function() {}) {
    this.onProgress = onProgress;
  }

  // mimic native fetch() instantiation and return Promise
  fetch(input, init = {}) {
    const request = (input instanceof Request)? input : new Request(input)
    this._cancelRequested = false;

    return fetch(request, init).then(response => {
      if (!response.body) {
        throw Error('ReadableStream is not yet supported in this browser.  <a href="https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream">More Info</a>')
      }

      // this occurs if cancel() was called before server responded (before fetch() Promise resolved)
      if (this._cancelRequested) {
        response.body.getReader().cancel();
        return Promise.reject('cancel requested before server responded.');
      }

      if (!response.ok) {
        // HTTP error server response
        throw Error(`Server responded ${response.status} ${response.statusText}`);
      }


      // to access headers, server must send CORS header "Access-Control-Expose-Headers: content-encoding, content-length x-file-size"
      // server must send custom x-file-size header if gzip or other content-encoding is used
      const contentEncoding = response.headers.get('content-encoding');
      const contentLength = response.headers.get(contentEncoding ? 'x-file-size' : 'content-length');
      if (contentLength === null) {
        // don't evaluate download progress if we can't compare against a total size
        throw Error('Response size header unavailable');
      }

      const total = parseInt(contentLength,10);
      let loaded = 0;

      this._reader=response.body.getReader()

      const me = this;

      return new Response(
        new ReadableStream({
          start(controller) {
            if (me.cancelRequested) {
              console.log('canceling read')
              controller.close();
              return;
            }

            read();
            function read() {
              me._reader.read().then(({done, value}) => {
                if (done) {
                  // ensure onProgress called when content-length=0
                  if (total === 0) {
                    me.onProgress.call(me, {loaded, total});
                  }

                  controller.close();
                  return;
                }

                loaded += value.byteLength;
                me.onProgress.call(me, {loaded, total});
                controller.enqueue(value);
                read();
              }).catch(error => {
                console.error(error);
                controller.error(error)
              });
            }
          }
        })
      )
    });
  }

  cancel() {
    console.log('download cancel requested.')
    this._cancelRequested = true;
    if (this._reader) {
      console.log('cancelling current download');
      return this._reader.cancel();
    }
    return Promise.resolve();
  }
}


const imageLoader = (function() {
  const loader = document.getElementById('loader');
  const img = loader.querySelector('img');
  const errorMsg = loader.querySelector('.error');
  const loading = loader.querySelector('.progress-bar');
  const progress = loader.querySelector('.progress');

  let locked, started, progressFetcher, pct;

  function downloadDone(url) {
    console.log('downloadDone()')
    img.src=url;
    img.offsetWidth; // pre-animation enabler
    loader.classList.remove('loading');
    loader.classList.add('loading-complete');
    // progressFetcher = null;
  }

  function startDownload() {
    // Ensure "promise-safe" (aka "thread-safe" JavaScript).
    // Caused by slow server response or consequetive calls to startDownload() before stopDownload() Promise resolves
    if (locked) {
      console.error('startDownload() failed. Previous download not yet initialized');
      return;
    }

    locked = true;
    stopDownload()
    .then(function() {
      locked = false;

      progress.style.transform=`scaleX(0)`;
      progress.offsetWidth; /* prevent animation when set to zero */
      started = false;
      pct = 0;

      loader.classList.add('loading');
      loader.classList.remove('loading-complete');


      if (!progressFetcher) {
        progressFetcher = new ProgressReportFetcher(updateDownloadProgress);
      }

      console.log('Starting download...');
      progressFetcher.fetch('https://fetch-progress.anthum.com/30kbps/images/sunrise-baseline.jpg')
      .then(response => response.blob())
      .then(blob => URL.createObjectURL(blob))
      .then(url => downloadDone(url))
      .catch(error => showError(error))
    });
  }

  function stopDownload() {
    // stop previous download
    if (progressFetcher) {
      return progressFetcher.cancel()
    } else {
      // no previous download to cancel
      return Promise.resolve();
    }
  }

  function showError(error) {
    console.error(error);
    loader.classList.remove('loading');
    loader.classList.remove('loading-complete');
    loader.classList.remove('loading-error');
    errorMsg.offsetWidth; // pre-animation enabler
    errorMsg.innerHTML = 'ERROR: '+ error.message;
    loader.classList.add('loading-error');
  }

  function updateDownloadProgress({loaded, total}) {
    if (!started) {
      loader.classList.add('loading');
      started = true;
    }
    
    // handle divide-by-zero edge case when Content-Length=0
    pct = total? loaded/total : 1;

    progress.style.transform=`scaleX(${pct})`;
    // console.log('downloaded', Math.round(pct*100)+'%')
    if (loaded === total) {
      console.log('download complete')
    }
  }

  return {
    startDownload,
    stopDownload
  }
})()


imageLoader.startDownload();
