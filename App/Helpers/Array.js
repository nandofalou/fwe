/**
 * Agrupa um array por uma chave
 * @param {Array} array Array a ser agrupado
 * @param {string} key Chave para agrupamento
 * @returns {Object} Array agrupado
 */
function groupBy(array, key) {
    return array.reduce((result, item) => {
        const group = item[key];
        result[group] = result[group] || [];
        result[group].push(item);
        return result;
    }, {});
}

/**
 * Ordena um array por uma chave
 * @param {Array} array Array a ser ordenado
 * @param {string} key Chave para ordenação
 * @param {string} direction Direção da ordenação (asc/desc)
 * @returns {Array} Array ordenado
 */
function sortBy(array, key, direction = 'asc') {
    return [...array].sort((a, b) => {
        if (direction === 'asc') {
            return a[key] > b[key] ? 1 : -1;
        }
        return a[key] < b[key] ? 1 : -1;
    });
}

/**
 * Remove itens duplicados de um array
 * @param {Array} array Array a ser processado
 * @param {string} key Chave para verificação de duplicidade
 * @returns {Array} Array sem duplicatas
 */
function unique(array, key = null) {
    if (key) {
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    }
    return [...new Set(array)];
}

/**
 * Divide um array em chunks
 * @param {Array} array Array a ser dividido
 * @param {number} size Tamanho de cada chunk
 * @returns {Array} Array de chunks
 */
function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * Encontra o primeiro item que satisfaz uma condição
 * @param {Array} array Array a ser processado
 * @param {Function} callback Função de callback
 * @returns {*} Item encontrado ou undefined
 */
function find(array, callback) {
    return array.find(callback);
}

/**
 * Filtra um array por uma condição
 * @param {Array} array Array a ser filtrado
 * @param {Function} callback Função de callback
 * @returns {Array} Array filtrado
 */
function filter(array, callback) {
    return array.filter(callback);
}

/**
 * Mapeia um array
 * @param {Array} array Array a ser mapeado
 * @param {Function} callback Função de callback
 * @returns {Array} Array mapeado
 */
function map(array, callback) {
    return array.map(callback);
}

/**
 * Reduz um array a um único valor
 * @param {Array} array Array a ser reduzido
 * @param {Function} callback Função de callback
 * @param {*} initialValue Valor inicial
 * @returns {*} Valor reduzido
 */
function reduce(array, callback, initialValue) {
    return array.reduce(callback, initialValue);
}

/**
 * Verifica se todos os itens satisfazem uma condição
 * @param {Array} array Array a ser verificado
 * @param {Function} callback Função de callback
 * @returns {boolean} true se todos satisfazem
 */
function every(array, callback) {
    return array.every(callback);
}

/**
 * Verifica se algum item satisfaz uma condição
 * @param {Array} array Array a ser verificado
 * @param {Function} callback Função de callback
 * @returns {boolean} true se algum satisfaz
 */
function some(array, callback) {
    return array.some(callback);
}

/**
 * Obtém o primeiro item de um array
 * @param {Array} array Array a ser processado
 * @returns {*} Primeiro item
 */
function first(array) {
    return array[0];
}

/**
 * Obtém o último item de um array
 * @param {Array} array Array a ser processado
 * @returns {*} Último item
 */
function last(array) {
    return array[array.length - 1];
}

/**
 * Obtém um item aleatório de um array
 * @param {Array} array Array a ser processado
 * @returns {*} Item aleatório
 */
function random(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Embaralha um array
 * @param {Array} array Array a ser embaralhado
 * @returns {Array} Array embaralhado
 */
function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Verifica se um array está vazio
 * @param {Array} array Array a ser verificado
 * @returns {boolean} true se vazio
 */
function isEmpty(array) {
    return !array || array.length === 0;
}

module.exports = {
    groupBy,
    sortBy,
    unique,
    chunk,
    find,
    filter,
    map,
    reduce,
    every,
    some,
    first,
    last,
    random,
    shuffle,
    isEmpty
}; 