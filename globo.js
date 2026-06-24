// ============================================================
// globo.js — AquaVida
// Otimizações aplicadas:
//  1. GeoJSON local (105KB TopoJSON vs 23MB antigo)
//  2. Cores pré-computadas em cache — zero recálculo por frame
//  3. Sem animação de altitude no hover — elimina re-render de 250 polígonos
//  4. Hover debounced a 16ms (1 frame)
//  5. Tooltip custom sem polygonLabel do globe.gl
// ============================================================

// ---- Mapeamento ISO 3166-1 numérico → ISO3 ----
// Necessário porque world-atlas usa IDs numéricos
const numToISO = {
  76:'BRA', 32:'ARG', 170:'COL', 484:'MEX', 152:'CHL', 604:'PER',
  218:'ECU', 68:'BOL', 600:'PRY', 858:'URY', 862:'VEN', 188:'CRI',
  591:'PAN', 332:'HTI', 840:'USA', 124:'CAN', 320:'GTM', 340:'HND',
  192:'CUB', 214:'DOM', 188:'CRI', 214:'DOM',
  276:'DEU', 250:'FRA', 826:'GBR', 724:'ESP', 380:'ITA', 620:'PRT',
  528:'NLD', 752:'SWE', 578:'NOR', 756:'CHE', 616:'POL', 642:'ROU',
  804:'UKR', 643:'RUS', 112:'BLR',
  156:'CHN', 392:'JPN', 410:'KOR', 360:'IDN', 608:'PHL', 704:'VNM',
  764:'THA', 458:'MYS', 702:'SGP', 116:'KHM', 104:'MMR', 496:'MNG',
  356:'IND', 586:'PAK', 50:'BGD', 524:'NPL', 4:'AFG', 144:'LKA',
  682:'SAU', 887:'YEM', 364:'IRN', 368:'IRQ', 792:'TUR', 400:'JOR',
  376:'ISR', 784:'ARE', 414:'KWT', 512:'OMN',
  398:'KAZ', 860:'UZB', 762:'TJK', 417:'KGZ', 795:'TKM',
  818:'EGY', 504:'MAR', 12:'DZA', 788:'TUN', 434:'LBY', 729:'SDN',
  566:'NGA', 231:'ETH', 180:'COD', 834:'TZA', 404:'KEN', 288:'GHA',
  710:'ZAF', 508:'MOZ', 728:'SSD', 140:'CAF', 706:'SOM', 894:'ZMB',
  24:'AGO', 562:'NER', 148:'TCD', 466:'MLI', 36:'AUS', 554:'NZL', 598:'PNG',
  800:'UGA', 646:'RWA', 174:'COM', 450:'MDG', 516:'NAM', 72:'BWA',
  716:'ZWE', 686:'SEN', 324:'GIN', 288:'GHA', 288:'GHA'
};

