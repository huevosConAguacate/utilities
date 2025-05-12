// Función recursiva para copiar carpetas
import fs from 'fs';
import path from 'path';

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
  data.url = root.querySelector('meta[property="url"]').getAttribute('content');
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
  const outputPath = path.join(distDir, ...paths);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, 'utf-8');
}

const clearTemplates = () => {
  const templates = root.querySelector("app-templates").getElementsByTagName("app-template");
  const useTemplates = root.getElementsByTagName("app-use-template");
  for (let useTemplate of useTemplates) {
    const useRefTemplate = useTemplate.getAttribute("ref");
    for (let template of templates) {
      const refTemplate = template.getAttribute("ref");
      if (refTemplate === useRefTemplate) {
        let finalTemplate = template.innerHTML;
        const children = useTemplate.innerHTML;
        for (let key of Object.keys(template.dataset)) {
          const value = useTemplate.getAttribute(key);
          finalTemplate = finalTemplate.replaceAll(`\$\{${key}\}`, value)
        }
        useTemplate.innerHTML = finalTemplate;
        useTemplate.innerHTML = finalTemplate.replaceAll("<children></children>", children);
        break;
      }
    }
  }
  unwrapTag("app-use-template");
}

const clearForEachSections = () => {
  const forEachSections = root.getElementsByTagName('app-forEach-section');
  for (let forEachSection of forEachSections) {
    let htmlSection = '';
    const sections = root.getElementsByTagName("app-section");
    for (let section of sections) {
      let html = forEachSection.innerHTML;
      const nameSection = section.getAttribute("name");
      const pathSection = clearName(nameSection);
      const values = {
         nameSection, pathSection,
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

const getHead = (section, headTag = 'app-head', sectionPath = '') => {
  let headerData = {};
  const getHeaderData = (element) => {
    const appHead = element.querySelector(headTag);
    if (!appHead) return;
    const tagsToAdd = [
      {
        'selector': 'title',
        'data': `
        <title>$VALUE</title>
        <meta property="og:title" content="$VALUE">
        <meta name="twitter:title" content="$VALUE">
        <meta property="og:site_name" content="$VALUE">
      `
      },
      'link[rel="icon"]',
      'meta[name="google-adsense-account"]',
      'meta[name="google-site-verification"]',
      'meta[name="author"]',
      'meta[property="article:author"]',
      {
        'selector': 'meta[name="description"]',
        'data': `
        <meta name="description"
        content="$VALUE">
        <meta property="og:description" content="$VALUE">
        <meta name="twitter:description" content="$VALUE">
      `
      },
      {
        'selector': 'meta[property="published_time"]',
        'data': `
        <meta property="article:published_time" content="$VALUE">`
      },
      {
        'selector': 'meta[property="updated_time"]',
        'data': `
        <meta property="article:modified_time" content="$VALUE">
        <meta property="og:updated_time" content="$VALUE">`
      },
      {
        'selector': 'meta[property="url"]',
        'data': `
        <link rel="canonical" href="$VALUE">`
      }
    ];
    for (const tag of tagsToAdd) {
      if (typeof tag === "string") {
        const el = appHead.querySelector(tag);
        if (el) headerData[tag] = el.outerHTML;
      } else if (typeof tag === "object" && tag.selector && tag.data) {
        const el = appHead.querySelector(tag.selector);
        if (el) {
          const value = tag.selector === 'title' ? el.innerHTML : el.getAttribute(tag.attribute ?? 'content');
          if (value) {
            headerData[tag.selector] = tag.data.replaceAll(/\$VALUE/g, value);
          }
        }
      }
    }
    const imageMeta = appHead.querySelector('meta[property="image"]');
    if (imageMeta) {
      const url = imageMeta.getAttribute('content');
      const width = imageMeta.getAttribute('width');
      const height = imageMeta.getAttribute('height');
      headerData['og:image'] = `<meta property="og:image" content="${url}">`;
      headerData['og:image:width'] = `<meta property="og:image:width" content="${width}">`;
      headerData['og:image:height'] = `<meta property="og:image:height" content="${height}">`;
      headerData['twitter:image'] = `<meta name="twitter:image" content="${url}">`;
    }
  }
  getHeaderData(root);
  if (section) getHeaderData(section);
  let strHeaderData = '';
  for (const key of Object.keys(headerData)) {
    strHeaderData += `${headerData[key]}\n`;
  }
  const htmlHeader = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="language" content="es">
      <meta property="og:locale" content="es_ES">
      <meta property="og:image:type" content="image/webp">
      <meta name="twitter:card" content="summary_large_image">
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
      <meta property="og:type" content="article">
      <meta property="og:url" content="${data.url}/${sectionPath}">
      ${strHeaderData}
      <!-- 📘 Datos estructurados -->
      <script type="application/ld+json">
          [
            {
              "@context": "http://schema.org",
              "@type": "Article",
              "headline": "Capítulo 1: La Semilla Susurrante",
              "image": "https://huevosconaguacate.github.io/gardenOfSilentEchoes/img/nino-con-semilla-brillante.webp",
              "articleBody": "En el valle donde los vientos contaban historias y las montañas escuchaban en silencio, vivía un niño llamado Elian. Era conocido por su corazón inquieto y sus oídos sordos a las sutilezas del mundo. Un día, mientras jugaba cerca del Bosque de los Ecos, encontró una semilla que brillaba con una luz tenue. Al acercarla a su oído, creyó escuchar un susurro apenas audible, una melodía suave que parecía emanar de su interior. Intrigado, Elian guardó la semilla, sin comprender el mensaje que intentaba transmitir. Pasaron los días y Elian olvidó la semilla en un rincón de su cabaña. Se dedicó a sus juegos ruidosos y a sus carreras veloces, sin prestar atención a los murmullos del viento ni al canto distante de los pájaros. La semilla permaneció en silencio, esperando el momento adecuado para despertar la atención del niño."
            },
            {
              "@context": "http://schema.org",
              "@type": "Article",
              "headline": "Capítulo 2: El Jardín Olvidado",
              "image": "https://huevosconaguacate.github.io/gardenOfSilentEchoes/img/jardin-escondido-silencioso.webp",
              "articleBody": "Un anciano del pueblo, conocido por su sabiduría silenciosa, notó la agitación interior de Elian. Con una mirada amable, le habló del Jardín de los Ecos Silenciosos, un lugar escondido donde las plantas crecían escuchando los secretos del corazón. Le contó que cada semilla contenía una melodía única, y solo aquellos que aprendían a escuchar el silencio podían hacerla florecer. Elian, movido por la curiosidad, buscó el jardín. Lo encontró oculto tras una cortina de enredaderas, un lugar de una quietud asombrosa. Las flores se mecían suavemente, como si danzaran al ritmo de una música invisible. En el centro, vio un pequeño espacio de tierra removida, esperando ser cultivado. Recordó la semilla brillante que había olvidado. Con cuidado, Elian plantó la semilla en el jardín. Se sentó en silencio, intentando escuchar algo más allá del murmullo de sus propios pensamientos. Al principio, solo oyó el latido de su propio corazón, pero poco a poco, una suave melodía comenzó a emerger de la tierra."
            },
            {
              "@context": "http://schema.org",
              "@type": "Article",
              "headline": "Capítulo 3: La Flor de la Escucha",
              "image": "https://huevosconaguacate.github.io/gardenOfSilentEchoes/img/flor-unica-floreciendo-en-silencio.webp",
              "articleBody": "De la tierra brotó un tallo delgado que se elevó lentamente, y en su extremo floreció una flor de colores nunca vistos, cuyas hojas vibraban con una melodía suave y constante. Elian se acercó y escuchó con atención. La flor cantaba historias de paciencia, de la belleza que se revela en la quietud y de la importancia de escuchar no solo con los oídos, sino con el corazón. Desde ese día, Elian ya no fue el mismo. Aprendió a apreciar los susurros del viento, el canto de los pájaros y el silencio elocuente de la naturaleza. Comprendió que el verdadero valor no reside en el ruido y la prisa, sino en la capacidad de detenerse, escuchar y sentir las melodías sutiles que el mundo ofrece constantemente. La flor del Jardín de los Ecos Silenciosos se convirtió en un recordatorio constante de que las respuestas más importantes a menudo se encuentran en los murmullos silenciosos de nuestro propio corazón y en la внимательность hacia el mundo que nos rodea. La verdadera sabiduría florece cuando aprendemos a escuchar el eco silencioso de nuestras propias emociones y las de los demás."
            }
          ]
          </script>
      <link rel="stylesheet" href="${data.url}/styles/tailwind.min.css">
      <link rel="stylesheet" href="${data.url}/styles/styles.min.css">
      <!-- <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2721417416371812"
          crossorigin="anonymous"></script> -->
  </head>
  `;
  return htmlHeader;
}

const getPrincipalWrapper = (content) => {
  const appBody = root.querySelector("app-body");
  const appRoot = appBody.querySelector("app-root");
  const appHeader = appRoot.querySelector("app-header")?.innerHTML ?? '';
  const appFooter = appRoot.querySelector("app-footer")?.innerHTML ?? '';

  const bodyAttributes = [...appBody.attributes]
    .map(attr => `${attr.name}="${attr.value}"`)
    .join(' ');

  return `<body ${bodyAttributes}>${appHeader}${content}${appFooter}</body>`;

}

const generateIndex = () => {
  const appBody = root.querySelector("app-body");
  const appRoot = appBody.querySelector("app-root");
  const appIndex = appRoot.querySelector("app-index")?.innerHTML ?? '';
  createFile(getHead(null) + getPrincipalWrapper(appIndex), 'index.html');
}

const generatePages = () => {
  generateIndex();
  const sections = root.getElementsByTagName("app-section");
  for (let section of sections) {
    const nameSection = section.getAttribute("name");
    const sectionPath = clearName(nameSection);
    const subSections = section.getElementsByTagName("app-subsection");
    const sectionheader = section.querySelector("app-section-header")?.innerHTML ?? '';
    const sectionFooter = section.querySelector("app-section-footer")?.innerHTML ?? '';
    const sectionIndex = section.querySelector("app-section-index")?.innerHTML ?? '';
    for (let subSection of subSections) {
      const nameSubSection = subSection.getAttribute("name");
      const subSectionPath = clearName([nameSection, nameSubSection].join('/'));
      const htmlHeader = getHead(subSection, 'app-subsection-head', subSectionPath);
      const htmlSubSection = subSection.querySelector('app-subsection-body').innerHTML;
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
      let dataImg = '';
      for (let img of imgs) {
        dataImg += `<image:image>
      <image:loc>${img.getAttribute('src')}</image:loc>
    </image:image>`;
      }
      return dataImg;
    }
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

export const generateDist = () => {
  setAttributeForTags('img', 'loading', 'lazy');
  const html = root.innerHTML.replaceAll("$URL", data.url);
  root.innerHTML = html;
  clearForEachSections();
  clearTemplates();
  generatePages();
  generateSEOFiles();
}