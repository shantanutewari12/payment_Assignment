import fs from 'fs';
import path from 'path';

const assetsDir = 'dist/client/assets';
const files = fs.readdirSync(assetsDir);

const jsFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
const cssFile = files.find(f => f.startsWith('styles-') && f.endsWith('.css'));

if (jsFile && cssFile) {
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PayDeck — Premium Payments</title>
    <link rel="stylesheet" href="/assets/${cssFile}">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/${jsFile}"></script>
  </body>
</html>`;

  fs.writeFileSync('dist/client/index.html', html);
  console.log('Successfully generated dist/client/index.html with:', { jsFile, cssFile });
} else {
  console.error('Could not find assets to generate index.html');
  process.exit(1);
}
