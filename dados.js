const CLASSES = {
"Bárbaro":{hitDie:12,primary:"Força",saves:["Força","Constituição"],skillN:2,
  skills:["Atletismo","Intimidação","Lidar com Animais","Natureza","Percepção","Sobrevivência"],
  armor:"Leve, Média e Escudos",weapons:"Simples e Marciais",
  array:{FOR:15,DES:13,CON:14,INT:10,SAB:12,CAR:8},
  cast:null,
  equipmentStart:"Um machadão grande OU duas machadinhas; quatro azagaias; um Pacote de Explorador; 15 metros de corda.",
  feature:"Fúria: como Ação Bônus, entra em fúria (enquanto não usar armadura pesada). Ganha resistência a dano de porrete, corte e perfuração, bônus de dano em ataques de Força e não pode conjurar magias nem concentrar-se enquanto durar."},
"Bardo":{hitDie:8,primary:"Carisma",saves:["Destreza","Carisma"],skillN:3,
  skills:["Qualquer perícia (escolha livre)"],
  armor:"Leve",weapons:"Simples",
  array:{FOR:8,DES:14,CON:12,INT:13,SAB:10,CAR:15},
  cast:{tipo:"full",attr:"CAR"},
  equipmentStart:"Uma espada longa OU rapieira; um Estojo de Instrumentos ou um Pacote de Diplomata; couro batido; uma adaga.",
  feature:"Inspiração de Bardo: como Ação Bônus, dá a um aliado um dado (d6 no nível 1) que ele pode somar a um teste, ataque ou salvaguarda dentro de 1 hora."},
"Bruxo":{hitDie:8,primary:"Carisma",saves:["Sabedoria","Carisma"],skillN:2,
  skills:["Arcanismo","Enganação","História","Intimidação","Investigação","Natureza","Religião"],
  armor:"Leve",weapons:"Simples",
  array:{FOR:8,DES:14,CON:13,INT:12,SAB:10,CAR:15},
  cast:{tipo:"pact",attr:"CAR"},
  equipmentStart:"Uma besta leve e 20 virotes OU uma arma simples; um Pacote de Estudioso; couro batido; duas adagas.",
  feature:"Invocações Místicas: aprende fragmentos de conhecimento proibido que concedem uma habilidade mágica permanente."},
"Clérigo":{hitDie:8,primary:"Sabedoria",saves:["Sabedoria","Carisma"],skillN:2,
  skills:["História","Intuição","Medicina","Persuasão","Religião"],
  armor:"Leve, Média e Escudos",weapons:"Simples",
  array:{FOR:14,DES:8,CON:13,INT:10,SAB:15,CAR:12},
  cast:{tipo:"full",attr:"SAB"},
  equipmentStart:"Uma maça OU espada curta; cota de malha ou couro batido com escudo; um Pacote de Padre ou de Explorador; um símbolo sagrado.",
  feature:"Conjuração + Ordem Divina: escolha Protetor (treino em armas marciais e armadura pesada) ou Taumaturgo (truque extra e bônus em Arcanismo/Religião)."},
"Druida":{hitDie:8,primary:"Sabedoria",saves:["Inteligência","Sabedoria"],skillN:2,
  skills:["Arcanismo","Lidar com Animais","Intuição","Medicina","Natureza","Percepção","Religião","Sobrevivência"],
  armor:"Leve e Escudos",weapons:"Simples",tool:"Kit de Herbalismo",
  array:{FOR:8,DES:12,CON:14,INT:13,SAB:15,CAR:10},
  cast:{tipo:"full",attr:"SAB"},
  equipmentStart:"Um escudo de madeira OU arma simples; um cajado ou clava; couro batido; um Pacote de Explorador; um foco druídico.",
  feature:"Conjuração: canaliza a magia da natureza, com truques e magias preparadas de Druida."},
"Feiticeiro":{hitDie:6,primary:"Carisma",saves:["Constituição","Carisma"],skillN:2,
  skills:["Arcanismo","Enganação","Intimidação","Intuição","Persuasão","Religião"],
  armor:"Nenhuma",weapons:"Simples",
  array:{FOR:10,DES:13,CON:14,INT:8,SAB:12,CAR:15},
  cast:{tipo:"full",attr:"CAR"},
  equipmentStart:"Uma besta leve e 20 virotes OU uma arma simples; um Pacote de Estudioso; duas adagas; um componente arcano.",
  feature:"Feitiçaria: magia inata ligada à sua origem sobrenatural. Escolhe uma linhagem que define seus truques e poderes."},
"Guardião":{hitDie:10,primary:"Destreza e Sabedoria",saves:["Força","Destreza"],skillN:3,
  skills:["Atletismo","Furtividade","Intuição","Investigação","Lidar com Animais","Natureza","Percepção","Sobrevivência"],
  armor:"Leve, Média e Escudos",weapons:"Simples e Marciais",
  array:{FOR:12,DES:15,CON:13,INT:8,SAB:14,CAR:10},
  cast:{tipo:"half",attr:"SAB"},
  equipmentStart:"Cota de couro; duas espadas curtas OU dois machados de mão; um arco longo e 20 flechas; um Pacote de Explorador.",
  feature:"Conjuração: canaliza a essência mágica da natureza para conjurar magias de Guardião."},
"Guerreiro":{hitDie:10,primary:"Força ou Destreza",saves:["Força","Constituição"],skillN:2,
  skills:["Acrobacia","Atletismo","História","Intimidação","Intuição","Lidar com Animais","Percepção","Persuasão","Sobrevivência"],
  armor:"Leve, Média, Pesada e Escudos",weapons:"Simples e Marciais",
  array:{FOR:15,DES:14,CON:13,INT:8,SAB:10,CAR:12},
  cast:null,
  equipmentStart:"Cota de malha OU couro batido com arco longo e 20 flechas; uma arma marcial e escudo OU duas armas marciais; um Pacote de Explorador ou de Dungeonista.",
  feature:"Estilo de Luta: escolhe uma especialização de combate que concede um bônus permanente."},
"Ladino":{hitDie:8,primary:"Destreza",saves:["Destreza","Inteligência"],skillN:4,
  skills:["Acrobacia","Atletismo","Enganação","Furtividade","Intimidação","Intuição","Investigação","Percepção","Persuasão","Prestidigitação"],
  armor:"Leve",weapons:"Simples e marciais leves/com Acuidade",tool:"Ferramentas de Ladrão",
  array:{FOR:12,DES:15,CON:13,INT:14,SAB:10,CAR:8},
  cast:null,
  equipmentStart:"Uma rapieira OU espada curta; um arco curto e 20 flechas OU espada curta; couro batido; duas adagas; ferramentas de ladrão; um Pacote de Dungeonista.",
  feature:"Ataque Furtivo: uma vez por turno, causa 1d6 de dano extra ao acertar com Vantagem usando arma leve/de acuidade ou à distância."},
"Mago":{hitDie:6,primary:"Inteligência",saves:["Inteligência","Sabedoria"],skillN:2,
  skills:["Arcanismo","História","Intuição","Investigação","Medicina","Natureza","Religião"],
  armor:"Nenhuma",weapons:"Simples",
  array:{FOR:8,DES:12,CON:13,INT:15,SAB:14,CAR:10},
  cast:{tipo:"full",attr:"INT"},
  equipmentStart:"Um bastão OU adaga; um livro de magias; um Pacote de Estudioso; um componente arcano.",
  feature:"Conjuração arcana via livro de magias + Adepto de Ritual (conjura magias rituais sem gastar espaço de magia)."},
"Monge":{hitDie:8,primary:"Destreza e Sabedoria",saves:["Força","Destreza"],skillN:2,
  skills:["Acrobacia","Atletismo","Furtividade","História","Intuição","Religião"],
  armor:"Nenhuma",weapons:"Simples e marciais leves",tool:"Ferramentas de Artesão ou Instrumento Musical",
  array:{FOR:12,DES:15,CON:13,INT:10,SAB:14,CAR:8},
  cast:null,
  equipmentStart:"Uma espada curta OU arma simples; 10 dardos; um Pacote de Explorador.",
  feature:"Artes Marciais: usa Destreza em ataques desarmados/armas de monge e ganha ataques desarmados extra."},
"Paladino":{hitDie:10,primary:"Força e Carisma",saves:["Sabedoria","Carisma"],skillN:2,
  skills:["Atletismo","Intimidação","Intuição","Medicina","Persuasão","Religião"],
  armor:"Leve, Média, Pesada e Escudos",weapons:"Simples e Marciais",
  array:{FOR:15,DES:10,CON:13,INT:8,SAB:12,CAR:14},
  cast:{tipo:"half",attr:"CAR"},
  equipmentStart:"Uma arma marcial e escudo OU duas armas marciais; cinco azagaias OU uma arma simples; cota de malha; um Pacote de Padre; um símbolo sagrado.",
  feature:"Conjuração + Juramento Sagrado que define seus valores e magias exclusivas de juramento."}
};

