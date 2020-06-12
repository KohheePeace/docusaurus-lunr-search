const path = require('path');
const fs = require('fs');
const lunr = require('lunr');

/**
 * Based on code from https://github.com/cmfcmf/docusaurus-search-local/
 * by Christian Flach, licensed under the MIT license.
 */
function generateLunrClientJS(language = "en") {
    if (Array.isArray(language) && language.length === 1) {
        language = language[0];
    }
    let lunrClient =
        "// THIS FILE IS AUTOGENERATED\n" +
        "// DO NOT EDIT THIS FILE!\n\n" +
        'import * as lunr from "lunr";\n';

    if (language !== "en") {
        require("lunr-languages/lunr.stemmer.support")(lunr);
        lunrClient += 'require("lunr-languages/lunr.stemmer.support")(lunr);\n';
        if (Array.isArray(language)) {
            language
                .filter(code => code !== "en")
                .forEach(code => {
                    require(`lunr-languages/lunr.${code}`)(lunr);
                    lunrClient += `require("lunr-languages/lunr.${code}")(lunr);\n`;
                });
            require("lunr-languages/lunr.multi")(lunr);
            lunrClient += `require("lunr-languages/lunr.multi")(lunr);\n`;
        } else {
            require(`lunr-languages/lunr.${language}`)(lunr);
            lunrClient += `require("lunr-languages/lunr.${language}")(lunr);\n`;
        }
    }
    lunrClient += `export default lunr;\n`;

    const lunrClientPath = path.join(__dirname, "lunr.client.js");
    fs.writeFileSync(lunrClientPath, lunrClient);

    if (language !== "en") {
        if (Array.isArray(language)) {
            return lunr.multiLanguage(...language);
        } else {
            return lunr[language];
        }
    }
    return null;
}

function getFilePaths(routesPaths, outDir, baseUrl) {
    const files = []
    const isExcludedRoute =
      /\/docs\/ja\//.test(route) ||
      /\/docs\/the-complete-webdev-with-rails-2020\//.test(route) ||
      /\/docs\/crud2a-react-react-router\//.test(route);

    routesPaths.forEach((route) => {
        if (route === baseUrl || route === `${baseUrl}404.html` || isExcludedRoute) return;
        route = route.substr(baseUrl.length);
        files.push({
            path: path.join(outDir, route, "index.html"),
            url: route,
        });
    });
    return files;
}

module.exports = {
    generateLunrClientJS,
    getFilePaths
}
