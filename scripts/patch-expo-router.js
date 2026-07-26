const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

// 1. Patch node_modules/expo-router/build/fork/useLinking.native.js
const forkUseLinkingPath = path.join(
  projectRoot,
  'node_modules/expo-router/build/fork/useLinking.native.js'
);
if (fs.existsSync(forkUseLinkingPath)) {
  let content = fs.readFileSync(forkUseLinkingPath, 'utf8');
  const target = `onUnhandledLinking((0, extractPathFromURL_1.extractExpoPathFromURL)(prefixes, url));`;
  const replacement = `setTimeout(() => {\n                                onUnhandledLinking((0, extractPathFromURL_1.extractExpoPathFromURL)(prefixes, url));\n                            }, 0);`;
  if (content.includes(target)) {
    content = content.replaceAll(target, replacement);
    fs.writeFileSync(forkUseLinkingPath, content, 'utf8');
    console.log('[patch-expo-router] Patched build/fork/useLinking.native.js');
  }
}

// 2. Patch node_modules/expo-router/build/react-navigation/native/useLinking.native.js
const navUseLinkingPath = path.join(
  projectRoot,
  'node_modules/expo-router/build/react-navigation/native/useLinking.native.js'
);
if (fs.existsSync(navUseLinkingPath)) {
  let content = fs.readFileSync(navUseLinkingPath, 'utf8');
  const target = `onUnhandledLinking((0, extractPathFromURL_1.extractPathFromURL)(prefixes, url));`;
  const replacement = `setTimeout(() => {\n                                onUnhandledLinking((0, extractPathFromURL_1.extractPathFromURL)(prefixes, url));\n                            }, 0);`;
  if (content.includes(target)) {
    content = content.replaceAll(target, replacement);
    fs.writeFileSync(navUseLinkingPath, content, 'utf8');
    console.log('[patch-expo-router] Patched build/react-navigation/native/useLinking.native.js');
  }
}
