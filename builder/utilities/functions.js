// Función recursiva para copiar carpetas
import fs from 'fs';
import path from 'path';

import { pages } from './pages.js';

const extensionSitemap = 'xml';
let root = null;
let document = null;
let distDir = null;

const data = {
  url: '',
  adsenseAccount: ''
}

export const throwError = (error) => {
  console.error(error);
  process.exit(1);
}

export const setAppContext = (doc, htmlRoot, dir) => {
  document = doc;
  root = htmlRoot;
  distDir = dir;
  data.url = root.querySelector('meta[property="og:url"]').getAttribute('content');
  data.adsenseAccount = root.querySelector('meta[name="google-adsense-account"]')?.getAttribute('content') ?? '';
}

export const copyRecursiveSync = (src, dest) => {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const items = fs.readdirSync(src);
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      copyRecursiveSync(srcPath, destPath);
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

const getOffsetFromISOString = (isoString) => {
  const date = new Date(isoString);
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, '0');

  const hours = pad(offsetMinutes / 60);
  const minutes = pad(offsetMinutes % 60);

  return `${isoString}${sign}${hours}:${minutes}`;
  // console.log(getOffsetFromISOString("2025-05-25T19:44:06")); // -> "+02:00" en horario de verano español
}

export const setAttributeForTags = (tagName, attribute, value) => {
  const elements = root.getElementsByTagName(tagName);
  for (const el of elements) {
    el.setAttribute(attribute, value);
  }
}

const unwrapTag = (tagName) => {
  root.querySelectorAll(tagName).forEach(el => {
    const fragment = document.createDocumentFragment();
    while (el.firstChild) {
      fragment.appendChild(el.firstChild);
    }
    el.replaceWith(fragment);
  });
}

const clearName = (name) => name.replaceAll(' ', '-').toLowerCase();

const createFile = (content, ...paths) => {
  let i = 0;
  for (let p of paths) {
    paths[i] = clearName(p)
    i++;
  }
  content = content.replaceAll(`\$ACTUAL_PATH`, paths.length ? paths[0] : '');
  const outputPath = path.join(distDir, ...paths);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, 'utf-8');
}

const clearVars = () => {
  const vars = root.querySelector('app-vars')?.getElementsByTagName('app-var') ?? [];
  for (let htmlVar of vars) {
    const name = htmlVar.getAttribute('name')?.toUpperCase();
    const value = htmlVar.getAttribute('value');
    if (name === 'URL') {
      data.url = value;
    }
    if (!name || value === null) continue;
    root.innerHTML = root.innerHTML.replaceAll(`\$${name}`, value);
  }
}

const clearSectionsTemplates = (appName) => {
  const sectionTemplates = root.querySelector('app-section-templates');
  const dataProject = pages.projects[appName].groupSections;
  const sectionTemplate = sectionTemplates.querySelector('app-section-template').innerHTML;
  const subsectionTemplate = sectionTemplates.querySelector('app-subsection-template').innerHTML;
  let htmlFinal = '';
  const clearVars = (data, template, functions) => {
    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((acc, key) => {
        return acc && acc[key] !== undefined ? acc[key] : '';
      }, obj);
    };
    return template.replace(/%([\w.]+)%/g, (_, keyPath) => {
      let value = getNestedValue(data, keyPath);
      value = functions[keyPath] ? functions[keyPath](value) : value;
      return typeof value === 'string' || typeof value === 'number' ? value : '';
    });
  }
  for (let groupSection of dataProject) {
    const { name } = groupSection;
    for (let section of groupSection.sections) {
      const { data, subsections } = section;
      let html = clearVars({...data, sectionGroupName: name}, sectionTemplate, groupSection.render?.sections ?? {});
      let htmlSubsections = '';
      for (let subsection of subsections) {
        const {data} = subsection;
        const htmlSubsection = clearVars(data, subsectionTemplate, groupSection.render?.subsections ?? {});
        htmlSubsections += htmlSubsection;
      }
      html = html.replace('<app-subsections></app-subsections>',htmlSubsections);
      htmlFinal += html;
    }
  }
  sectionTemplates.innerHTML = htmlFinal;
  unwrapTag('app-section-templates');
}

const clearTemplates = () => {
  const templates = root.querySelector('app-templates')?.getElementsByTagName('app-template') ?? [];
  const useTemplates = root.getElementsByTagName('app-use-template');
  for (let useTemplate of useTemplates) {
    const useRefTemplate = useTemplate.getAttribute('name');
    for (let template of templates) {
      const refTemplate = template.getAttribute('name');
      if (refTemplate === useRefTemplate) {
        let finalTemplate = template.innerHTML;
        const children = useTemplate.innerHTML;
        for (let key of Object.keys(template.dataset)) {
          const value = useTemplate.dataset[key] ?? template.dataset[key];
          finalTemplate = finalTemplate.replaceAll(`\$\{${key}\}`, value)
        }
        useTemplate.innerHTML = finalTemplate;
        useTemplate.innerHTML = finalTemplate.replaceAll('<app-children></app-children>', children);
        break;
      }
    }
  }
  unwrapTag('app-use-template');
}