/* Características de classe por nível (resumo próprio, não é o texto do livro — confira o
   livro para a descrição oficial completa; use como lembrete rápido e edite à vontade). */
const LEVEL_FEATURES = {
"Bárbaro":{2:"Ataque Descuidado (vantagem em ataques corpo a corpo em fúria, mas te deixa mais vulnerável até seu próximo turno) e Sentido de Perigo (vantagem em resistências de Destreza contra efeitos que você vê).",
  5:"Ataque Extra (ataca duas vezes) e deslocamento maior enquanto em fúria e sem armadura pesada.",
  7:"Instinto Selvagem: vantagem em iniciativa e não pode ser surpreendido enquanto consciente.",
  9:"Ataque Brutal: dano extra ao acertar com maestria de arma durante a fúria.",
  11:"Fúria Implacável: se cair a 0 PV em fúria e sobreviver, a fúria continua.",
  13:"Ataque Brutal aumenta.",
  15:"Fúria Persistente: a fúria só termina se você quiser (ou ficar inconsciente).",
  17:"Ataque Brutal aumenta novamente.",
  18:"Fúria Indomável: dano da fúria nunca sai no mínimo.",
  20:"Campeão Primevo (capstone): Força e Constituição tratadas como muito mais altas enquanto em fúria."},
"Bardo":{2:"Especialização: dobra o bônus de proficiência em duas perícias treinadas.",
  5:"Fonte Inesgotável: recupera Inspiração de Bardo em Descanso Curto; o dado sobe para d8.",
  9:"Palavras Cortantes melhora; dado de Inspiração de Bardo sobe para d10.",
  10:"Segredos Mágicos: aprende magias extras de qualquer lista de conjurador.",
  15:"Dado de Inspiração de Bardo sobe para d12.",
  18:"Segredos Mágicos adicionais.",
  20:"Palavra Suprema (capstone): gasta Inspiração de Bardo para estabilizar, curar ou tratar aliados à distância, sem gastar ação."},
"Bruxo":{2:"Invocações Místicas adicionais.",
  5:"Espaços de magia de Pacto sobem para o 3º círculo.",
  9:"Espaços de magia de Pacto sobem para o 5º círculo (máximo).",
  11:"Arcano Místico: ganha um poder exclusivo de altíssimo nível.",
  15:"Arcano Místico melhora.",
  20:"Mestre dos Arcanos (capstone): recupera todos os espaços de Pacto 1x por dia sem descanso."},
"Clérigo":{2:"Canalizar Divindade (2 usos): expulsar mortos-vivos ou uma opção da sua Ordem Divina.",
  5:"Destruir Mortos-vivos melhora; ganha benefício adicional da Ordem Divina.",
  7:"Abençoado pelos Deuses: PV temporários ou vantagem ao cair a 0 PV (1x por Descanso Longo).",
  10:"Intervenção Divina: pode implorar por um milagre (1x por Descanso Longo).",
  20:"Intervenção Divina Aperfeiçoada (capstone): a intervenção funciona automaticamente."},
"Druida":{2:"Forma Selvagem: transforma-se em animal usando cargas (2, recuperadas em descanso).",
  5:"Forma Selvagem permite formas maiores e mais poderosas.",
  18:"Corpo Atemporal: envelhece muito mais devagar.",
  20:"Coração da Natureza (capstone): recupera uma carga de Forma Selvagem ao rolar iniciativa; pode converter cargas restantes em espaços de magia."},
"Feiticeiro":{2:"Fontes de Feitiçaria (pontos) e Metamagia: aprende duas opções para modificar magias.",
  7:"Metamagia adicional.",
  20:"Feitiçaria Suprema (capstone): usa Pontos de Feitiçaria para lançar magias de 1º círculo instantaneamente, ou recupera todos os pontos 1x por dia."},
"Guardião":{2:"Estilo de Luta e truques/magias iniciais.",
  5:"Ataque Extra (ataca duas vezes).",
  6:"Consciência Apurada: vantagem em Sobrevivência e Percepção ligadas a rastreamento.",
  10:"Ocultação na Natureza: pode se Esconder mesmo observado, em terreno natural.",
  14:"Golpe Certeiro: gasta espaço de magia para garantir um acerto.",
  20:"Lenda Selvagem (capstone): recupera espaços de magia gastos 1x por dia em Descanso Curto."},
"Guerreiro":{2:"Surto de Ação: age uma segunda vez no turno (1x por Descanso Curto).",
  5:"Ataque Extra (ataca duas vezes).",
  9:"Indomável: refaz um teste de resistência falho (1x por Descanso Longo).",
  11:"Ataque Extra (2): ataca três vezes.",
  13:"Indomável melhora (2 usos).",
  17:"Surto de Ação melhora (2 usos) e Indomável melhora (3 usos).",
  20:"Ataque Extra (3, capstone): ataca quatro vezes com a Ação de Atacar."},
"Ladino":{2:"Ação Ardilosa: Disparar, Desengajar ou Esconder-se como Ação Bônus.",
  5:"Esquiva: sofre metade (ou nenhum) de dano em testes de Destreza contra efeitos de área.",
  7:"Ataque Furtivo aumenta; Percepção Confiável melhora.",
  11:"Talento Fiável: perícias treinadas nunca contam como menos de um valor mínimo no d20.",
  14:"Sentidos Ardilosos: não pode ser surpreendido enquanto consciente.",
  15:"Escapar da Morte: reduz à metade o dano que o levaria a 0 PV.",
  18:"Mente Impenetrável: vantagem contra efeitos que leem a mente ou detectam mentiras.",
  20:"Golpe de Sorte (capstone): transforma um teste falho em sucesso 1x por Descanso Curto."},
"Mago":{2:"Recuperação Arcana melhora (recupera espaços de magia em Descanso Curto, 1x por dia).",
  18:"Mestria de Magia: lança de graça duas magias de baixo círculo já preparadas, 1x cada por Descanso Longo.",
  20:"Signatura Arcana (capstone): escolhe duas magias de até 5º círculo para lançar de graça, 1x cada por Descanso Longo."},
"Monge":{2:"Ki (pontos de foco), Rajada de Golpes e Desvio de Projéteis.",
  5:"Ataque Extra e Golpe Atordoante.",
  6:"Golpes com Ki contam como mágicos para superar resistência/imunidade.",
  7:"Evasão (metade/nenhum dano em testes de Destreza em área) e Mente Adamantina (vantagem em resistências de Sabedoria).",
  10:"Purificação do Corpo: imune a veneno e doenças.",
  14:"Alma Atemporal: vantagem em resistências contra efeitos mágicos.",
  18:"Corpo Sagrado: imune a veneno/doença; não precisa comer, beber ou respirar.",
  20:"Corpo Perfeito (capstone): Força e Destreza tratadas como no mínimo 20; recupera Ki ao rolar iniciativa com pouco Ki restante."},
"Paladino":{2:"Estilo de Luta, conjuração inicial e Imposição de Mãos (reserva de cura).",
  6:"Aura de Proteção: você e aliados próximos somam seu bônus de Carisma em resistências.",
  10:"Aura de Proteção aumenta de alcance.",
  11:"Arma Radiante: seus ataques com arma causam dano radiante extra.",
  14:"Toque Purificador: usa Imposição de Mãos para remover uma condição extra.",
  20:"Campeão Sagrado (capstone): resistência a todo dano e vantagem em ataques/resistências, 1x por Descanso Longo."}
};
const ASI_LEVELS = [4,8,12,16,19];
const SUBCLASS_LEVEL = 3;
const SUBCLASS_FEATURE_LEVELS = [3,6,7,10,11,14,15];

