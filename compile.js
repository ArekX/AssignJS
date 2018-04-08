const fs = require('fs');
const path = require('path');

module.exports = compileList;

function compileList(startImportFile, startImportDir) {
    const importList = {};
    const finalList = [];

    startImportDir = startImportDir || 'src';

    if (startImportFile.indexOf('.js') === -1) {
        startImportFile = path.join(startImportFile, 'index.js');
    }

    process(startImportFile, null, []);
    compileImportList(startImportFile);

    return finalList.map(e => path.join(startImportDir, e));

    function process(baseFile, fromFile, fileStack) {
        let importFullPath = path.join(__dirname, startImportDir, baseFile);

        if (!fs.existsSync(importFullPath)) {
            throw `Import file '${baseFile}' doesn't exists, please check imports${fromFile ? ` in '${fromFile}'` : ''}`;
        }

        const code = fs.readFileSync(importFullPath, 'utf8');

        importFiles = code
            .split(/\/\/\s*(\@import\:\s*.+?)\r?\n/)
            .filter((e) => e.indexOf('@import') !== -1)
            .map((e) => {
                e = e.replace('// ', '')
                     .replace('@import:', '')
                     .trim();
                return e.indexOf('.js') === -1 ? path.join(e, 'index.js') : e;
            });

        importList[baseFile] = importFiles;

        if (fileStack.indexOf(baseFile) !== -1) {
            throw `Circular dependency detected! Please check your import paths: ${fileStack.join(" -> ")}`;
        }

        fileStack.push(baseFile);

        for(let importFile of importFiles) {
            process(importFile, baseFile, fileStack);
        }

        fileStack.pop();
    }

    function compileImportList(itemName) {
        if (finalList.indexOf(itemName) == -1) {
            finalList.push(itemName);
        }

        const mainItemPos = finalList.indexOf(itemName);

        for(let i = importList[itemName].length - 1; i > -1; i--) {
            let item = importList[itemName][i];

            const itemIndex = finalList.indexOf(item);

            if (itemIndex === -1) {
                finalList.splice(mainItemPos, 0, item);
            } else if (itemIndex > mainItemPos) {
                moveItem(finalList, itemIndex, mainItemPos);
            }

            compileImportList(item);
        }
    }

    function moveItem(array, from, to) {
        array.splice(to, 0, array.splice(from, 1)[0]);
    }
}