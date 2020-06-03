const express   = require('express');
const app       = express();
const http      = require('http').Server(app);
const io        = require('socket.io')(http);
const PORT      = 3000;

//servir arquivos da pasta public
app.use(express.static('public'));

//parte do socket



//iniciar server
http.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
})