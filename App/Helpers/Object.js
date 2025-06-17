/**
 * Obtém um valor de um objeto usando notação de ponto
 * @param {Object} obj Objeto a ser acessado
 * @param {string} path Caminho do valor
 * @param {*} defaultValue Valor padrão
 * @returns {*} Valor encontrado ou valor padrão
 */
function get(obj, path, defaultValue = undefined) {
    const travel = regexp =>
        String.prototype.split
            .call(path, regexp)
            .filter(Boolean)
            .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
    const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
    return result === undefined || result === obj ? defaultValue : result;
}

/**
 * Define um valor em um objeto usando notação de ponto
 * @param {Object} obj Objeto a ser modificado
 * @param {string} path Caminho do valor
 * @param {*} value Valor a ser definido
 * @returns {Object} Objeto modificado
 */
function set(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const lastObj = keys.reduce((obj, key) => {
        if (!(key in obj)) {
            obj[key] = {};
        }
        return obj[key];
    }, obj);
    lastObj[lastKey] = value;
    return obj;
}

/**
 * Remove um valor de um objeto usando notação de ponto
 * @param {Object} obj Objeto a ser modificado
 * @param {string} path Caminho do valor
 * @returns {Object} Objeto modificado
 */
function unset(obj, path) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const lastObj = keys.reduce((obj, key) => {
        if (!(key in obj)) {
            return obj;
        }
        return obj[key];
    }, obj);
    if (lastObj) {
        delete lastObj[lastKey];
    }
    return obj;
}

/**
 * Verifica se um objeto tem uma propriedade usando notação de ponto
 * @param {Object} obj Objeto a ser verificado
 * @param {string} path Caminho da propriedade
 * @returns {boolean} true se tem a propriedade
 */
function has(obj, path) {
    return get(obj, path) !== undefined;
}

/**
 * Mescla dois objetos
 * @param {Object} target Objeto alvo
 * @param {Object} source Objeto fonte
 * @returns {Object} Objeto mesclado
 */
function merge(target, source) {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    output[key] = merge(target[key], source[key]);
                }
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

/**
 * Verifica se um valor é um objeto
 * @param {*} value Valor a ser verificado
 * @returns {boolean} true se for objeto
 */
function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Converte um objeto para um array de pares chave-valor
 * @param {Object} obj Objeto a ser convertido
 * @returns {Array} Array de pares chave-valor
 */
function entries(obj) {
    return Object.entries(obj);
}

/**
 * Converte um array de pares chave-valor para um objeto
 * @param {Array} entries Array de pares chave-valor
 * @returns {Object} Objeto convertido
 */
function fromEntries(entries) {
    return Object.fromEntries(entries);
}

/**
 * Obtém as chaves de um objeto
 * @param {Object} obj Objeto a ser processado
 * @returns {Array} Array de chaves
 */
function keys(obj) {
    return Object.keys(obj);
}

/**
 * Obtém os valores de um objeto
 * @param {Object} obj Objeto a ser processado
 * @returns {Array} Array de valores
 */
function values(obj) {
    return Object.values(obj);
}

/**
 * Verifica se um objeto está vazio
 * @param {Object} obj Objeto a ser verificado
 * @returns {boolean} true se vazio
 */
function isEmpty(obj) {
    return !obj || Object.keys(obj).length === 0;
}

/**
 * Cria um objeto com valores padrão
 * @param {Object} obj Objeto base
 * @param {Object} defaults Valores padrão
 * @returns {Object} Objeto com valores padrão
 */
function defaults(obj, defaults) {
    return { ...defaults, ...obj };
}

/**
 * Pega um subconjunto de propriedades de um objeto
 * @param {Object} obj Objeto a ser processado
 * @param {Array} props Propriedades a serem mantidas
 * @returns {Object} Objeto com as propriedades selecionadas
 */
function pick(obj, props) {
    return props.reduce((result, prop) => {
        if (prop in obj) {
            result[prop] = obj[prop];
        }
        return result;
    }, {});
}

/**
 * Remove propriedades de um objeto
 * @param {Object} obj Objeto a ser processado
 * @param {Array} props Propriedades a serem removidas
 * @returns {Object} Objeto sem as propriedades removidas
 */
function omit(obj, props) {
    return Object.keys(obj)
        .filter(key => !props.includes(key))
        .reduce((result, key) => {
            result[key] = obj[key];
            return result;
        }, {});
}

module.exports = {
    get,
    set,
    unset,
    has,
    merge,
    isObject,
    entries,
    fromEntries,
    keys,
    values,
    isEmpty,
    defaults,
    pick,
    omit
}; 