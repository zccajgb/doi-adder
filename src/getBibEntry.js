const axios = require('axios');
const jquery = require('jquery');
const fs = require('fs');
const vscode = require('vscode');
const { join } = require('path');
const { JSDOM } = require('jsdom');
const { fileURLToPath } = require('url');
const validUrl = require('valid-url');

const  getCitationInfo = async (doi) => {
  let url = doi;
  if (!validUrl.isUri(doi)) url = `http://dx.doi.org/${doi}`
  const resp = await axios.get(url);

  const { window } = new JSDOM(resp.data);
  const $ = jquery(window);

  const citation_info = [];
  if (!$('meta[name^=citation]').length) throw 'URL does not contain a citation';

  $('meta[name^=citation]').each((_, el) => {
    citation_info.push({ name: el.name.replace('citation_', ''), content: el.content });
  });

  if (!$('meta[property="og:type"]').length) throw 'Type of document not defined, unable to add';
  const type = $('meta[property="og:type"]')[0].content;
  citation_info.push({ name: 'type', content: type});
  return citation_info;
};

const convertToBib = (citationInfo) => {

  const authInfo = { name: 'author', content: citationInfo.filter(info => info.name === 'author').map(info => info.content).join(', ') };
  citationInfo = citationInfo.filter(info => info.name !== 'author');
  citationInfo.push(authInfo);
  const bibList = citationInfo.filter(info => info.name !== 'type').map((info) => {
    info = modifyInfo(info);
    return `${info.name}= "${info.content}"`
  }).filter(info => !info.includes('skip'));

  const type = citationInfo.find(info => info.name === 'type').content;
  const doi = citationInfo.find(info => info.name === 'doi').content;

  return `\n@${type}{${doi},\n${bibList.join(',\n')},\n}\n`
}

const saveBibEntry = (bib, filepath) => {
  let fullPath = join(vscode.workspace.workspaceFolders[0].uri.fsPath, filepath)
  fs.appendFile(fullPath, bib, 'utf-8', (err) => {
    if (err) console.log(err);
  });
}

const modifyInfo = (info) => {
  // TODO test with other journals and see if more info needed
  if (info.name === "author_institution") info.name = "skip";
  if (info.name === "journal_title") info.name = "journal";
  if (info.name === "journal_abbrev") info.name = "skip";
  if (info.name === "pdf_url") info.name = "skip";
  if (info.name === "fulltext_world_readable") info.name = "skip";
  if (info.name === "firstpage") info.name = "pages";
  if (info.name === "date") {
    info.name = "year";
    info.content = new Date(info.content).getFullYear();
  }
  return info;
}

module.exports = { getCitationInfo, convertToBib, saveBibEntry };