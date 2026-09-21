const fs = require('fs');
const path = require('path');

// Имя результирующего файла
const OUTPUT_FILE = 'PROJECT-CODE.txt';

// Папки, которые нужно игнорировать
const IGNORE_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  'out',
  'build',
  'dist',
  '.vscode',
]);

// Файлы, которые не нужно включать (бинарники, секреты, кэш, огромные lock-файлы)
const IGNORE_FILES = new Set([
  OUTPUT_FILE,
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bundle-project.js',
]);

// Расширения бинарных файлов и медиа
const IGNORE_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico',
  '.woff', '.woff2', '.ttf', '.eot',
  '.mp3', '.mp4', '.avi', '.mov',
  '.zip', '.tar', '.gz', '.rar',
  '.pdf',
]);

// Проверка на файлы с секретными ключами (.env, .env.local и т.д.)
function isEnvFile(fileName) {
  return fileName.startsWith('.env');
}

// Рекурсивный обход директории
function getAllFiles(dirPath, arrayOfFiles = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        getAllFiles(fullPath, arrayOfFiles);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (
        !IGNORE_FILES.has(entry.name) &&
        !IGNORE_EXTENSIONS.has(ext) &&
        !isEnvFile(entry.name)
      ) {
        arrayOfFiles.push(fullPath);
      }
    }
  }

  return arrayOfFiles;
}

function bundle() {
  const rootDir = process.cwd();
  const files = getAllFiles(rootDir);
  let outputContent = '';

  // Сортируем список файлов по алфавиту
  files.sort();

  console.log('Сборка файлов проекта...');

  for (const filePath of files) {
    // Получаем относительный путь с нормализацией слэшей (например, app/admin/page.tsx)
    const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');

    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      outputContent += `// ==========================================\n`;
      outputContent += `// ${relativePath}\n`;
      outputContent += `// ==========================================\n`;
      outputContent += content.trimEnd() + '\n\n';
    } catch (err) {
      console.warn(`[Пропущен] Не удалось прочитать: ${relativePath} (${err.message})`);
    }
  }

  fs.writeFileSync(path.join(rootDir, OUTPUT_FILE), outputContent, 'utf-8');
  console.log(`\nГотово! Всего файлов объединено: ${files.length}`);
  console.log(`Результат сохранен в: ${OUTPUT_FILE}`);
}

bundle();