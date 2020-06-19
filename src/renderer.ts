// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

document.addEventListener('drop', (e) => {
    console.log('test message');
    e.preventDefault();
    e.stopPropagation();

    for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const f = e.dataTransfer.files[i] as any;
        console.log('File(s) you dragged here: ', f.path)
    }
});
/* document.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
}); */