// ---- Dados de água por país ----
const dados = {
  BRA: { nome:'Brasil',          aguaSegura:87, saneamento:56,  semAgua:'28 milhões', resumo:'O Brasil enfrenta profunda desigualdade regional. Enquanto áreas urbanas têm cobertura razoável, comunidades rurais, ribeirinhas e periferias ainda carecem de água tratada e esgoto. Segundo o SNIS 2022, apenas 56% da população tem coleta de esgoto.',                             fonte:'SNIS 2022 / JMP WHO-UNICEF 2022' },
  ARG: { nome:'Argentina',       aguaSegura:90, saneamento:91,  semAgua:'4,4 milhões', resumo:'A Argentina tem boa cobertura urbana, mas regiões como o Norte e o Chaco ainda enfrentam déficits significativos de saneamento e qualidade da água em comunidades rurais.',                                                                                                                fonte:'JMP WHO-UNICEF 2022' },
  COL: { nome:'Colômbia',        aguaSegura:91, saneamento:86,  semAgua:'4,5 milhões', resumo:'A Colômbia avançou na cobertura urbana, mas áreas rurais e comunidades indígenas ainda sofrem com escassez hídrica. A poluição de rios por garimpo ilegal e agropecuária é crescente.',                                                                                                  fonte:'JMP WHO-UNICEF 2022' },
  MEX: { nome:'México',          aguaSegura:89, saneamento:73,  semAgua:'13 milhões',  resumo:'O México tem cobertura elevada nas cidades, mas 13 milhões vivem sem acesso adequado. A Cidade do México enfrenta crise hídrica severa — extrai mais água do que seu lençol freático pode repor.',                                                                                         fonte:'JMP WHO-UNICEF 2022' },
  CHL: { nome:'Chile',           aguaSegura:96, saneamento:99,  semAgua:'700 mil',     resumo:'O Chile tem uma das melhores coberturas da América do Sul, mas enfrenta seca prolongada no centro-norte. Algumas cidades já dependem de caminhões-pipa para abastecimento.',                                                                                                                fonte:'JMP WHO-UNICEF 2022' },
  PER: { nome:'Peru',            aguaSegura:88, saneamento:72,  semAgua:'3,6 milhões', resumo:'Apesar das melhorias nas cidades, comunidades andinas e amazônicas ainda carecem de serviços básicos. O derretimento de geleiras ameaça o abastecimento futuro de cidades como Lima.',                                                                                                     fonte:'JMP WHO-UNICEF 2022' },
  ECU: { nome:'Equador',         aguaSegura:83, saneamento:74,  semAgua:'2,8 milhões', resumo:'O Equador avançou na cobertura urbana, mas comunidades indígenas e rurais ainda enfrentam acesso precário. Contaminação por petróleo na Amazônia é um problema persistente.',                                                                                                               fonte:'JMP WHO-UNICEF 2022' },
  BOL: { nome:'Bolívia',         aguaSegura:72, saneamento:50,  semAgua:'3,4 milhões', resumo:'Glaciares andinos que abastecem cidades como La Paz estão em retração acelerada, ameaçando o fornecimento de água. A Bolívia enfrenta um dos piores cenários de segurança hídrica da América do Sul.',                                                                                     fonte:'JMP WHO-UNICEF 2022' },
  PRY: { nome:'Paraguai',        aguaSegura:84, saneamento:80,  semAgua:'1,1 milhão',  resumo:'O Paraguai tem acesso razoável, mas a qualidade da água em áreas rurais e a cobertura de saneamento precisam melhorar. O Rio Paraguai enfrenta poluição crescente por agronegócio.',                                                                                                        fonte:'JMP WHO-UNICEF 2022' },
  URY: { nome:'Uruguai',         aguaSegura:99, saneamento:97,  semAgua:'20 mil',      resumo:'O Uruguai tem uma das melhores coberturas da América Latina, com acesso quase universal. Em 2023, uma seca severa fez o cloro no abastecimento de Montevidéu subir acima do recomendado.',                                                                                                 fonte:'JMP WHO-UNICEF 2022' },
  VEN: { nome:'Venezuela',       aguaSegura:93, saneamento:93,  semAgua:'2,2 milhões', resumo:'A crise econômica deteriorou seriamente a infraestrutura hídrica. Cortes de água são frequentes nas principais cidades. Em bairros populares de Caracas, a água chega apenas alguns dias por semana.',                                                                                       fonte:'JMP WHO-UNICEF 2022' },
  CRI: { nome:'Costa Rica',      aguaSegura:97, saneamento:95,  semAgua:'120 mil',     resumo:'A Costa Rica é referência regional com alta cobertura hídrica, impulsionada por políticas de conservação florestal que protegem mananciais. É o único país tropical com mais de 50% de florestas.',                                                                                          fonte:'JMP WHO-UNICEF 2022' },
  PAN: { nome:'Panamá',          aguaSegura:94, saneamento:77,  semAgua:'230 mil',     resumo:'O Canal do Panamá depende do Rio Chagres para funcionar e abastecer 2 milhões de pessoas. A seca de 2023–24 forçou restrições severas de trânsito no Canal, impactando o comércio global.',                                                                                                fonte:'JMP WHO-UNICEF 2022' },
  HTI: { nome:'Haiti',           aguaSegura:53, saneamento:34,  semAgua:'5,3 milhões', resumo:'O Haiti enfrenta grave crise hídrica. É o país mais pobre das Américas, com mais da metade da população sem acesso à água potável segura. Surtos de cólera ainda ocorrem.',                                                                                                                 fonte:'JMP WHO-UNICEF 2022' },
  USA: { nome:'Estados Unidos',  aguaSegura:99, saneamento:99,  semAgua:'500 mil',     resumo:'Os EUA têm cobertura elevada, mas contaminação por chumbo (crise de Flint, Michigan), poluição de aquíferos e seca no Oeste ameaçam a segurança hídrica de milhões.',                                                                                                                      fonte:'JMP WHO-UNICEF 2022' },
  CAN: { nome:'Canadá',          aguaSegura:99, saneamento:99,  semAgua:'100 mil',     resumo:'O Canadá possui as maiores reservas de água doce do mundo, mas comunidades indígenas ainda sofrem com avisos prolongados de não beber a água da torneira — algumas por mais de 25 anos consecutivos.',                                                                                        fonte:'JMP WHO-UNICEF 2022' },
  GTM: { nome:'Guatemala',       aguaSegura:81, saneamento:56,  semAgua:'3,3 milhões', resumo:'Comunidades indígenas maias no altiplano sofrem com falta de água tratada e saneamento. Contaminação por agrotóxicos em rios é crescente.',                                                                                                                                                  fonte:'JMP WHO-UNICEF 2022' },
  HND: { nome:'Honduras',        aguaSegura:80, saneamento:62,  semAgua:'1,9 milhão',  resumo:'Honduras tem cobertura desigual, com áreas rurais e bairros informais das cidades enfrentando escassez grave. O desmatamento acelerado destrói mananciais.',                                                                                                                                 fonte:'JMP WHO-UNICEF 2022' },
  CUB: { nome:'Cuba',            aguaSegura:94, saneamento:91,  semAgua:'600 mil',     resumo:'Cuba tem boa cobertura básica, mas a infraestrutura envelhecida gera interrupções. A seca de 2024 foi a mais severa em décadas, afetando Havana.',                                                                                                                                           fonte:'JMP WHO-UNICEF 2022' },
  DOM: { nome:'Rep. Dominicana', aguaSegura:86, saneamento:86,  semAgua:'1,3 milhão',  resumo:'A República Dominicana avançou na cobertura, mas qualidade da água e gerenciamento de resíduos hídricos ainda são desafios em assentamentos informais.',                                                                                                                                     fonte:'JMP WHO-UNICEF 2022' },
  DEU: { nome:'Alemanha',        aguaSegura:99, saneamento:99,  semAgua:'0',           resumo:'A Alemanha tem acesso universal e padrões rigorosos de qualidade. Lidera em tecnologias de eficiência hídrica. A seca de 2018–2020 foi a mais severa em 500 anos.',                                                                                                                          fonte:'JMP WHO-UNICEF 2022' },
  FRA: { nome:'França',          aguaSegura:99, saneamento:99,  semAgua:'0',           resumo:'A França possui acesso universal. A seca de 2022 foi a mais severa em décadas, secando rios e gerando apagões nas usinas nucleares que dependem de água para resfriamento.',                                                                                                                  fonte:'JMP WHO-UNICEF 2022' },
  GBR: { nome:'Reino Unido',     aguaSegura:99, saneamento:99,  semAgua:'0',           resumo:'O Reino Unido tem acesso universal, mas em 2023 empresas de água foram multadas por lançar bilhões de litros de esgoto não tratado em rios e praias.',                                                                                                                                        fonte:'JMP WHO-UNICEF 2022' },
  ESP: { nome:'Espanha',         aguaSegura:99, saneamento:99,  semAgua:'0',           resumo:'A Espanha tem acesso universal, mas a seca crônica no sul e leste ameaça o abastecimento. Barcelona chegou a importar água por navio. Conflitos entre regiões pela água são frequentes.',                                                                                                     fonte:'JMP WHO-UNICEF 2022' },
  ITA: { nome:'Itália',          aguaSegura:99, saneamento:99,  semAgua:'0',           resumo:'A Itália tem acesso universal, mas perde até 42% da água tratada por vazamentos na rede pública — uma das piores taxas da Europa.',                                                                                                                                                           fonte:'JMP WHO-UNICEF 2022' },
  PRT: { nome:'Portugal',        aguaSegura:99, saneamento:99,  semAgua:'0',           resumo:'Portugal tem acesso universal, mas enfrenta secas crescentes no Alentejo e Algarve. Em 2023, os principais reservatórios do sul estavam abaixo de 40% da capacidade.',                                                                                                                        fonte:'JMP WHO-UNICEF 2022' },
  NLD: { nome:'Países Baixos',   aguaSegura:99, saneamento:99,  semAgua:'0',           resumo:'Referência mundial em gestão hídrica. Dois terços do país estão abaixo do nível do mar — o controle da água é questão de sobrevivência nacional.',                                                                                                                                            fonte:'JMP WHO-UNICEF 2022' },
  SWE: { nome:'Suécia',          aguaSegura:99, saneamento:99,  semAgua:'0',           resumo:'A Suécia tem acesso universal e é um dos países mais avançados em sustentabilidade hídrica e reciclagem de água.',                                                                                                                                                                            fonte:'JMP WHO-UNICEF 2022' },
  NOR: { nome:'Noruega',         aguaSegura:99, saneamento:99,  semAgua:'0',           resumo:'A Noruega tem imensos recursos hídricos e acesso universal de altíssima qualidade. Sua energia hidrelétrica abastece quase 100% da eletricidade do país.',                                                                                                                                    fonte:'JMP WHO-UNICEF 2022' },
  CHE: { nome:'Suíça',           aguaSegura:99, saneamento:99,  semAgua:'0',           resumo:'A Suíça abriga grandes reservas nos Alpes que abastecem parte da Europa. Tem os mais altos padrões de qualidade de água do mundo.',                                                                                                                                                           fonte:'JMP WHO-UNICEF 2022' },
  POL: { nome:'Polônia',         aguaSegura:97, saneamento:98,  semAgua:'600 mil',     resumo:'A Polônia tem boa cobertura, mas enfrenta poluição severa de rios por agropecuária. Em 2022, o Rio Óder teve mortandade massiva de peixes por algas tóxicas.',                                                                                                                                fonte:'JMP WHO-UNICEF 2022' },
  ROU: { nome:'Romênia',         aguaSegura:87, saneamento:77,  semAgua:'2,6 milhões', resumo:'A Romênia é um dos países da UE com maior déficit hídrico. Comunidades rurais ainda carecem de acesso à água encanada.',                                                                                                                                                                     fonte:'JMP WHO-UNICEF 2022' },
  UKR: { nome:'Ucrânia',         aguaSegura:95, saneamento:72,  semAgua:'2 milhões',   resumo:'O conflito com a Rússia destruiu infraestruturas hídricas. A destruição da barragem de Kakhovka em 2023 causou inundações catastróficas.',                                                                                                                                                    fonte:'JMP WHO-UNICEF 2022' },
  RUS: { nome:'Rússia',          aguaSegura:91, saneamento:79,  semAgua:'13 milhões',  resumo:'A Rússia possui as maiores reservas de água doce do mundo (o Lago Baikal tem 20% do total global), mas muitas regiões rurais carecem de água segura.',                                                                                                                                        fonte:'JMP WHO-UNICEF 2022' },
  CHN: { nome:'China',           aguaSegura:95, saneamento:75,  semAgua:'70 milhões',  resumo:'A China fez avanços enormes no acesso à água, mas 70 milhões ainda carecem de serviço seguro. O norte sofre grave escassez. O projeto "Desvio Sul-Norte" é o maior de engenharia hídrica do mundo.',                                                                                          fonte:'JMP WHO-UNICEF 2022' },
  JPN: { nome:'Japão',           aguaSegura:99, saneamento:99,  semAgua:'0',           resumo:'O Japão tem acesso universal e tecnologia hídrica avançada. Após Fukushima, 1 milhão de toneladas de água contaminada radioativamente foram lançadas no Pacífico em 2023.',                                                                                                                   fonte:'JMP WHO-UNICEF 2022' },
  KOR: { nome:'Coreia do Sul',   aguaSegura:99, saneamento:99,  semAgua:'0',           resumo:'A Coreia do Sul tem acesso universal e investe em tecnologias avançadas de reúso de água. A Coreia do Norte, vizinha, enfrenta situação radicalmente oposta.',                                                                                                                                fonte:'JMP WHO-UNICEF 2022' },
  IDN: { nome:'Indonésia',       aguaSegura:83, saneamento:72,  semAgua:'45 milhões',  resumo:'A Indonésia tem grandes disparidades entre ilhas. Jacarta afunda até 25 cm por ano por extração excessiva de águas subterrâneas — motivando a mudança da capital para Nusantara.',                                                                                                            fonte:'JMP WHO-UNICEF 2022' },
  PHL: { nome:'Filipinas',       aguaSegura:94, saneamento:74,  semAgua:'6 milhões',   resumo:'As Filipinas têm boa cobertura nas cidades, mas saneamento é precário em áreas rurais. Manila enfrenta escassez periódica.',                                                                                                                                                                  fonte:'JMP WHO-UNICEF 2022' },
  VNM: { nome:'Vietnã',          aguaSegura:95, saneamento:79,  semAgua:'4,8 milhões', resumo:'O Vietnã avançou rapidamente, mas enfrenta poluição grave no delta do Mekong e intrusão salina nas regiões costeiras.',                                                                                                                                                                       fonte:'JMP WHO-UNICEF 2022' },
  THA: { nome:'Tailândia',       aguaSegura:97, saneamento:85,  semAgua:'2 milhões',   resumo:'A Tailândia tem boa cobertura urbana, mas enfrenta contaminação de aquíferos por arsênio e poluição de rios por indústria têxtil.',                                                                                                                                                           fonte:'JMP WHO-UNICEF 2022' },
  MYS: { nome:'Malásia',         aguaSegura:97, saneamento:82,  semAgua:'900 mil',     resumo:'A Malásia tem cobertura elevada, mas enfrenta poluição de rios por plantações de dendê e desmatamento.',                                                                                                                                                                                     fonte:'JMP WHO-UNICEF 2022' },
  SGP: { nome:'Singapura',       aguaSegura:100,saneamento:100, semAgua:'0',           resumo:'Singapura é referência mundial. Sem rios permanentes, recicla 100% do esgoto em água potável (NEWater). É o único país do mundo a atingir 100% em água segura.',                                                                                                                              fonte:'JMP WHO-UNICEF 2022' },
  KHM: { nome:'Camboja',         aguaSegura:77, saneamento:54,  semAgua:'4,1 milhões', resumo:'O Camboja tem cobertura limitada em comunidades rurais. O Lago Tonle Sap, vital para abastecimento, encolhe dramaticamente em épocas de seca.',                                                                                                                                               fonte:'JMP WHO-UNICEF 2022' },
  MMR: { nome:'Myanmar',         aguaSegura:82, saneamento:64,  semAgua:'9,7 milhões', resumo:'Myanmar enfrenta desigualdades severas. O golpe de 2021 prejudicou seriamente os serviços de água e saneamento nas zonas de conflito.',                                                                                                                                                       fonte:'JMP WHO-UNICEF 2022' },
  MNG: { nome:'Mongólia',        aguaSegura:83, saneamento:67,  semAgua:'500 mil',     resumo:'A Mongólia enfrenta escassez em expansão com o avanço do deserto de Gobi. Pastores nômades percorrem dezenas de quilômetros em busca de água.',                                                                                                                                               fonte:'JMP WHO-UNICEF 2022' },
  IND: { nome:'Índia',           aguaSegura:93, saneamento:60,  semAgua:'100 milhões', resumo:'A Índia é o segundo maior desafio hídrico do mundo. 163 milhões vivem em zonas com estresse hídrico severo. Chennai ficou sem água em 2019.',                                                                                                                                                 fonte:'JMP WHO-UNICEF 2022' },
  PAK: { nome:'Paquistão',       aguaSegura:87, saneamento:58,  semAgua:'24 milhões',  resumo:'O Paquistão enfrenta crise hídrica grave. As inundações de 2022 destruíram infraestruturas e contaminaram fontes de água, deixando 1/3 do país submerso.',                                                                                                                                    fonte:'JMP WHO-UNICEF 2022' },
  BGD: { nome:'Bangladesh',      aguaSegura:98, saneamento:59,  semAgua:'25 milhões',  resumo:'Bangladesh tem alta cobertura, mas enfrenta grave contaminação por arsênio nos poços tubulares, afetando mais de 20 milhões de pessoas.',                                                                                                                                                     fonte:'JMP WHO-UNICEF 2022' },
  NPL: { nome:'Nepal',           aguaSegura:88, saneamento:69,  semAgua:'3,5 milhões', resumo:'O Nepal depende de geleiras himalaias que abastecem rios vitais. O derretimento acelerado ameaça centenas de milhões de pessoas na região.',                                                                                                                                                  fonte:'JMP WHO-UNICEF 2022' },
  AFG: { nome:'Afeganistão',     aguaSegura:67, saneamento:35,  semAgua:'12 milhões',  resumo:'O Afeganistão enfrenta uma das piores crises hídricas do mundo, agravada por décadas de conflito. A situação se deteriorou com o retorno do Talibã em 2021.',                                                                                                                                 fonte:'JMP WHO-UNICEF 2022' },
  SAU: { nome:'Arábia Saudita',  aguaSegura:97, saneamento:100, semAgua:'1 milhão',    resumo:'A Arábia Saudita depende quase totalmente de dessalinização — é o maior produtor mundial. Os aquíferos fósseis estão se esgotando sem possibilidade de recarga.',                                                                                                                             fonte:'JMP WHO-UNICEF 2022' },
  YEM: { nome:'Iêmen',           aguaSegura:53, saneamento:33,  semAgua:'15 milhões',  resumo:'O Iêmen é um dos países com pior crise hídrica do mundo. A guerra destruiu 50% das instalações. Sanaa pode se tornar a primeira capital do mundo completamente sem água.',                                                                                                                    fonte:'JMP WHO-UNICEF 2022' },
  IRN: { nome:'Irã',             aguaSegura:97, saneamento:93,  semAgua:'3 milhões',   resumo:'O Irã enfrenta crise hídrica severa: 70% do território sofre com seca. O Lago Urmia perdeu 90% do volume. Protestos por falta de água já causaram mortes.',                                                                                                                                   fonte:'JMP WHO-UNICEF 2022' },
  IRQ: { nome:'Iraque',          aguaSegura:87, saneamento:72,  semAgua:'5,5 milhões', resumo:'O Iraque sofre com redução das vazões do Tigre e Eufrates causada por barragens turcas e iranianas. O Lago Hammar encolhe, gerando deslocamentos em massa.',                                                                                                                                  fonte:'JMP WHO-UNICEF 2022' },
  TUR: { nome:'Turquia',         aguaSegura:97, saneamento:97,  semAgua:'2 milhões',   resumo:'A Turquia controla as nascentes do Tigre e Eufrates com grandes barragens, gerando conflitos com Iraque e Síria. Istambul enfrenta seca crescente.',                                                                                                                                          fonte:'JMP WHO-UNICEF 2022' },
  JOR: { nome:'Jordânia',        aguaSegura:97, saneamento:96,  semAgua:'300 mil',     resumo:'A Jordânia é o segundo país mais pobre em água per capita do mundo. Recicla 91% do esgoto para irrigação.',                                                                                                                                                                                  fonte:'JMP WHO-UNICEF 2022' },
  ISR: { nome:'Israel',          aguaSegura:99, saneamento:99,  semAgua:'0',           resumo:'Israel é referência mundial: recicla 90% do esgoto para irrigação e lidera em dessalinização.',                                                                                                                                                                                              fonte:'JMP WHO-UNICEF 2022' },
  ARE: { nome:'Emirados Árabes', aguaSegura:99, saneamento:100, semAgua:'0',           resumo:'Os Emirados dependem totalmente de dessalinização. Sem rios ou lagos permanentes, são líderes mundiais em tecnologia de dessalinização.',                                                                                                                                                     fonte:'JMP WHO-UNICEF 2022' },
  KAZ: { nome:'Cazaquistão',     aguaSegura:91, saneamento:62,  semAgua:'1,5 milhão',  resumo:'O Cazaquistão sofreu a tragédia do Mar de Aral — um dos maiores desastres ambientais do século XX. Por desvio soviético para irrigação, o mar perdeu 90% do volume.',                                                                                                                         fonte:'JMP WHO-UNICEF 2022' },
  UZB: { nome:'Uzbequistão',     aguaSegura:97, saneamento:95,  semAgua:'1 milhão',    resumo:'O Uzbequistão foi o principal responsável pelo desastre do Mar de Aral. Iniciativas de restauração parcial estão em andamento.',                                                                                                                                                              fonte:'JMP WHO-UNICEF 2022' },
  EGY: { nome:'Egito',           aguaSegura:97, saneamento:79,  semAgua:'3 milhões',   resumo:'O Egito depende quase totalmente do Rio Nilo. A Grande Represa Renascentista (GERD) na Etiópia gera conflito diplomático grave.',                                                                                                                                                             fonte:'JMP WHO-UNICEF 2022' },
  MAR: { nome:'Marrocos',        aguaSegura:84, saneamento:77,  semAgua:'5,6 milhões', resumo:'O Marrocos enfrenta seca crescente. Investe em dessalinização e capta névoa nas montanhas do Atlas para abastecer comunidades rurais.',                                                                                                                                                        fonte:'JMP WHO-UNICEF 2022' },
  DZA: { nome:'Argélia',         aguaSegura:83, saneamento:90,  semAgua:'7,5 milhões', resumo:'A Argélia enfrenta crise hídrica crescente no norte e desertificação no sul. Depende fortemente de aquíferos fósseis do Saara.',                                                                                                                                                              fonte:'JMP WHO-UNICEF 2022' },
  TUN: { nome:'Tunísia',         aguaSegura:95, saneamento:90,  semAgua:'500 mil',     resumo:'A Tunísia tem cobertura razoável, mas enfrenta seca crescente e salinização de aquíferos costeiros.',                                                                                                                                                                                         fonte:'JMP WHO-UNICEF 2022' },
  LBY: { nome:'Líbia',           aguaSegura:89, saneamento:88,  semAgua:'700 mil',     resumo:'A Líbia depende do Grande Rio Artificial Man-Made, que extrai água fóssil do Saara. O conflito armado ameaça esta infraestrutura vital.',                                                                                                                                                     fonte:'JMP WHO-UNICEF 2022' },
  SDN: { nome:'Sudão',           aguaSegura:57, saneamento:23,  semAgua:'19 milhões',  resumo:'O Sudão enfrenta crise hídrica grave, agravada pela guerra civil de 2023. Mais de 40 milhões foram afetados pela destruição de infraestruturas.',                                                                                                                                             fonte:'JMP WHO-UNICEF 2022' },
  NGA: { nome:'Nigéria',         aguaSegura:60, saneamento:38,  semAgua:'82 milhões',  resumo:'A Nigéria tem 82 milhões sem acesso à água segura. Lagos, com 15 milhões de hab., sofre com escassez, poluição e inundações — uma das maiores crises hídricas urbanas do mundo.',                                                                                                             fonte:'JMP WHO-UNICEF 2022' },
  ETH: { nome:'Etiópia',         aguaSegura:42, saneamento:8,   semAgua:'66 milhões',  resumo:'A Etiópia tem uma das piores coberturas de saneamento do mundo. Construiu a maior barragem da África (GERD), gerando conflito com Egito e Sudão pelo Nilo Azul.',                                                                                                                             fonte:'JMP WHO-UNICEF 2022' },
  COD: { nome:'R. D. Congo',     aguaSegura:26, saneamento:6,   semAgua:'61 milhões',  resumo:'Paradoxo: o Congo tem o maior potencial hídrico da África com o Rio Congo, mas apenas 26% da população tem acesso à água potável segura.',                                                                                                                                                    fonte:'JMP WHO-UNICEF 2022' },
  TZA: { nome:'Tanzânia',        aguaSegura:50, saneamento:24,  semAgua:'30 milhões',  resumo:'A Tanzânia, lar do Kilimanjaro, tem metade da população sem água segura. As geleiras do Kilimanjaro deverão desaparecer até 2060.',                                                                                                                                                           fonte:'JMP WHO-UNICEF 2022' },
  KEN: { nome:'Quênia',          aguaSegura:57, saneamento:32,  semAgua:'22 milhões',  resumo:'O Quênia sofre com seca crescente. Nairobi tem racionamento severo. Comunidades pastorais percorrem dezenas de quilômetros em busca de água.',                                                                                                                                                fonte:'JMP WHO-UNICEF 2022' },
  GHA: { nome:'Gana',            aguaSegura:79, saneamento:23,  semAgua:'6,5 milhões', resumo:'Gana tem cobertura relativamente boa para a África Ocidental. O garimpo ilegal (galampsey) contamina rios com mercúrio, ameaçando o abastecimento de cidades.',                                                                                                                               fonte:'JMP WHO-UNICEF 2022' },
  ZAF: { nome:'África do Sul',   aguaSegura:91, saneamento:76,  semAgua:'5 milhões',   resumo:'A Cidade do Cabo quase atingiu o "Dia Zero" em 2018, quando os reservatórios chegaram a 13% da capacidade. Tornou-se referência mundial sobre gestão de seca urbana.',                                                                                                                        fonte:'JMP WHO-UNICEF 2022' },
  MOZ: { nome:'Moçambique',      aguaSegura:47, saneamento:23,  semAgua:'16 milhões',  resumo:'Moçambique é altamente vulnerável a ciclones tropicais. O Ciclone Idai (2019) destruiu infraestruturas hídricas para centenas de milhares.',                                                                                                                                                  fonte:'JMP WHO-UNICEF 2022' },
  SSD: { nome:'Sudão do Sul',    aguaSegura:33, saneamento:10,  semAgua:'8 milhões',   resumo:'O Sudão do Sul tem uma das piores crises hídricas e de saneamento do mundo, agravada por conflitos internos.',                                                                                                                                                                                fonte:'JMP WHO-UNICEF 2022' },
  CAF: { nome:'R. Centro-Africana', aguaSegura:37, saneamento:7,semAgua:'3 milhões',   resumo:'A República Centro-Africana está entre os países com menor acesso à água do mundo, agravado por conflito armado persistente.',                                                                                                                                                                fonte:'JMP WHO-UNICEF 2022' },
  SOM: { nome:'Somália',         aguaSegura:45, saneamento:23,  semAgua:'8,5 milhões', resumo:'A Somália enfrenta seca histórica. Em 2022, 4 anos de seca consecutivos causaram deslocamento de mais de 1 milhão de pessoas.',                                                                                                                                                               fonte:'JMP WHO-UNICEF 2022' },
  ZMB: { nome:'Zâmbia',          aguaSegura:62, saneamento:30,  semAgua:'6,7 milhões', resumo:'Em 2019, as Cataratas Vitória quase secaram completamente pela primeira vez na história registrada por seca severa no Zambeze.',                                                                                                                                                              fonte:'JMP WHO-UNICEF 2022' },
  AGO: { nome:'Angola',          aguaSegura:54, saneamento:30,  semAgua:'15 milhões',  resumo:'Angola tem vastos recursos hídricos, mas décadas de guerra destruíram as infraestruturas. Luanda, com 8 milhões de hab., tem fornecimento extremamente irregular.',                                                                                                                           fonte:'JMP WHO-UNICEF 2022' },
  NER: { nome:'Níger',           aguaSegura:47, saneamento:16,  semAgua:'12 milhões',  resumo:'O Lago Chade, que abastecia milhões no Níger e países vizinhos, perdeu 90% de seu volume desde 1960.',                                                                                                                                                                                       fonte:'JMP WHO-UNICEF 2022' },
  TCD: { nome:'Chade',           aguaSegura:42, saneamento:9,   semAgua:'9,5 milhões', resumo:'O Chade sofre com o desaparecimento do Lago Chade — fonte de água para 30 milhões de pessoas em 4 países.',                                                                                                                                                                                  fonte:'JMP WHO-UNICEF 2022' },
  MLI: { nome:'Mali',            aguaSegura:52, saneamento:20,  semAgua:'9,8 milhões', resumo:'O Mali enfrenta avanço do Saara, conflito armado e colapso de governança. O Rio Níger, vital para milhões, está contaminado e com vazão reduzida.',                                                                                                                                           fonte:'JMP WHO-UNICEF 2022' },
  AUS: { nome:'Austrália',       aguaSegura:99, saneamento:100, semAgua:'0',           resumo:'A Austrália é o continente habitado mais seco do mundo. Secas históricas, incêndios devastadores e ondas de calor extremas ameaçam o abastecimento.',                                                                                                                                         fonte:'JMP WHO-UNICEF 2022' },
  NZL: { nome:'Nova Zelândia',   aguaSegura:99, saneamento:100, semAgua:'0',           resumo:'A Nova Zelândia tem acesso universal, mas 60% dos rios avaliados estão impróprios para natação por excesso de nitrogênio e bactérias da pecuária intensiva.',                                                                                                                                 fonte:'JMP WHO-UNICEF 2022' },
  PNG: { nome:'Papua Nova Guiné',aguaSegura:37, saneamento:14,  semAgua:'5,7 milhões', resumo:'Apesar de abundantes chuvas tropicais, Papua Nova Guiné tem uma das piores coberturas de água tratada do mundo. Terreno acidentado e ausência de infraestrutura dificultam o acesso.',                                                                                                        fonte:'JMP WHO-UNICEF 2022' },
};

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================
function getISO(feat) {
  return numToISO[parseInt(feat.id, 10)] || '';
}

