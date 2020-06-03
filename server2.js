const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const md5 = require("md5");
const PORT = 3000;



var salas = [];

const BARALHO_INICIAL = {

    cartas: [new Carta(1, 'r', '1-r'), new Carta(1, 'g', '1-g'), new Carta(1, 'b', '1-b'), new Carta(1, 'y', '1-y'), new Carta(2, 'r', '2-r'), new Carta(2, 'g', '2-g'), new Carta(2, 'b', '2-b'), new Carta(2, 'y', '2-y'), new Carta(3, 'r', '3-r'), new Carta(3, 'g', '3-g'), new Carta(3, 'b', '3-b'), new Carta(3, 'y', '3-y'), new Carta(4, 'r', '4-r'), new Carta(4, 'g', '4-g'), new Carta(4, 'b', '4-b'), new Carta(4, 'y', '4-y'), new Carta(5, 'r', '5-r'), new Carta(5, 'g', '5-g'), new Carta(5, 'b', '5-b'), new Carta(5, 'y', '5-y'), new Carta(6, 'r', '6-r'), new Carta(6, 'g', '6-g'), new Carta(6, 'b', '6-b'), new Carta(6, 'y', '6-y'), new Carta(7, 'r', '7-r'), new Carta(7, 'g', '7-g'), new Carta(7, 'b', '7-b'), new Carta(7, 'y', '7-y'), new Carta(8, 'r', '8-r'), new Carta(8, 'g', '8-g'), new Carta(8, 'b', '8-b'), new Carta(8, 'y', '8-y'), new Carta(9, 'r', '9-r'), new Carta(9, 'g', '9-g'), new Carta(9, 'b', '9-b'), new Carta(9, 'y', '9-y'),
             new Carta('block', 'b', 'b-b', 'block'), new Carta('block', 'g', 'b-g', 'block'), new Carta('block', 'r', 'b-r', 'block'), new Carta('block', 'y', 'b-y', 'block'),
             new Carta('plus2', 'b', 'p2-b', 'plus:2'), new Carta('plus2', 'g', 'p2-g', 'plus:2'), new Carta('plus2', 'r', 'p2-r', 'plus:2'), new Carta('plus2', 'y', 'p2-y', 'plus:2'), new Carta('plus4', 'n', 'p4-n', 'plus:4'),
             new Carta('reverse', 'b', 'r-b', 'reverse'), new Carta('reverse', 'g', 'r-g', 'reverse'), new Carta('reverse', 'r', 'r-r', 'reverse'), new Carta('reverse', 'y', 'r-y', 'reverse'),
             new Carta('reverse', 'n', 'rgby', 'change_color')]

}

//servir arquivos da pasta public
app.use(express.static("public"));

//parte do socket
io.on("connection", function (client) {
  //console.log("Cliente conectado...");
  //console.log(client.id);
  client.on("novoUsuario", function (apelido) {
    let novo_id = client.id;
    //console.log(
    //  `Usuário ${apelido} gerado com ID ${novo_id}. Enviando dados ao cliente...`
    //);
    io.to(client.id).emit("infoUsuario", [novo_id, apelido]);
  });
  client.on("logaSala", function (sala) {
    io.to(client.id).emit("entrarSala", {status: existeSala(sala), id: sala });
  });
  client.on("criarSala", (flag) => {
    criarSala(client.id);
  });
  client.on("pedeSala", (request) => {
    let salaDevolver = devolveSala(request);
    io.to(client.id).emit("salaDevolvida", salaDevolver);
  });
  client.on("iniciaJogo", (sala) => {
    iniciarJogo(sala, client.id);
  });
});

//utils
function iniciarJogo(id_sala) {
    for (let i = 0; i < salas.length; i++) {
        if (id_sala.indexOf(salas[i].id) != -1) {
            salas[i].iniciar();
            salas[i].jogadores.forEach (jogador => {
                io.to(jogador.id).emit("jogoIniciado", salas[i]);
            });
        }
    }
}



function devolveSala(request) {
    for (let i = 0; i < salas.length; i++) {
        if (request.sala.indexOf(salas[i].id) != -1) {
            salas[i].jogadores.push({id: request.id_jogador, apelido: request.apelido_jogador, bloqueado: false, cartas: []});
            return salas[i];
        }
    }
}


function Sala() {
  this.id = md5((Math.floor(Math.random() * (10000000 - 0)) + 0).toString(10));
  this.jogadores = [];
  this.baralho = [];
  this.descarte = [];
  this.iniciar = () => {
      console.log("Criando baralhgo...")
    this.baralho = criaBaralho();
  }
}

function existeSala(buscar) {
  let achei = false;
  //console.log("Buscando a sala " + buscar);
  //console.log(salas);
  salas.forEach((sala) => {
    //console.log("Comparando sala " + buscar + " com " + sala.id);
    if (buscar.indexOf(sala.id) != -1) {
      //console.log("Retornei true...");

      achei = !false;
    }
  });

  return achei;
}

function criarSala(socket_id) {
  let nova_sala = new Sala();
  //console.log("Sala criada: ");
  //console.log(nova_sala);
  io.to(socket_id).emit("salaCriada", nova_sala.id);
  salas.push(nova_sala);
}

function Carta(tipo, cor, imagem, poder = false) {
    this.tipo = tipo;
    this.cor  = cor;
    this.imagem = imagem;
    this.plus = 0;
    this.change_color = false;
    this.block = false;
    if (poder != false) {
        switch (poder) {
            case 'plus:2':
                this.plus = 2;
            break;

            case 'plus:4':
                this.plus = 4;
                this.change_color = true;
            break;

            case 'block':
                this.block = true;
            break;

            case 'change_color':
                this.change_color = true;
            break;
        }
    } else {
        this.poder = false;
    }
}

function criaBaralho() {
    let copia_baralho = BARALHO_INICIAL;
    copia_baralho = copia_baralho.cartas;
    for (let i = copia_baralho.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia_baralho[i], copia_baralho[j]] = [copia_baralho[j], copia_baralho[i]];
    }
    return copia_baralho;
}

//iniciar server
http.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
