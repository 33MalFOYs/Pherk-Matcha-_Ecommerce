import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const output = resolve(process.argv[2] || 'outputs/Pherk-Matcha-Menu.html');
const image = readFileSync('dist/assets/drinks.png').toString('base64');
const favicon = readFileSync('dist/assets/favicon.svg').toString('base64');
const css = readFileSync('dist/styles.css', 'utf8').replaceAll('/assets/drinks.png', `data:image/png;base64,${image}`);
const js = readFileSync('dist/app.js', 'utf8').replaceAll('</script', '<\\/script');
const html = readFileSync('dist/index.html', 'utf8')
  .replace('href="/assets/favicon.svg"', () => `href="data:image/svg+xml;base64,${favicon}"`)
  .replace('<link rel="stylesheet" href="/styles.css">', () => `<style>${css}</style>`)
  .replace('<script src="/app.js" defer></script>', '')
  .replace('</body>', () => `<script>${js}</script></body>`);
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, html, 'utf8');
console.log(`Exported ${output}`);