function getCorPorCobertura(pct) {
  if (pct == null)  return '#2e3f50';
  if (pct >= 95)    return '#1b5e20';
  if (pct >= 85)    return '#2e7d32';
  if (pct >= 70)    return '#e65100';
  if (pct >= 50)    return '#bf360c';
  return '#7f0000';
}

function getCorHover(pct) {
  if (pct == null)  return '#4a6380';
  if (pct >= 95)    return '#43a047';
  if (pct >= 85)    return '#66bb6a';
  if (pct >= 70)    return '#ffa726';
  if (pct >= 50)    return '#ff7043';
  return '#ef5350';
}

function getNivelTexto(pct) {
  if (pct == null)  return ['Sem dados',  'nivel-sem-dados'];
  if (pct >= 95)    return ['Excelente',  'nivel-otimo'];
  if (pct >= 85)    return ['Bom',        'nivel-bom'];
  if (pct >= 70)    return ['Moderado',   'nivel-moderado'];
  if (pct >= 50)    return ['Crítico',    'nivel-ruim'];
  return            ['Grave',             'nivel-critico'];
}

function getCorBarra(pct) {
  if (pct >= 85) return 'linear-gradient(90deg,#2e7d32,#66bb6a)';
  if (pct >= 70) return 'linear-gradient(90deg,#e65100,#ffa726)';
  if (pct >= 50) return 'linear-gradient(90deg,#b71c1c,#ef5350)';
  return          'linear-gradient(90deg,#7f0000,#c62828)';
}