/* Lista oficial de subclasses (livro 2024) por classe — usada no dropdown do nível 3 */
const SUBCLASSES = {
 "Bárbaro": ["Trilha da Árvore do Mundo","Trilha do Berserker","Trilha do Coração Selvagem","Trilha do Fanático"],
 "Bardo": ["Colégio da Bravura","Colégio da Dança","Colégio do Conhecimento","Colégio do Glamour"],
 "Bruxo": ["Patrono Arquifada","Patrono Celestial","Patrono O Grande Antigo","Patrono Ínfero"],
 "Clérigo": ["Domínio da Guerra","Domínio da Luz","Domínio da Trapaça","Domínio da Vida"],
 "Druida": ["Círculo da Lua","Círculo da Terra","Círculo das Estrelas","Círculo do Mar"],
 "Feiticeiro": ["Feitiçaria Aberrante","Feitiçaria Dracônica","Feitiçaria Mecânica","Feitiçaria Selvagem"],
 "Guardião": ["Andarilho Feérico","Caçador","Senhor das Feras","Vigilante das Sombras"],
 "Guerreiro": ["Campeão","Cavaleiro Místico","Combatente Psíquico","Mestre da Batalha"],
 "Ladino": ["Adaga Espiritual","Assassino","Ladrão","Trapaceiro Arcano"],
 "Mago": ["Abjurador","Adivinhador","Evocador","Ilusionista"],
 "Monge": ["Combatente da Mão Espalmada","Combatente da Misericórdia","Combatente das Sombras","Combatente dos Elementos"],
 "Paladino": ["Juramento da Devoção","Juramento da Glória","Juramento da Vingança","Juramento dos Anciões"]
};

