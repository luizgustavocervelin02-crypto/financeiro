const fs = require('fs');
const path = require('path');

// Um PNG mínimo válido de 1x1 pixel ou ícone base
// PNG com cabeçalho IHDR e IDAT válido
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAMAAAB/Pny7AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJUExURf///wAAAP///+sF8cEAAAACdFJOU/8A5bcwSgAAAAlwSFlzAAALEwAACxMBAJqcGAAAADNJREFUeF7twTEBAAAAwqD1T20ND6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4Gsx3AABw/H/gQAAAABJRU5ErkJggg==';

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), Buffer.from(pngBase64, 'base64'));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), Buffer.from(pngBase64, 'base64'));
console.log('PNG placeholder icons generated successfully.');