// ============================================================
// GLOBO
// ============================================================
const wrapper    = document.querySelector('.globe-wrapper');
const loadingEl  = document.getElementById('globe-loading');
const painelEl   = document.getElementById('painel');
const painelNome = document.getElementById('painel-nome');
const painelNivel= document.getElementById('painel-nivel');
const painelCorpo= document.getElementById('painel-corpo');
const tooltipEl  = document.getElementById('tooltip-globo');

let hoveredId   = null;   // ISO3 do país em hover
let corCache    = {};     // ISO3 → cor pré-computada (preenchido após load)

const myGlobe = Globe({ animateIn: true })(document.getElementById('globeViz'))
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
  .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
  .width(wrapper.clientWidth)
  .height(wrapper.clientHeight)
  .showAtmosphere(true)
  .atmosphereColor('#1565c0')
  .atmosphereAltitude(0.15)
  .polygonAltitude(0.01);                    // altitude FIXA — sem re-render no hover

myGlobe.controls().autoRotate = true;
myGlobe.controls().autoRotateSpeed = 0.5;
wrapper.addEventListener('pointerdown', () => { myGlobe.controls().autoRotate = false; });

// Tooltip segue o mouse
wrapper.addEventListener('mousemove', e => {
  if (!tooltipEl.style.display || tooltipEl.style.display === 'none') return;
  tooltipEl.style.left = (e.clientX + 14) + 'px';
  tooltipEl.style.top  = (e.clientY - wrapper.getBoundingClientRect().top - 10) + 'px';
});

