if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw-fetch-progress.js');
  navigator.serviceWorker.addEventListener('message', event => {
    ProgressBar.evalProgress(event.data)
  })
}

