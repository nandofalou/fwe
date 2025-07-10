const path = require('path');

function resolveAppPath(...args) {
  // Se rodando no asar, __dirname aponta para dentro do asar
  // No dev, __dirname aponta para a pasta do arquivo
  if (__dirname.includes('app.asar')) {
    // Para pastas que são extraídas do asar (Views, Public, docs)
    // elas ficam em app.asar.unpacked
    const firstArg = args[0];
    if (firstArg === 'App' || firstArg === 'Public' || firstArg === 'docs') {
      return path.join(process.resourcesPath, 'app.asar.unpacked', ...args);
    } else {
      // Para outros arquivos que ficam dentro do asar
      return path.join(process.resourcesPath, ...args);
    }
  } else {
    // Ambiente de desenvolvimento
    return path.join(process.cwd(), ...args);
  }
}

module.exports = { resolveAppPath }; 