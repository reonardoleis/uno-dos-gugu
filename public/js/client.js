const socket = io('http://localhost:3000');
 
            var infoUsuario = {
                apelido:    '',
                id:         '',
                conectado:  false,
                sala:       undefined,
                infoSala:   undefined
            }
 
            socket.on('connect', () => {
                console.log("Conectado ao servidor...");
            })
 
            socket.on('infoUsuario', (info) => {
                console.log("Preenchendo meus dados com recebimento do servidor...");
                let apelido = info[1];
                let id = info[0];
                infoUsuario.apelido         = apelido;
                infoUsuario.id              = id;
                infoUsuario.conectado       = true;
            })
 
            function enviaApelido() {
                let apelido = document.getElementById('apelido').value;
                if (apelido.length > 3) {
                    socket.emit('novoUsuario', apelido);
               
                document.getElementById('pseudo-login').style.display = "none";
 
                document.getElementById('enter-room').style.display = "initial";
                } else {
                    alert("Seu apelido precisa ser maior que 3 caracteres.");
                }
 
            }
 
            function salaExistente() {
                let sala = document.getElementById('idSala').value;
                socket.emit('logaSala', sala);
            }
 
            function criarSala() {
                socket.emit('criarSala', 0);
            }
 
            socket.on('entrarSala', response => {
 
                if(response.status == true) {
                    infoUsuario.sala = response.id;
                    renderSala();
                } else {
                    alert("Esta sala não existe meu casinha");
                }
 
            })
 
            socket.on('salaCriada', response => {
                console.log(response);
 
                infoUsuario.sala = response;
                renderSala();
                document.getElementById('id_sala').innerHTML = "ID da sala: " + response;
 
            })
 
            socket.on('salaDevolvida', sala => {
                infoUsuario.infoSala = sala;
            });
 
            socket.on('jogoIniciado', (response) => {
                //console.log(response);
                if(response != false) {
                    infoUsuario.infoSala = response;
                    document.getElementById('start-game').style.display = "none";
                    document.getElementById('jogadores').style.display = 'initial';
                    document.getElementById('lista_jogadores').innerHTML = "";
                    let tempJogadores = "";
                    response.jogadores.forEach(jogador => {
                        tempJogadores += `<li> ${jogador.apelido} </li>`;
                    });
                    document.getElementById('lista_jogadores').innerHTML = tempJogadores;

                    renderizaCartas();
 
 
                   
                } else {
                    alert("Falta um casa");
                }
               
            })

            socket.on('atualizaJogo', (sala) => {
                console.log("Atualizando...")
                infoUsuario.infoSala = sala;
                renderizaCartas();
                if(minhaVez()) {
                    if(ehPossivel()) {
                        console.log("Você tem possibilidades para jogar.");
                        //socket.emit("atualizaClientes", infoUsuario.infoSala);
                    } else {
        
                        while (!ehPossivel()) {
                            //socket.emit("atualizaClientes", infoUsuario.infoSala);
                            compraCarta();
                            renderizaCartas();
                            console.log("Não pode jogar. Comprando mais...");
                            
                        }
                        
                        socket.emit("atualizaClientes", infoUsuario.infoSala);

                    }
                }
            });

            socket.on("jogoFinalizado", dadosJogador => {
                console.log(dadosJogador);
                alert(dadosJogador.apelido + " venceu.");
            })

            function compraCarta() {
                infoUsuario.infoSala.jogadores.forEach(jogador => {
                    if (jogador.id == infoUsuario.id) {
                        if (infoUsuario.infoSala.baralho.length > 0) {
                            jogador.cartas.push(infoUsuario.infoSala.baralho.shift());
                            
                        } else {
                            infoUsuario.infoSala.baralho = recriaBaralho(infoUsuario.infoSala.descarte);
                            jogador.cartas.push(infoUsuario.infoSala.baralho.shift());
                            
                        }
                        ///socket.emit("atualizaClientes", infoUsuario.infoSala);
                    }
                });
            }

            function recriaBaralho(baralho) {
                let copia_baralho = baralho.slice(0);
                for (let i = copia_baralho.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [copia_baralho[i], copia_baralho[j]] = [copia_baralho[j], copia_baralho[i]];
                }
                for (let i = 0; i < copia_baralho.length; i++) {
                    if (copia_baralho[i].imagem == 'p4-n' || copia_baralho[i].imagem == 'rgby') {
                        copia_baralho[i].cor = 'n';
                    }
                }
                return copia_baralho;
            }

            function ehPossivel() {
                let baralho = meuBaralho();
                let retorno = false;
                let ultimaJogada = infoUsuario.infoSala.descarte[infoUsuario.infoSala.descarte.length - 1];
                baralho.forEach(carta => {
                    if (carta.cor == 'n') {
                        retorno = true;
                    } else {
                        if (carta.cor == ultimaJogada.cor || carta.tipo == ultimaJogada.tipo) {
                            retorno = true;
                        }
                    }
                });
                return retorno;
            }
 
            function renderSala() {
                socket.emit('pedeSala', {sala: infoUsuario.sala, id_jogador: infoUsuario.id, apelido_jogador: infoUsuario.apelido});
                document.getElementById('game-room').style.display  = "initial";
                document.getElementById('enter-room').style.display = "none";
            }
 
            function iniciaJogo() {
                socket.emit('iniciaJogo', infoUsuario.sala);
            }
 

            var TEMP_POSICAO = 0;
            function jogarCarta(pos) {
                if (minhaVez()) {
                    let baralho = meuBaralho();
                    let ultimaJogada = infoUsuario.infoSala.descarte[infoUsuario.infoSala.descarte.length - 1];
                    if (baralho[pos].cor == 'n') {
                        infoUsuario.infoSala.jogador_atual = -1;
                        TEMP_POSICAO = pos;
                        document.getElementById('escolhe-cor').style.display = 'initial';
                    } else {
                        if (baralho[pos].cor == ultimaJogada.cor || baralho[pos].tipo == ultimaJogada.tipo) {
                            infoUsuario.infoSala.jogador_atual = -1;
                            socket.emit('jogarCarta', {sala: infoUsuario.sala, jogador: infoUsuario.id, carta: pos})
                            //
                        } else {
                            alert("Você não pode jogar essa carta, meu casa!");
                        }
                    }
                } else {
                    alert("Não é tua vez meu casinha.");
                }
            }

            function escolheCor(cor) {
                document.getElementById('escolhe-cor').style.display = 'none';
                socket.emit('jogarCarta', {sala: infoUsuario.sala, jogador: infoUsuario.id, carta: TEMP_POSICAO, cor: cor})
                //socket.emit("atualizaClientes", infoUsuario.infoSala);
            }

            function minhaVez() {
                if (infoUsuario.infoSala.jogadores[infoUsuario.infoSala.jogador_atual].id == infoUsuario.id) {
                    return true;
                } else {
                    return false;
                }
            }

            function meuBaralho() {
                let retorno = false;
                infoUsuario.infoSala.jogadores.forEach(jogador => {
                    if (jogador.id == infoUsuario.id) {
                        retorno =  jogador.cartas;
                    }
                });
                return retorno;
            }
 
            function renderizaCartas() {
 
                let yourCardsTemp = '<div class="cards">';
                let enemyCardsTemp = '<div class="cards">'
 
                document.getElementById('enemy-cards').innerHTML = '';
                document.getElementById('your-cards').innerHTML = '';
                document.getElementById('central-card')
                .innerHTML = `<div class="cards">    
                        <img class="c-card" src='./sliced/${infoUsuario.infoSala.descarte[infoUsuario.infoSala.descarte.length -1].imagem}.png'>
                        </div>`
                   
                   
                infoUsuario.infoSala.jogadores.forEach(jogador => {
                    let card_pos = 0;
                    if(jogador.id == infoUsuario.id) {
                        jogador.cartas.forEach(carta => {
                            yourCardsTemp += ` <img class="card" onclick='jogarCarta(${card_pos})' src="./sliced/${carta.imagem}.png">`;
                            card_pos++;
                        })
                    }
                });
 
                infoUsuario.infoSala.jogadores.forEach(jogador => {
                    if(jogador.id != infoUsuario.id) {
                        jogador.cartas.forEach(carta => {
                            enemyCardsTemp += ` <img class="card" src="./sliced/back.png">`;
                        })
                    }
                });
               
                yourCardsTemp += '</div>';
                enemyCardsTemp += '</div>';
                document.getElementById('your-cards').innerHTML = yourCardsTemp;
                document.getElementById('enemy-cards').innerHTML = enemyCardsTemp;
            }