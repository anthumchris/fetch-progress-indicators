'use strict'

const elProgress = document.getElementById('progress');
const elStatus = document.getElementById('status');

const status = (text) => {
  elStatus.innerHTML = text;
}

const progress = ({loaded, total}) => {
  elProgress.innerHTML = (loaded / total * 100.0).toFixed(2) + '%';
}

const isResponseOk = (response) => {
  if (!response.ok) throw new Error(response.status + ' ' + response.statusText);
  return response;
}
const isStreamSupported = (response) => {
  if (!response.body) throw new Error('ReadableStream not yet supported in this browser.');
  return response;
}
const getBlob = (response) => response.blob();

status('downloading with fetch()...');

fetch('https://fetch-progress.anthum.com/20kbps/images/sunrise-baseline.jpg')
  .then(isResponseOk)
  .then(isStreamSupported)
  .then(responseProgressHelper(progress))
  .then(getBlob)
  .then(data => {
    status('download completed')
    document.getElementById('img').src = URL.createObjectURL(data);
  })
  .catch(error => {
    console.error(error);
    status(error);
  });

