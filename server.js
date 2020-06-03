const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const md5 = require("md5");
const PORT = 3000;

var salas = [];

//servir arquivos da pasta public
app.use(express.static("public"));

//parte do socket
io.on("connection", function (client) {
  console.log("Cliente conectado...");
  console.log(client.id);
  client.on("novoUsuario", function (apelido) {
    let novo_id = md5(apelido);
    console.log(
      `Usuário ${apelido} gerado com ID ${novo_id}. Enviando dados ao cliente...`
    );
    io.to(client.id).emit("infoUsuario", [novo_id, apelido]);
  });
  client.on("logaSala", function (sala) {
    io.to(client.id).emit("entrarSala", {status: existeSala(sala), id: sala });
  });
  client.on("criarSala", (flag) => {
    criarSala(client.id);
  });
});

//utils
function Sala() {
  this.id = md5((Math.floor(Math.random() * (10000000 - 0)) + 0).toString(10));
  this.jogadores = [];
  this.baralho = [];
  this.ordem = [];
}

function existeSala(buscar) {
  let achei = false;
  //console.log("Buscando a sala " + buscar);
  //console.log(salas);
  salas.forEach((sala) => {
    //console.log("Comparando sala " + buscar + " com " + sala.id);
    if (buscar.indexOf(sala.id) != -1) {
      console.log("Retornei true...");

      achei = !false;
    }
  });

  return achei;
}

function criarSala(socket_id) {
  let nova_sala = new Sala();
  console.log("Sala criada: ");
  console.log(nova_sala);
  io.to(socket_id).emit("salaCriada", nova_sala.id);
  salas.push(nova_sala);
}

//iniciar server
http.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
