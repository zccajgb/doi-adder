const axios = require('axios');
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

const convertToBib = (citationInfo, refName) => {
  console.log('converToBib');
  citationInfo = citationInfo.replace(/@article{.*?,/, `@article{${refName},`);

  return citationInfo;
}

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

module.exports = { getCitationInfo, convertToBib, saveBibEntry };