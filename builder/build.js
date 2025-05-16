import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { setAppContext, throwError, copyRecursiveSync, generateDist } from './utilities/functions.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv.length < 3) throwError('❌ Debes proporcionar el nombre de la app. Ejemplo: node build.js mi-app');

const args = process.argv.slice(2);
const appName = args[0];

let docsPath = null;

if (args.length > 1) {
  const uploadDocs = args[1];
  if (uploadDocs === 'docs') {
    docsPath = path.resolve(__dirname, '../docs');
  }
}

// Ruta base a la app
const APP_PATH = path.resolve(__dirname, '../apps', appName);

if (!appName) throwError('❌ Debes proporcionar el nombre de la app. Ejemplo: node build.js mi-app');

// Verificar si existe la carpeta de la app
if (!fs.existsSync(APP_PATH)) throwError(`❌ La app "${appName}" no existe en: ${APP_PATH}`);

console.log('\n🔧 Iniciando el proceso de construcción de la aplicación...');




// Carpetas origen
const INDEX_PATH = path.join(APP_PATH, 'src', 'index.html');
const PUBLIC_DIR = path.join(APP_PATH, 'public');
const DIST_DIR = path.join(APP_PATH, 'dist');




// Limpiar dist si ya existe
if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR);



const html = fs.readFileSync(INDEX_PATH, 'utf-8');

// Cargar el HTML en un DOM simulado
const dom = new JSDOM(html);

// Acceder al document como si estuvieras en el navegador
const document = dom.window.document;



const root = document.createElement('div');
root.innerHTML = html;

setAppContext(document, root, DIST_DIR);

copyRecursiveSync(PUBLIC_DIR, DIST_DIR);


generateDist(appName);

// console.log(root.innerHTML)



// Copiar contenido de public y src directamente a dist/


const DIST_STYLES_DIR = path.join(DIST_DIR, 'styles');



exec(`cd ${DIST_STYLES_DIR} && tailwindcssWithoutNode -i ./styles.css -o ./styles.min.css --minify && tailwindcssWithoutNode -i ./tailwind.css -o ./tailwind.min.css --minify`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    // console.error(`Stderr: ${stderr}`);
    if (docsPath) {
      copyRecursiveSync(DIST_DIR, docsPath);
    }
    console.log('\n✅ Build completado con éxito. Archivos generados en la carpeta /dist');
    return;
  }
  console.log(`Stdout: ${stdout}`);
});