window.addEventListener('resize', () => {
  myGlobe.width(wrapper.clientWidth).height(wrapper.clientHeight);
});

// ---- Carrega TopoJSON LOCAL (105 KB) ----
fetch('paises.topo.json')
  .then(r => r.json())
  .then(topo => {
    // Converte TopoJSON → GeoJSON usando a lib topojson-client
    const geojson = topojson.feature(topo, topo.objects.countries);

    // Pré-computa as cores uma única vez
    geojson.features.forEach(f => {
      const iso = getISO(f);
      corCache[iso] = getCorPorCobertura(dados[iso]?.aguaSegura ?? null);
    });

    loadingEl.style.display = 'none';

    let hoverTimer = null;

    myGlobe
      .polygonsData(geojson.features)
      .polygonCapColor(f => {
        const iso = getISO(f);
        return iso === hoveredId ? getCorHover(dados[iso]?.aguaSegura ?? null) : (corCache[iso] || '#2e3f50');
      })
      .polygonSideColor(() => 'rgba(13,59,110,0.25)')
      .polygonStrokeColor(() => 'rgba(255,255,255,0.07)')
      .polygonLabel(() => '')               // desabilitado — tooltip custom é mais leve
      .onPolygonHover(feat => {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => {
          const iso = feat ? getISO(feat) : null;
          if (iso === hoveredId) return;     // sem mudança, não re-renderiza
          hoveredId = iso;
          myGlobe.polygonCapColor(f => {
            const i = getISO(f);
            return i === hoveredId ? getCorHover(dados[i]?.aguaSegura ?? null) : (corCache[i] || '#2e3f50');
          });
          if (feat && iso) {
            const d = dados[iso];
            tooltipEl.textContent = d ? d.nome : iso;
            tooltipEl.style.display = 'block';
          } else {
            tooltipEl.style.display = 'none';
          }
        }, 16);
      })
      .onPolygonClick(feat => {
        myGlobe.controls().autoRotate = false;
        const iso = getISO(feat);
        mostrarPainel(dados[iso] || null, iso);
      });
  })
  .catch(() => {
    loadingEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i><p>Erro ao carregar o mapa.</p>';
  });

