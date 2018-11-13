
const responseProgressHelper = (onProgress) => (response) => {
  const contentLength = response.headers.get('content-length');
  if (!contentLength) throw new Error('Content-Length response header unavailable');

  const total = parseInt(contentLength, 10);
  let loaded = 0;

  return new Response(
    new ReadableStream({
      start(controller) {
        const reader = response.body.getReader();

        return read();
        function read() {
          return reader.read()
          .then(({done, value}) => {
            if (done) {
              controller.close();
              return;
            }
            loaded += value.byteLength;
            onProgress({loaded, total})
            controller.enqueue(value);
            return read();
          }).catch(error => {
            console.error(error);
            controller.error(error)
          })
        }
      }
    })
  );
}