const clearForEachSections = () => {
  const forEachSections = root.getElementsByTagName('app-forEach-section');
  for (let forEachSection of forEachSections) {
    let htmlSection = '';
    let sectionGroup = forEachSection.getAttribute('sectionGroup');
    const sections = root.getElementsByTagName('app-section');
    for (let section of sections) {
      const parent = section.parentElement;
      if (!section.getAttribute('sectionGroup') && parent?.tagName.toLowerCase() === 'app-section-group') {
        section.setAttribute('sectionGroup', parent?.getAttribute('name'))
      }
      if (sectionGroup && sectionGroup !== section.getAttribute('sectionGroup')) continue;
      let html = forEachSection.innerHTML;
      const nameSection = section.getAttribute('name');
      const pathSection = clearName(nameSection);
      const values = {
        name: nameSection, path: pathSection,
        ...section.dataset
      }
      for (const key in values) {
        html = html.replaceAll(`\$\{section.${key}\}`, values[key])
      }
      htmlSection += html;
    }
    forEachSection.innerHTML = htmlSection;
  }
}

const clearForEachSubsections = () => {
  const forEachSubsections = root.getElementsByTagName('app-forEach-subsection');
  for (let forEachSubsection of forEachSubsections) {
    const isFeatured = forEachSubsection.getAttribute('featured') !== null;
    const limit = Number(forEachSubsection.getAttribute('limit') ?? 100);
    let html = '';
    let forEachSubsectionName = forEachSubsection.getAttribute('section');
    if (!forEachSubsectionName) {
      let parent = forEachSubsection.parentElement;
      while (parent && parent.tagName.toLowerCase() !== 'app-section') {
        parent = parent.parentElement;
      }
      if (parent) forEachSubsectionName = parent.getAttribute('name');
    }
    const sections = root.getElementsByTagName('app-section');
    let limitCount = 0;
    for (let section of sections) {
      const sectionName = section.getAttribute('name');
      const pathSection = clearName(sectionName);
      if (isFeatured || (sectionName === forEachSubsectionName)) {
        const subsections = (isFeatured ? root : section).getElementsByTagName('app-subsection');
        for (let subsection of subsections) {
          const subsectionIsFeatured = subsection.getAttribute('featured') !== null;
          let htmlSubsection = forEachSubsection.innerHTML;
          const nameSubsection = subsection.getAttribute('name');
          const pathSubsection = clearName(nameSubsection);
          const values = {
            name: nameSubsection, path: [pathSection, pathSubsection].join('/'),
            ...subsection.dataset
          }
          for (const key in values) {
            htmlSubsection = htmlSubsection.replaceAll(`\$\{subsection.${key}\}`, values[key])
          }
          if (!isFeatured || (subsectionIsFeatured && limitCount < limit)) {
            html += htmlSubsection;
            limitCount++;
          }
        }
        break;
      }
    }
    forEachSubsection.innerHTML = html;
  }
  unwrapTag('app-foreach-subsection');
}




const getHead = (section, headTag, sectionPath = '') => {
  let headerData = {};
  const appHead = root.querySelector('app-head');
  const sectionHead = section?.querySelector(headTag);
  let htmlHead = appHead?.innerHTML ?? '';
  for (let key of Object.keys(appHead.dataset)) {
    const appHeadValue = appHead.dataset[key]
    const sectionValue = sectionHead?.dataset[key] ?? null;
    htmlHead = htmlHead.replaceAll(`\$\{${key}\}`, sectionValue ?? appHeadValue);
  }
  return `
<!DOCTYPE html>
    <html lang="es">

    <head>
      ${htmlHead}
      ${sectionHead?.innerHTML ?? ''}
    </head>`;
}

const getPrincipalWrapper = (content) => {
  const appBody = root.querySelector('app-body');
  const appRoot = appBody.querySelector('app-root');
  const layout = appRoot.querySelector('app-layout');
  const appHeader = appRoot.querySelector('app-header')?.innerHTML ?? '';
  const appFooter = appRoot.querySelector('app-footer')?.innerHTML ?? '';

  const bodyAttributes = [...appBody.attributes]
    .map(attr => `${attr.name}="${attr.value}"`)
    .join(' ');

  let htmlLayout = layout?.innerHTML;

  if (htmlLayout) {
    htmlLayout = htmlLayout.replace('<app-children></app-children>', content)
  }

  return `<body ${bodyAttributes}>${appHeader}${htmlLayout ? htmlLayout : content}${appFooter}</body>`;

}