/* Tabelas de espaço de magia (mecânica padrão, iguais para todos os conjuradores do mesmo tipo) */
const FULL_SLOTS = {
 1:[2,0,0,0,0,0,0,0,0], 2:[3,0,0,0,0,0,0,0,0], 3:[4,2,0,0,0,0,0,0,0], 4:[4,3,0,0,0,0,0,0,0],
 5:[4,3,2,0,0,0,0,0,0], 6:[4,3,3,0,0,0,0,0,0], 7:[4,3,3,1,0,0,0,0,0], 8:[4,3,3,2,0,0,0,0,0],
 9:[4,3,3,3,1,0,0,0,0], 10:[4,3,3,3,2,0,0,0,0], 11:[4,3,3,3,2,1,0,0,0], 12:[4,3,3,3,2,1,0,0,0],
 13:[4,3,3,3,2,1,1,0,0], 14:[4,3,3,3,2,1,1,0,0], 15:[4,3,3,3,2,1,1,1,0], 16:[4,3,3,3,2,1,1,1,0],
 17:[4,3,3,3,2,1,1,1,1], 18:[4,3,3,3,3,1,1,1,1], 19:[4,3,3,3,3,2,1,1,1], 20:[4,3,3,3,3,2,2,1,1]
};
const HALF_SLOTS = {
 1:[0,0,0,0,0], 2:[2,0,0,0,0], 3:[3,0,0,0,0], 4:[3,0,0,0,0], 5:[4,2,0,0,0], 6:[4,2,0,0,0],
 7:[4,3,0,0,0], 8:[4,3,0,0,0], 9:[4,3,2,0,0], 10:[4,3,2,0,0], 11:[4,3,3,0,0], 12:[4,3,3,0,0],
 13:[4,3,3,1,0], 14:[4,3,3,1,0], 15:[4,3,3,2,0], 16:[4,3,3,2,0], 17:[4,3,3,3,1], 18:[4,3,3,3,1],
 19:[4,3,3,3,2], 20:[4,3,3,3,2]
};
const PACT_SLOTS = {
 1:{n:1,c:1},2:{n:2,c:1},3:{n:2,c:2},4:{n:2,c:2},5:{n:2,c:3},6:{n:2,c:3},7:{n:2,c:4},8:{n:2,c:4},
 9:{n:2,c:5},10:{n:2,c:5},11:{n:3,c:5},12:{n:3,c:5},13:{n:3,c:5},14:{n:3,c:5},15:{n:3,c:5},
 16:{n:3,c:5},17:{n:4,c:5},18:{n:4,c:5},19:{n:4,c:5},20:{n:4,c:5}
};

