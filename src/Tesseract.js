const {createWorker}  = require('tesseract.js')
const PSM = require('tesseract.js/src/constants/PSM')

async function getText (lang, image) {
    const worker = createWorker({
        logger: m => console.log(m)
    });

    await worker.load();
    await worker.loadLanguage(lang);
    await worker.initialize(lang);
    await worker.setParameters({
        tessedit_pageseg_mode: PSM.AUTO
    })

    const { data: { text } } = await worker.recognize(image);

    await worker.terminate();

    return text
}

module.exports = getText