const app = express();
const port = 3131;


// Configurar CORS para permitir requisições de outros domínios
app.use(cors()); // Permite todas as origens - adicionado 18/10/2024


// Função para verificar o status de um ramal usando `core show hint`
function checkExtensionStatus(extension, callback) {
    exec(`asterisk -rx "core show hint ${extension}"`, (err, stdout, stderr) => {
        if (err) {
            console.error("Erro ao executar core show hint:", err);
            callback(err, null);
            return;
        }

        const output = stdout;
        console.log("Resposta do Asterisk:", output); // Depuração para ver a resposta completa
        let status;

        if (output.includes('State:Idle')) {
            status = "Disponível";
        } else if (output.includes('State:InUse')) {
            status = "Ocupado";
        } else if (output.includes('State:Unavailable')) {
            status = "Deslogado";
        } else {
            status = "Desconhecido";
        }

        callback(null, status);
    });
}

// Rota para obter o status de um ramal
app.get('/status/:extension', (req, res) => {
    const extension = req.params.extension;

    checkExtensionStatus(extension, (err, status) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({
                extension: extension,
                status: status
            });
        }
    });
});

// Iniciar o servidor web
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