const GLOSSARIO = [
 ["Vantagem / Desvantagem","Com Vantagem, role 2d20 e use o maior. Com Desvantagem, role 2d20 e use o menor. Se tiver os dois ao mesmo tempo, eles se cancelam e você rola só 1d20."],
 ["Teste de Resistência","Rolagem de d20 + modificador para resistir a um efeito (veneno, magia, etc). O mestre diz qual atributo usar e o valor (CD) que você precisa alcançar."],
 ["Classe de Armadura (CA)","O número que o inimigo precisa igualar ou superar num ataque para te acertar. Quanto maior, mais difícil de te atingir."],
 ["Ação de Oportunidade","Se um inimigo sai do seu alcance de ataque sem usar a ação Desengajar, você pode usar sua Reação para atacá-lo uma vez."],
 ["Ação, Ação Bônus e Reação","Em cada turno você tem 1 Ação, 1 Movimento, e, se algo te conceder, 1 Ação Bônus. A Reação pode ser usada 1x por rodada, mesmo fora do seu turno."],
 ["Concentração","Algumas magias exigem concentração: você só pode manter uma por vez, e sofrer dano pode fazer você perdê-la (teste de Constituição)."],
 ["Inspiração Heroica","Um recurso que, quando você tem, pode gastar para rolar 1d20 extra em qualquer teste, ataque ou resistência e usar o melhor resultado."],
 ["Descanso Curto e Longo","Descanso Curto: pelo menos 1 hora, recupera alguns recursos (como espaços de Bruxo). Descanso Longo: pelo menos 8 horas, recupera PV, a maioria dos recursos e metade dos Dados de Vida."],
 ["Testes de Morte","Ao chegar a 0 PV (sem morrer instantaneamente) você fica Inconsciente e faz testes de morte no início dos seus turnos, até estabilizar, ser curado ou morrer."],
 ["Prova de Habilidade","Rolagem de d20 + modificador de atributo (+ bônus de proficiência se treinado) para tentar algo incerto, definida pelo mestre."]
];

const CONDICOES = {
 "Agarrado":"Velocidade 0; a condição acaba se quem agarra for incapacitado ou se você sair do alcance.",
 "Amedrontado":"Desvantagem em testes/ataques enquanto vir a fonte do medo; não pode se aproximar dela.",
 "Atordoado":"Incapacitado, não se move, fala de forma limitada; falha em Força/Destreza e ataques contra você têm vantagem.",
 "Caído":"Só pode se arrastar (a menos que se levante); desvantagem em ataques; ataques corpo a corpo contra você têm vantagem.",
 "Cego":"Falha em testes que dependem de visão; ataques contra você têm vantagem e os seus, desvantagem.",
 "Enfeitiçado":"Não pode atacar quem o enfeitiçou nem ser alvo de suas habilidades sociais hostis.",
 "Envenenado":"Desvantagem em ataques e testes de habilidade.",
 "Exausto":"Níveis de exaustão acumulam penalidades crescentes (desvantagem em testes, velocidade reduzida, etc.); 6 níveis = morte.",
 "Inconsciente":"Incapacitado, caído, não percebe o ambiente; ataques corpo a corpo contra você têm vantagem e acertam automaticamente crítico se adjacentes.",
 "Invisível":"Impossível de ver sem magia/sentido especial; vantagem em seus ataques, desvantagem nos ataques contra você.",
 "Paralisado":"Incapacitado, não se move nem fala; falha em Força/Destreza; ataques contra você têm vantagem e acertam crítico se adjacentes.",
 "Petrificado":"Transformado em substância sólida; incapacitado, resistência a todo dano, imune a veneno e doença."
};

const TURNO_LEMBRETE = "Na sua vez você pode: mover-se até seu deslocamento, fazer 1 Ação (atacar, conjurar, usar um item...) e, se algo te conceder, 1 Ação Bônus. Fora do seu turno você ainda tem 1 Reação disponível (ex.: Ataque de Oportunidade).";

