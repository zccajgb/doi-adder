const axios = require('axios');
const bibtex = require('bibtex');
const jquery = require('jquery');
const fs = require('fs');
const vscode = require('vscode');
const { join } = require('path');
const { JSDOM } = require('jsdom');
const validUrl = require('valid-url');
const open = require('open');

const  getCitationInfo = async (doi) => {
  let url = doi;
  if (!validUrl.isUri(doi)) {
    url = `http://dx.doi.org/${doi}`;
  }
  let headers = {'Accept': 'application/x-bibtex'};
  let resp = await axios.get(url, { headers: headers });

   if (!resp.data) {
    throw 'URL does not contain a citation';
  }

  return resp.data;
};

const genRefName = (doi, citationInfo) => {
  const config = vscode.workspace.getConfiguration('doi-adder');
  let refName;
  if (config.get('refName') == "authorYear") {
    const bibEntry = Object.values(bibtex.parseBibFile(citationInfo).entries$)[0];
    const firstAuthor = Object.values(bibEntry.getField("author").authors$)[0];
    const authorName = firstAuthor.vons.concat(firstAuthor.lastNames).join('').toLowerCase();
    const year = bibEntry.getField("year");
    refName = authorName + year;
  } else if (config.get('refName') == "doi") {
    refName = doi.toLowerCase();
  } else {
    console.log(`unknown value doi-adder.refName=${config.get('refName')}`);
  }
  return refName;
};

const convertToBib = (doi, citationInfo) => {
  const refName = genRefName(doi, citationInfo);
  if (refName !== undefined) {
    citationInfo = citationInfo.replace(/(@[a-zA-Z]+{).*?,/, `$1${refName},`);
  }
  if (citationInfo.includes("$\\less$")) {
    citationInfo = citationInfo.replaceAll(/(\$\\less(.*?)\$\\greater\$)/g, '');
  }
  citationInfo += '\n';

  return citationInfo;
};

const convertToBibSnippet = (doi, citationInfo) => {
  const refName = genRefName(doi, citationInfo) + '$$1'
  if (refName !== undefined) {
    citationInfo = citationInfo.replace(/(@[a-zA-Z]+{).*?,/, `$1${refName},`);
  }
  citationInfo += '\n';
  console.log(citationInfo);
  return new vscode.SnippetString(citationInfo);
};

const saveBibEntry = (bib, filepath, doi) => {
  let fullPath = join(vscode.workspace.workspaceFolders[0].uri.fsPath, filepath)

  return new Promise((resolve, reject) => {
    fs.readFile(fullPath, { encoding: 'utf-8' }, (err, data) => {
      if (err) reject(err);
      if (data.includes(doi)) {
        reject("Entry with DOI already exists in bib file");
      }
      fs.appendFile(fullPath, bib, 'utf-8', (err) => {
        if (err) reject(err);
      });
      resolve();
    });
  })
}

module.exports = { getCitationInfo, convertToBib, convertToBibSnippet, saveBibEntry };
