const express   = require('express');
const app       = express();
const http      = require('http').Server(app);
const io        = require('socket.io')(http);
const md5       = require('md5');
const PORT      = 3000;

//servir arquivos da pasta public
app.use(express.static('public'));

//parte do socket
io.on('connection', function(client) {
    console.log('Cliente conectado...');
    console.log(client.id);
    client.on('novoUsuario', function(apelido) {
        let novo_id = md5(apelido);
        console.log(`Usuário ${apelido} gerado com ID ${novo_id}. Enviando dados ao cliente...`);
        io.to(client.id).emit('infoUsuario', [novo_id, apelido]);
    });
});


//iniciar server
http.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
})