/* ============================= GUIA RÁPIDO DO MESTRE ============================= */
const CD_TABELA = [
 {nome:"Muito Fácil", cd:5, exemplo:"quase impossível de falhar, quase não vale pedir teste"},
 {nome:"Fácil", cd:10, exemplo:"uma pessoa destreinada consegue na maioria das vezes"},
 {nome:"Médio", cd:15, exemplo:"o padrão pra maioria das situações do dia a dia de aventura"},
 {nome:"Difícil", cd:20, exemplo:"exige treino ou sorte pra conseguir"},
 {nome:"Muito Difícil", cd:25, exemplo:"só especialistas conseguem com alguma regularidade"},
 {nome:"Quase Impossível", cd:30, exemplo:"quase ninguém consegue sem ajuda mágica"}
];
const ATRIBUTO_NOMES = {FOR:"Força",DES:"Destreza",CON:"Constituição",INT:"Inteligência",SAB:"Sabedoria",CAR:"Carisma"};
const ATRIBUTO_EXEMPLOS = {
 FOR:["Arrombar uma porta ou algemas","Empurrar, puxar ou erguer algo pesado","Escalar sem equipamento","Manter o equilíbrio numa queda de braço ou empurrão"],
 DES:["Desarmar ou desviar de uma armadilha","Andar em silêncio, se esconder","Fazer algo com as mãos rápido (ex: soltar um nó, roubar um bolso)","Equilibrar-se em algo estreito ou escorregadio"],
 CON:["Aguentar dor, cansaço ou fome/sede prolongada","Resistir a veneno ou doença","Prender a respiração ou continuar lutando ferido","Resistir a efeitos de exaustão"],
 INT:["Lembrar de um fato, lenda ou local","Identificar uma criatura, magia ou item por dedução","Entender um mecanismo, código ou mapa complexo","Perceber uma falha lógica numa história contada"],
 SAB:["Perceber algo escondido ou uma emboscada","Notar se alguém está mentindo (sem ser prova, é intuição)","Cuidar de um animal ou acalmá-lo","Fazer primeiros socorros ou notar algo fora do normal no ambiente"],
 CAR:["Convencer alguém de algo (Persuasão)","Mentir ou blefar (Enganação)","Assustar ou impor respeito (Intimidação)","Causar boa impressão, atuar ou liderar um grupo"]
};
const DICAS_MESTRE = [
 "Só peça um teste quando o resultado for incerto e as duas possibilidades (sucesso e falha) forem interessantes pra história. Se não tem risco nem chance real de falhar, é só narrar que deu certo.",
 "Vantagem e Desvantagem não empilham: não importa quantas fontes você tenha de cada uma, o efeito é sempre role 2d20 e use o maior (vantagem) ou o menor (desvantagem). Se tiver as duas ao mesmo tempo, elas se cancelam.",
 "Num acerto crítico (20 natural), dobre os dados de dano rolados — o modificador (bônus fixo) não dobra.",
 "PV chegando a 0 não é morte na hora (a menos que o dano restante seja muito maior que o PV máximo): o personagem fica Inconsciente e começa a fazer testes de morte no início dos turnos dele.",
 "Ataque de oportunidade: só acontece quando uma criatura sai do seu alcance de ataque sem usar a ação Desengajar antes — e consome a Reação de quem ataca.",
 "Você pode ajustar a dificuldade na hora se perceber que ficou fácil ou difícil demais pro grupo — a regra existe pra servir a diversão da mesa, não o contrário.",
 "Não tenha medo de decidir algo na hora e seguir em frente. Você pode conferir a regra exata depois da sessão; travar o jogo procurando a regra certa custa mais que um pequeno erro."
];
const REGRAS_RAPIDAS = [
 ["Furtividade vs. Percepção","Quem está se escondendo rola Furtividade contra a Percepção passiva de quem pode notar (Percepção passiva = 10 + modificador de Percepção, sem rolar dado)."],
 ["Cobertura","Meia cobertura dá +2 na CA e testes de Destreza do alvo; cobertura de três quartos dá +5."],
 ["Surpresa","Uma criatura surpresa não pode se mover nem agir na primeira rodada de combate, e perde a Reação até seu primeiro turno."],
 ["Cair","Cair de uma altura causa 1d6 de dano de concussão por 3 metros caídos (máximo 20d6), e a criatura fica Caída."],
 ["Ajudar (Auxílio)","Um personagem pode gastar a ação pra ajudar outro, dando Vantagem no próximo teste dele daquela tarefa (ou +2 caso ambos ataquem o mesmo alvo)."]
];
function parseDado(expr){
  if(!expr) return null;
  const m = String(expr).trim().match(/(\d+)\s*d\s*(\d+)\s*([+\-]\s*\d+)?/i);
  if(!m) return null;
  return { n:parseInt(m[1]), sides:parseInt(m[2]), mod: m[3]? parseInt(m[3].replace(/\s+/g,'')) : 0 };
}
function rollExpr(expr, resId){
  const el = document.getElementById(resId);
  if(!el) return;
  const parsed = parseDado(expr);
  if(!parsed){ el.textContent = 'Não consegui ler "'+expr+'" — use o formato NdM+X (ex: 2d6+3)'; return; }
  let n=0;
  el.classList.add('rolling');
  const iv = setInterval(()=>{
    el.textContent = '🎲 rolando...';
    n++;
    if(n>=6){
      clearInterval(iv);
      let total = parsed.mod;
      const rolls=[];
      for(let i=0;i<parsed.n;i++){ const r=Math.floor(Math.random()*parsed.sides)+1; rolls.push(r); total+=r; }
      el.textContent = `🎲 [${rolls.join(', ')}]${parsed.mod?' '+fmtMod(parsed.mod):''} = ${total}`;
      el.classList.remove('rolling');
    }
  }, 70);
}
function mestreRolarD20(){
  const modEl = document.getElementById('mestreD20Mod');
  const mod = parseInt(modEl && modEl.value)||0;
  rollDado(20, mod, 'mestreD20Res');
}

