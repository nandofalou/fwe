const http = require('http');
const https = require('https');
const url = require('url');

/**
 * Classe para manipulação de requisições HTTP
 */
class Request {
    /**
     * Faz uma requisição HTTP
     * @param {string} method Método HTTP
     * @param {string} url URL da requisição
     * @param {Object} options Opções da requisição
     * @returns {Promise<Object>} Resposta da requisição
     */
    static async request(method, url, options = {}) {
        const parsedUrl = url.parse(url);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        const requestOptions = {
            method,
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.path,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        return new Promise((resolve, reject) => {
            const req = protocol.request(requestOptions, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = {
                            statusCode: res.statusCode,
                            headers: res.headers,
                            data: JSON.parse(data)
                        };
                        resolve(response);
                    } catch (error) {
                        resolve({
                            statusCode: res.statusCode,
                            headers: res.headers,
                            data
                        });
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            if (options.data) {
                req.write(JSON.stringify(options.data));
            }

            req.end();
        });
    }

    /**
     * Faz uma requisição GET
     * @param {string} url URL da requisição
     * @param {Object} options Opções da requisição
     * @returns {Promise<Object>} Resposta da requisição
     */
    static async get(url, options = {}) {
        return this.request('GET', url, options);
    }

    /**
     * Faz uma requisição POST
     * @param {string} url URL da requisição
     * @param {Object} data Dados da requisição
     * @param {Object} options Opções da requisição
     * @returns {Promise<Object>} Resposta da requisição
     */
    static async post(url, data = {}, options = {}) {
        return this.request('POST', url, { ...options, data });
    }

    /**
     * Faz uma requisição PUT
     * @param {string} url URL da requisição
     * @param {Object} data Dados da requisição
     * @param {Object} options Opções da requisição
     * @returns {Promise<Object>} Resposta da requisição
     */
    static async put(url, data = {}, options = {}) {
        return this.request('PUT', url, { ...options, data });
    }

    /**
     * Faz uma requisição DELETE
     * @param {string} url URL da requisição
     * @param {Object} options Opções da requisição
     * @returns {Promise<Object>} Resposta da requisição
     */
    static async delete(url, options = {}) {
        return this.request('DELETE', url, options);
    }

    /**
     * Faz uma requisição PATCH
     * @param {string} url URL da requisição
     * @param {Object} data Dados da requisição
     * @param {Object} options Opções da requisição
     * @returns {Promise<Object>} Resposta da requisição
     */
    static async patch(url, data = {}, options = {}) {
        return this.request('PATCH', url, { ...options, data });
    }

    /**
     * Faz uma requisição HEAD
     * @param {string} url URL da requisição
     * @param {Object} options Opções da requisição
     * @returns {Promise<Object>} Resposta da requisição
     */
    static async head(url, options = {}) {
        return this.request('HEAD', url, options);
    }

    /**
     * Faz uma requisição OPTIONS
     * @param {string} url URL da requisição
     * @param {Object} options Opções da requisição
     * @returns {Promise<Object>} Resposta da requisição
     */
    static async options(url, options = {}) {
        return this.request('OPTIONS', url, options);
    }

    /**
     * Faz upload de arquivo
     * @param {string} url URL da requisição
     * @param {string} filePath Caminho do arquivo
     * @param {Object} options Opções da requisição
     * @returns {Promise<Object>} Resposta da requisição
     */
    static async upload(url, filePath, options = {}) {
        const fs = require('fs');
        const FormData = require('form-data');
        const form = new FormData();

        form.append('file', fs.createReadStream(filePath));

        const requestOptions = {
            method: 'POST',
            headers: {
                ...form.getHeaders(),
                ...options.headers
            }
        };

        return new Promise((resolve, reject) => {
            const req = http.request(url, requestOptions, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = {
                            statusCode: res.statusCode,
                            headers: res.headers,
                            data: JSON.parse(data)
                        };
                        resolve(response);
                    } catch (error) {
                        resolve({
                            statusCode: res.statusCode,
                            headers: res.headers,
                            data
                        });
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            form.pipe(req);
        });
    }

    /**
     * Faz download de arquivo
     * @param {string} url URL da requisição
     * @param {string} filePath Caminho do arquivo
     * @param {Object} options Opções da requisição
     * @returns {Promise<string>} Caminho do arquivo
     */
    static async download(url, filePath, options = {}) {
        const fs = require('fs');
        const requestOptions = {
            method: 'GET',
            headers: options.headers
        };

        return new Promise((resolve, reject) => {
            const req = http.request(url, requestOptions, (res) => {
                const file = fs.createWriteStream(filePath);

                res.pipe(file);

                file.on('finish', () => {
                    file.close();
                    resolve(filePath);
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.end();
        });
    }
}

module.exports = Request; 