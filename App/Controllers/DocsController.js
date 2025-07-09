const BaseController = require('./BaseController');
const fs = require('fs').promises;
const path = require('path');
const marked = require('marked');

class DocsController extends BaseController {
    static async index(req, res) {
        try {
            const docsPath = path.join(process.cwd(), 'docs');
            const files = await fs.readdir(docsPath);
            
            // Filtra apenas arquivos .md
            const markdownFiles = files.filter(file => file.endsWith('.md'));
            
            // Mapeia informações dos arquivos
            const documents = await Promise.all(
                markdownFiles.map(async (file) => {
                    const filePath = path.join(docsPath, file);
                    const stats = await fs.stat(filePath);
                    const content = await fs.readFile(filePath, 'utf-8');
                    
                    // Extrai título do primeiro # ou nome do arquivo
                    const titleMatch = content.match(/^#\s+(.+)$/m);
                    const title = titleMatch ? titleMatch[1] : file.replace('.md', '').replace(/_/g, ' ');
                    
                    return {
                        filename: file,
                        name: file.replace('.md', ''),
                        title: title,
                        size: stats.size,
                        modified: stats.mtime,
                        excerpt: content.substring(0, 200) + '...'
                    };
                })
            );
            
            // Ordena por data de modificação (mais recentes primeiro)
            documents.sort((a, b) => b.modified - a.modified);
            
            return BaseController.view('docs/index', {
                documents,
                title: 'Documentação - FWE Framework'
            }, res, req);
        } catch (error) {
            DocsController.log.error('Erro ao listar documentação', { error: error.message });
            return res.status(500).json({ error: 'Erro ao carregar documentação' });
        }
    }
    
    static async show(req, res) {
        try {
            const { documento } = req.params;
            const docsPath = path.join(process.cwd(), 'docs');
            const filePath = path.join(docsPath, `${documento}.md`);
            
            // Verifica se o arquivo existe
            try {
                await fs.access(filePath);
            } catch (error) {
                return res.status(404).json({ error: 'Documento não encontrado' });
            }
            
            // Lê o conteúdo do arquivo
            const content = await fs.readFile(filePath, 'utf-8');
            
            // Extrai título
            const titleMatch = content.match(/^#\s+(.+)$/m);
            const title = titleMatch ? titleMatch[1] : documento.replace(/_/g, ' ');
            
            // Converte Markdown para HTML
            const htmlContent = marked(content, {
                breaks: true,
                gfm: true
            });
            
            // Lista todos os documentos para navegação
            const files = await fs.readdir(docsPath);
            const markdownFiles = files.filter(file => file.endsWith('.md'));
            const documents = markdownFiles.map(file => ({
                filename: file,
                name: file.replace('.md', ''),
                active: file === `${documento}.md`
            }));
            
            return BaseController.view('docs/show', {
                title: title,
                content: htmlContent,
                documents,
                currentDoc: documento,
                rawContent: content
            }, res, req);
        } catch (error) {
            DocsController.log.error('Erro ao exibir documento', { documento: req.params.documento, error: error.message });
            return res.status(500).json({ error: 'Erro ao carregar documento' });
        }
    }
}

module.exports = DocsController; 