const FRASES_INTERPRETACAO = [
 "Antes de atacar: \"Eu avanço com a arma em punho e tento acertar [alvo]!\"",
 "Ao falhar num teste: \"Eu tento, mas não sai como planejado...\"",
 "Ao entrar num lugar novo: \"Eu paro na entrada e observo tudo com cuidado antes de seguir.\"",
 "Ao negociar: \"Eu cruzo os braços e digo o que realmente penso, sem rodeios.\"",
 "Ao usar uma magia: \"Eu murmuro as palavras e faço os gestos, sentindo a energia se acumular nas mãos.\""
];

const SPECIES = {
"Aasimar":{size:"Médio ou Pequeno",speed:9,traits:["Resistência a dano Necrótico e Radiante","Visão no Escuro (18m)",
  "Mãos Curativas: cura com d4s (nº igual ao Bônus de Proficiência), 1x por Descanso Longo","No nível 3, pode se transformar temporariamente (asas, manto ou luz radiante)"]},
"Anão":{size:"Médio",speed:9,traits:["Visão no Escuro (36m)","Resistência a dano Venenoso e Vantagem contra a condição Envenenado",
  "Tenacidade Anã: PV máximo aumenta a cada nível","Conhecimento de Pedras: Sismiconsciência temporária tocando pedra"]},
"Draconato":{size:"Médio",speed:9,traits:["Herança Dracônica: escolha um tipo de dragão (define dano do sopro/resistência)",
  "Ataque de Sopro em cone ou linha, com salvaguarda de Destreza","Resistência ao tipo de dano da sua herança","Visão no Escuro (18m)","No nível 5, ganha voo temporário"]},
"Elfo":{size:"Médio",speed:9,traits:["Visão no Escuro (18m)","Linhagem Élfica: escolha Alto Elfo, Drow ou Elfo Silvestre (cada uma dá truques/magias)",
  "Ancestralidade Feérica: Vantagem contra a condição Enfeitiçado","Transe: descansa 4h em vez de 8h"]},
"Gnomo":{size:"Pequeno",speed:9,traits:["Visão no Escuro (18m)","Astúcia de Gnomo: Vantagem em salvaguardas de Int/Sab/Car",
  "Linhagem Gnômica: Gnomo das Rochas (fabrica dispositivos) ou Gnomo do Bosque (Ilusão Menor + Falar com Animais)"]},
"Golias":{size:"Médio",speed:10.5,traits:["Ancestralidade Gigante: escolha um poder ligado a um tipo de gigante (gelo, fogo, pedra, nuvem, colina ou tempestade)",
  "Forma Grande no nível 5: fica Grande temporariamente com Vantagem em testes de Força","Porte Poderoso: Vantagem para encerrar Imobilizado"]},
"Humano":{size:"Médio ou Pequeno",speed:9,traits:["Eficiente: ganha Inspiração Heroica a cada Descanso Longo",
  "Hábil: proficiência extra em uma perícia à escolha","Versátil: ganha um Talento de Origem à escolha"]},
"Orc":{size:"Médio",speed:9,traits:["Visão no Escuro (36m)","Pico de Adrenalina: Correr como Ação Bônus, ganhando PV temporários",
  "Vigor Implacável: ao cair a 0 PV, fica com 1 PV em vez de morrer (1x por Descanso Longo)"]},
"Pequenino":{size:"Pequeno",speed:9,traits:["Corajoso: Vantagem contra a condição Amedrontado","Agilidade Pequenina: pode passar pelo espaço de criaturas maiores",
  "Sorte: reroll obrigatório ao tirar 1 no d20","Furtividade Natural: pode se Esconder atrás de uma criatura maior"]},
"Tiferino":{size:"Médio ou Pequeno",speed:9,traits:["Visão no Escuro (18m)","Legado Ínfero: escolha Abissal, Ctônico ou Infernal (cada um dá truques/magias)",
  "Presença Sobrenatural: conhece o truque Taumaturgia"]}
};