const generateIndex = () => {
  const appBody = root.querySelector('app-body');
  const appRoot = appBody.querySelector('app-root');
  const appIndex = appRoot.querySelector('app-index')?.innerHTML ?? '';
  createFile(getHead(null) + getPrincipalWrapper(appIndex), 'index.html');
}

const generatePages = () => {
  generateIndex();
  const sections = root.getElementsByTagName('app-section');
  for (let section of sections) {
    const nameSection = section.getAttribute('name');
    const sectionPath = clearName(nameSection);
    const subSections = section.getElementsByTagName('app-subsection');
    const sectionheader = section.querySelector('app-section-header')?.innerHTML ?? '';
    const sectionFooter = section.querySelector('app-section-footer')?.innerHTML ?? '';
    const sectionIndex = section.querySelector('app-section-index')?.innerHTML ?? '';
    const sectionLayout = section.querySelector('app-section-layout')?.innerHTML ?? '';
    for (let subSection of subSections) {
      const nameSubSection = subSection.getAttribute('name');
      const subSectionPath = clearName([nameSection, nameSubSection].join('/'));
      const htmlHeader = getHead(subSection, 'app-subsection-head', subSectionPath);
      let htmlSubSection = subSection.querySelector('app-subsection-body').innerHTML;
      if (sectionLayout) {
        htmlSubSection = sectionLayout.replace('<app-children></app-children>', htmlSubSection);
      }
      const htmlFinal = getPrincipalWrapper(sectionheader + htmlSubSection + sectionFooter);
      createFile(htmlHeader + htmlFinal, subSectionPath, 'index.html');
    }
    const htmlHeader = getHead(section, 'app-section-head', sectionPath);
    const htmlFinal = getPrincipalWrapper(sectionheader + sectionIndex + sectionFooter);
    createFile(htmlHeader + htmlFinal, sectionPath, 'index.html');
  }
}

const generateRobots = () => {
  createFile(`User-agent: *
Disallow:

Sitemap: ${data.url}/sitemap_index.${extensionSitemap}`, 'robots.txt');
}

const generateSitemaps = () => {
  const sections = root.getElementsByTagName('app-section');
  let sitemapindex = '';
  for (let section of sections) {
    const nameSection = clearName(section.getAttribute('name'));
    const lastmod = getOffsetFromISOString(section.getAttribute('lastmod'));
    sitemapindex += `
  <sitemap>
    <loc>${data.url}/${nameSection}/sitemap.${extensionSitemap}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
`;
    const getSitemapDataImgFromSection = (element) => {
      const imgs = element.getElementsByTagName('img');
      const seenSrcs = new Set();
      let dataImg = '';

      for (let img of imgs) {
        const src = img.getAttribute('src');
        if (src && !seenSrcs.has(src)) {
          seenSrcs.add(src);
          dataImg +=
            `\n <image:image>
   <image:loc>${src}</image:loc>
 </image:image>`;
        }
      }

      return dataImg;
    };
    const subsections = section.getElementsByTagName('app-subsection');
    let sitemapSection = '';
    sitemapSection += `<url>
    <loc>${data.url}/${nameSection}/</loc>`;
    sitemapSection += getSitemapDataImgFromSection(section.querySelector('app-section-index'));
    sitemapSection += '</url>';
    for (let subsection of subsections) {
      const nameSubsection = clearName(subsection.getAttribute('name'));
      sitemapSection += `<url>
    <loc>${data.url}/${nameSection}/${nameSubsection}/</loc>`;
      sitemapSection += getSitemapDataImgFromSection(subsection.querySelector('app-subsection-body'));
      sitemapSection += '</url>';
    }
    createFile(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${sitemapSection}
</urlset>`,
      `${nameSection}/sitemap.${extensionSitemap}`);
  }
  createFile(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapindex}</sitemapindex>`,
    `sitemap_index.${extensionSitemap}`);
}

const generateAds = () => {
  createFile(`google.com, ${data.adsenseAccount}, DIRECT, f08c47fec0942fa0`, 'ads.txt');
}

const generateSEOFiles = () => {
  generateRobots();
  generateSitemaps();
  generateAds();
}

export const generateDist = (appName) => {
  setAttributeForTags('img', 'loading', 'lazy');
  clearVars();
  clearSectionsTemplates(appName);
  clearTemplates();
  clearForEachSections();
  clearForEachSubsections();
  unwrapTag('app-forEach-section');
  generatePages();
  generateSEOFiles();
}