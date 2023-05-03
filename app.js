const pdfjsLib = require('pdfjs-dist');

// not required but allows using pdfjs from dev console if needed.
window.pdfjsLib = pdfjsLib;

// embed pdf in js
// you can change this to any pdf that is in the root of this directory
// ccew.pdf for example will work too.
const pdfPath = new URL('ccew.pdf', import.meta.url);

// setting worker path to worker bundle.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdf.worker.js', import.meta.url);

const annotationLayer = document.getElementById('annotations');
const previewButton = document.getElementById('previewBtn')

previewButton.addEventListener('click', async (event) => {
  // get rendered pdf + form inputs from window
  const data = await window.render.saveDocument();

  // loads pdf from bytes retrieved from saveDocument()
  const loadingTask = pdfjsLib.getDocument(data);
  const pdfDocument = await loadingTask.promise;

  const pdfPage = await pdfDocument.getPage(1);

  const viewport = pdfPage.getViewport({ scale: 1.5});
  const canvas = document.getElementById("preview");

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext("2d");

  // render pdf with filled out form attributes
  await pdfPage.render({
        canvasContext: ctx,
        viewport,
        includeAnnotationStorage: true,
  }).promise;
});

(async () => {
  // Loading a document. and store in window for later reference
  const loadingTask = pdfjsLib.getDocument(pdfPath);
  window.render = await loadingTask.promise;

  // for multi page PDF you will need to grab all available pages
  // and call pdfPage.render for each and every page
  const pdfPage = await render.getPage(1);

  const viewport = pdfPage.getViewport({ scale: 1.5});
  const vw = viewport.clone({ dontFlip: true });
  const canvas = document.getElementById("render");

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext("2d");

  const parameters = {
    div: annotationLayer,
    page:pdfPage,
    renderInteractiveForms: true,
    viewport: vw,
    // required to make sure that no new instance per input has it's own storage
    annotationStorage: render.annotationStorage
  };

  await pdfPage.render({
        canvasContext: ctx,
        viewport,
        // required for displaying form inputs and storing form inputs into storage
        // when calling saveDocument()
        renderInteractiveForms: true,
        includeAnnotationStorage: true
  }).promise;

  const annotations = await pdfPage.getAnnotations();

  // normalize font size for display. otherwise its mixed between 9px and 12px
  parameters['annotations'] = annotations.map(annotation => {
    annotation.defaultAppearanceData.fontSize = 9;
    return annotation;
  });

  pdfjsLib.AnnotationLayer.render(parameters);
})();