const BACKGROUNDS = {
"Acólito":{attrs:["Inteligência","Sabedoria","Carisma"],talent:"Iniciado em Magia (Clérigo)",skills:["Intuição","Religião"],tool:"Suprimentos de Calígrafo"},
"Andarilho":{attrs:["Destreza","Sabedoria","Carisma"],talent:"Sortudo",skills:["Furtividade","Intuição"],tool:"Ferramentas de Ladrão"},
"Artesão":{attrs:["Força","Destreza","Inteligência"],talent:"Artifista",skills:["Investigação","Persuasão"],tool:"Ferramentas de Artesão (à escolha)"},
"Artista":{attrs:["Força","Destreza","Carisma"],talent:"Músico",skills:["Acrobacia","Atuação"],tool:"Instrumento Musical (à escolha)"},
"Charlatão":{attrs:["Destreza","Constituição","Carisma"],talent:"Habilidoso",skills:["Enganação","Prestidigitação"],tool:"Kit de Falsificação"},
"Criminoso":{attrs:["Destreza","Constituição","Inteligência"],talent:"Alerta",skills:["Furtividade","Prestidigitação"],tool:"Ferramentas de Ladrão"},
"Eremita":{attrs:["Constituição","Sabedoria","Carisma"],talent:"Curandeiro",skills:["Medicina","Religião"],tool:"Kit de Herbalismo"},
"Escriba":{attrs:["Destreza","Inteligência","Sabedoria"],talent:"Habilidoso",skills:["Investigação","Percepção"],tool:"Suprimentos de Calígrafo"},
"Fazendeiro":{attrs:["Força","Constituição","Sabedoria"],talent:"Vigoroso",skills:["Lidar com Animais","Natureza"],tool:"Ferramentas de Carpinteiro"},
"Guarda":{attrs:["Força","Inteligência","Sabedoria"],talent:"Alerta",skills:["Atletismo","Percepção"],tool:"Kit de Jogos (à escolha)"},
"Guia":{attrs:["Destreza","Constituição","Sabedoria"],talent:"Iniciado em Magia (Druida)",skills:["Furtividade","Sobrevivência"],tool:"Ferramentas de Cartógrafo"},
"Marinheiro":{attrs:["Força","Destreza","Sabedoria"],talent:"Valentão de Taverna",skills:["Acrobacia","Percepção"],tool:"Ferramentas de Navegador"},
"Mercador":{attrs:["Constituição","Inteligência","Carisma"],talent:"Sortudo",skills:["Lidar com Animais","Persuasão"],tool:"Ferramentas de Navegador"},
"Nobre":{attrs:["Força","Inteligência","Carisma"],talent:"Habilidoso",skills:["História","Persuasão"],tool:"Kit de Jogos (à escolha)"},
"Sábio":{attrs:["Constituição","Inteligência","Sabedoria"],talent:"Iniciado em Magia (Mago)",skills:["Arcanismo","História"],tool:"Suprimentos de Calígrafo"},
"Soldado":{attrs:["Força","Destreza","Constituição"],talent:"Atacante Selvagem",skills:["Atletismo","Intimidação"],tool:"Kit de Jogos (à escolha)"}
};

const XP_TABLE = [
 {lvl:1,xp:0,prof:2},{lvl:2,xp:300,prof:2},{lvl:3,xp:900,prof:2},{lvl:4,xp:2700,prof:2},
 {lvl:5,xp:6500,prof:3},{lvl:6,xp:14000,prof:3},{lvl:7,xp:23000,prof:3},{lvl:8,xp:34000,prof:3},
 {lvl:9,xp:48000,prof:4},{lvl:10,xp:64000,prof:4},{lvl:11,xp:85000,prof:4},{lvl:12,xp:100000,prof:4},
 {lvl:13,xp:120000,prof:5},{lvl:14,xp:140000,prof:5},{lvl:15,xp:165000,prof:5},{lvl:16,xp:195000,prof:5},
 {lvl:17,xp:225000,prof:6},{lvl:18,xp:265000,prof:6},{lvl:19,xp:305000,prof:6},{lvl:20,xp:355000,prof:6}
];

const HD_FIXED = {12:7,10:6,8:5,6:4}; // valor fixo de PV por nível (além do nível 1) = média + mínimo... na verdade fórmula: metade do dado +1 arredondado pra baixo +1
const ALL_SKILLS = ["Acrobacia","Arcanismo","Atletismo","Atuação","Enganação","Furtividade","História",
 "Intimidação","Intuição","Investigação","Lidar com Animais","Medicina","Natureza","Percepção",
 "Persuasão","Prestidigitação","Religião","Sobrevivência"];
const SKILL_ATTR = {Acrobacia:"DES",Arcanismo:"INT",Atletismo:"FOR",Atuação:"CAR",Enganação:"CAR",Furtividade:"DES",
 História:"INT","Intimidação":"CAR",Intuição:"SAB",Investigação:"INT","Lidar com Animais":"SAB",Medicina:"SAB",
 Natureza:"INT",Percepção:"SAB",Persuasão:"CAR",Prestidigitação:"DES",Religião:"INT",Sobrevivência:"SAB"};
const POINT_COST = {8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};

function mod(v){ return Math.floor((v-10)/2); }
function fmtMod(m){ return (m>=0?"+":"")+m; }
function profBonus(lvl){ return XP_TABLE.find(r=>lvl>=r.lvl && (r.lvl===20||lvl<XP_TABLE[XP_TABLE.indexOf(r)+1]?.lvl))?.prof || (XP_TABLE.slice().reverse().find(r=>lvl>=r.lvl)||XP_TABLE[0]).prof; }
function getProf(lvl){ let r=XP_TABLE.slice().reverse().find(r=>lvl>=r.lvl); return r?r.prof:2; }


function rollDado(sides, modificador, resId, label){
  const el = document.getElementById(resId);
  if(!el) return;
  let n = 0;
  el.classList.add('rolling');
  const iv = setInterval(()=>{
    el.textContent = '🎲 ' + (Math.floor(Math.random()*sides)+1);
    n++;
    if(n>=8){
      clearInterval(iv);
      const final = Math.floor(Math.random()*sides)+1;
      const total = final + modificador;
      el.textContent = `🎲 ${final}${modificador?' '+fmtMod(modificador):''} = ${total}`;
      el.classList.remove('rolling');
    }
  }, 55);
}
