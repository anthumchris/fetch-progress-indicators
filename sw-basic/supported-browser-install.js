navigator.serviceWorker.register('sw-simple.js')
.then(reg => {
  if (reg.installing) {
    const sw = reg.installing || reg.waiting;
    sw.onstatechange = function() {
      if (sw.state === 'installed') {
        onward();
      }
    };
  } else if (reg.active) {
    // something's not right or SW is bypassed.  previously-installed SW should have redirected this request to different page
    status('<p>Service Worker is installed and not functioning as intended.<p>Please contact developer.')
  }
})
.catch(error => status(error))


// SW installed.  Refresh page so SW can respond with SW-enabled page.
function onward() {
  setTimeout(function() {
    window.location.reload();
  },2000);
}