// ============================================================
// PAINEL DE INFORMAÇÕES
// ============================================================
function mostrarPainel(d, iso) {
  painelEl.classList.add('ativo');
  painelNome.textContent = d ? d.nome : (iso || 'País');

  if (!d) {
    const [txt, cls] = getNivelTexto(null);
    painelNivel.textContent = txt;
    painelNivel.className   = 'painel-pais-nivel ' + cls;
    painelCorpo.innerHTML   = `
      <div class="painel-sem-dados">
        <i class="fa-solid fa-database"></i>
        <p>Dados detalhados não disponíveis para este país.<br>
        O mapa exibe dados do Relatório JMP WHO/UNICEF 2022.</p>
      </div>`;
    return;
  }

  const [nivelTxt, nivelCls] = getNivelTexto(d.aguaSegura);
  painelNivel.textContent = nivelTxt;
  painelNivel.className   = 'painel-pais-nivel ' + nivelCls;

  painelCorpo.innerHTML = `
    <div class="metrica">
      <div class="metrica-titulo"><i class="fa-solid fa-droplet"></i> Água Potável Segura</div>
      <div class="metrica-valor-linha">
        <span class="metrica-num">${d.aguaSegura}%</span>
        <div class="barra-fundo">
          <div class="barra-fill" id="barra-agua" style="width:0%;background:${getCorBarra(d.aguaSegura)}"></div>
        </div>
      </div>
      <div class="metrica-detalhe">da população com acesso a água gerida de forma segura</div>
    </div>
    <div class="metrica">
      <div class="metrica-titulo"><i class="fa-solid fa-toilet"></i> Saneamento Básico</div>
      <div class="metrica-valor-linha">
        <span class="metrica-num">${d.saneamento}%</span>
        <div class="barra-fundo">
          <div class="barra-fill" id="barra-san" style="width:0%;background:${getCorBarra(d.saneamento)}"></div>
        </div>
      </div>
      <div class="metrica-detalhe">da população com saneamento básico adequado</div>
    </div>
    ${d.semAgua !== '0' ? `
    <div class="metrica">
      <div class="metrica-titulo"><i class="fa-solid fa-person-drowning"></i> Sem acesso à água segura</div>
      <div style="font-size:1.8rem;font-weight:800;color:#ef5350">${d.semAgua}</div>
      <div class="metrica-detalhe">de pessoas sem acesso à água potável segura</div>
    </div>` : `
    <div class="metrica">
      <div class="metrica-titulo"><i class="fa-solid fa-circle-check"></i> Cobertura universal</div>
      <div style="font-size:0.9rem;color:#81c784">Acesso universal ou quase universal à água potável segura.</div>
    </div>`}
    <hr class="divisor">
    <p class="painel-resumo">${d.resumo}</p>
    <p class="painel-fonte"><i class="fa-solid fa-book"></i> Fonte: ${d.fonte}</p>
  `;

  // Anima as barras
  requestAnimationFrame(() => {
    setTimeout(() => {
      const ba = document.getElementById('barra-agua');
      const bs = document.getElementById('barra-san');
      if (ba) ba.style.width = d.aguaSegura + '%';
      if (bs) bs.style.width = d.saneamento + '%';
    }, 60);
  });
}

document.getElementById('btn-fechar-painel').addEventListener('click', () => {
  painelEl.classList.remove('ativo');
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') painelEl.classList.remove('ativo');
});
