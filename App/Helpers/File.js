const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Cria um diretório se não existir
 * @param {string} dirPath Caminho do diretório
 * @returns {boolean} true se criado ou já existir
 */
function createDirIfNotExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        return true;
    }
    return false;
}

/**
 * Obtém o tamanho de um arquivo em bytes
 * @param {string} filePath Caminho do arquivo
 * @returns {number} Tamanho em bytes
 */
function getFileSize(filePath) {
    const stats = fs.statSync(filePath);
    return stats.size;
}

/**
 * Formata o tamanho de um arquivo
 * @param {number} bytes Tamanho em bytes
 * @returns {string} Tamanho formatado
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Cria um backup de um arquivo
 * @param {string} filePath Caminho do arquivo
 * @param {string} backupDir Diretório de backup
 * @returns {string} Caminho do arquivo de backup
 */
function backupFile(filePath, backupDir) {
    const fileName = path.basename(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `${fileName}.${timestamp}.bak`);
    
    createDirIfNotExists(backupDir);
    fs.copyFileSync(filePath, backupPath);
    
    return backupPath;
}

/**
 * Lista arquivos em um diretório
 * @param {string} dirPath Caminho do diretório
 * @param {string} extension Extensão dos arquivos (opcional)
 * @returns {Array} Lista de arquivos
 */
function listFiles(dirPath, extension = null) {
    const files = fs.readdirSync(dirPath);
    if (extension) {
        return files.filter(file => file.endsWith(extension));
    }
    return files;
}

/**
 * Obtém o diretório de dados do usuário
 * @returns {string} Caminho do diretório
 */
function getUserDataDir() {
    const userDataDir = path.join(os.homedir(), 'fwe');
    createDirIfNotExists(userDataDir);
    return userDataDir;
}

/**
 * Obtém o diretório de backup
 * @returns {string} Caminho do diretório
 */
function getBackupDir() {
    const backupDir = path.join(getUserDataDir(), 'backups');
    createDirIfNotExists(backupDir);
    return backupDir;
}

/**
 * Verifica se um arquivo existe
 * @param {string} filePath Caminho do arquivo
 * @returns {boolean} true se existir
 */
function fileExists(filePath) {
    return fs.existsSync(filePath);
}

/**
 * Lê o conteúdo de um arquivo
 * @param {string} filePath Caminho do arquivo
 * @returns {string} Conteúdo do arquivo
 */
function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

/**
 * Escreve conteúdo em um arquivo
 * @param {string} filePath Caminho do arquivo
 * @param {string} content Conteúdo a ser escrito
 * @returns {boolean} true se sucesso
 */
function writeFile(filePath, content) {
    const dirPath = path.dirname(filePath);
    createDirIfNotExists(dirPath);
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
}

/**
 * Remove um arquivo
 * @param {string} filePath Caminho do arquivo
 * @returns {boolean} true se removido
 */
function removeFile(filePath) {
    if (fileExists(filePath)) {
        fs.unlinkSync(filePath);
        return true;
    }
    return false;
}

/**
 * Move um arquivo
 * @param {string} sourcePath Caminho de origem
 * @param {string} targetPath Caminho de destino
 * @returns {boolean} true se movido
 */
function moveFile(sourcePath, targetPath) {
    if (fileExists(sourcePath)) {
        const targetDir = path.dirname(targetPath);
        createDirIfNotExists(targetDir);
        fs.renameSync(sourcePath, targetPath);
        return true;
    }
    return false;
}

/**
 * Copia um arquivo
 * @param {string} sourcePath Caminho de origem
 * @param {string} targetPath Caminho de destino
 * @returns {boolean} true se copiado
 */
function copyFile(sourcePath, targetPath) {
    if (fileExists(sourcePath)) {
        const targetDir = path.dirname(targetPath);
        createDirIfNotExists(targetDir);
        fs.copyFileSync(sourcePath, targetPath);
        return true;
    }
    return false;
}

/**
 * Obtém a extensão de um arquivo
 * @param {string} filePath Caminho do arquivo
 * @returns {string} Extensão do arquivo
 */
function getFileExtension(filePath) {
    return path.extname(filePath).toLowerCase();
}

/**
 * Obtém o nome do arquivo sem extensão
 * @param {string} filePath Caminho do arquivo
 * @returns {string} Nome do arquivo
 */
function getFileNameWithoutExtension(filePath) {
    return path.basename(filePath, path.extname(filePath));
}

module.exports = {
    createDirIfNotExists,
    getFileSize,
    formatFileSize,
    backupFile,
    listFiles,
    getUserDataDir,
    getBackupDir,
    fileExists,
    readFile,
    writeFile,
    removeFile,
    moveFile,
    copyFile,
    getFileExtension,
    getFileNameWithoutExtension
}; 