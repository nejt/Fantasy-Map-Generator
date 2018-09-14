// Cultures-related data
  var defaultCultures = [], cultures = [], chain = {}, nameBases = [], nameBase = [], cultureTree;
  const vowels = "aeiouy";

// apply names data from localStorage if available
  function applyNamesData() {
    applyDefaultNamesData();
    defaultCultures = [
      {name:"Shwazen", color:"#b3b3b3", base:0},
      {name:"Angshire", color:"#fca463", base:1},
      {name:"Luari", color:"#99acfb", base:2},
      {name:"Tallian", color:"#a6d854", base:3},
      {name:"Toledi", color:"#ffd92f", base:4},
      {name:"Slovian", color:"#e5c494", base:5},
      {name:"Norse", color:"#dca3e4", base:6},
      {name:"Elladian", color:"#66c4a0", base:7},
      {name:"Latian", color:"#ff7174", base:8},
      {name:"Soomi", color:"#85c8fa", base:9},
      {name:"Koryo", color:"#578880", base:10},
      {name:"Hantzu", color:"#becb8d", base:11},
      {name:"Yamoto", color:"#ffd9da", base:12}
    ];
  }

  // apply default names data
  function applyDefaultNamesData() {
    nameBases = [                                                                   // min; max; mean; common
      {name: "German", method: "let-to-syl", min: 4, max: 11, d: "lt", m: 0.1},     // real: 3; 17; 8.6; 8
      {name: "English", method: "let-to-syl", min: 5, max: 10, d: "", m: 0.3},      // real: 4; 13; 7.9; 8
      {name: "French", method: "let-to-syl", min: 4, max: 10, d: "lns", m: 0.3},    // real: 3; 15; 7.6; 6
      {name: "Italian", method: "let-to-syl", min: 4, max: 11, d: "clrt", m: 0.2},  // real: 4; 14; 7.7; 7
      {name: "Castillian", method: "let-to-syl", min: 4, max: 10, d: "lr", m: 0},   // real: 2; 13; 7.5; 8
      {name: "Ruthenian", method: "let-to-syl", min: 4, max: 9, d: "", m: 0},       // real: 3; 12; 7.1; 7
      {name: "Nordic", method: "let-to-syl", min: 5, max: 9, d: "kln", m: 0.1},     // real: 3; 12; 7.5; 6
      {name: "Greek", method: "let-to-syl", min: 4, max: 10, d: "ls", m: 0.2},      // real: 3; 14; 7.1; 6
      {name: "Roman", method: "let-to-syl", min: 5, max: 10, d: "", m: 1},          // real: 3; 15; 8.0; 7
      {name: "Finnic", method: "let-to-syl", min: 3, max: 10, d: "aktu", m: 0},     // real: 3; 13; 7.5; 6
      {name: "Korean", method: "let-to-syl", min: 5, max: 10, d: "", m: 0},         // real: 3; 13; 6.8; 7
      {name: "Chinese", method: "let-to-syl", min: 5, max: 9, d: "", m: 0},         // real: 4; 11; 6.9; 6
      {name: "Japanese", method: "let-to-syl", min: 3, max: 9, d: "", m: 0}         // real: 2; 15; 6.8; 6
    ];
    nameBase = [
      ["Achern","Aichhalden","Aitern","Albbruck","Alpirsbach","Altensteig","Althengstett","Appenweier","Auggen","Wildbad","Badenen","Badenweiler","Baiersbronn","Ballrechten","Bellingen","Berghaupten","Bernau","Biberach","Biederbach","Binzen","Birkendorf","Birkenfeld","Bischweier","Blumberg","Bollen","Bollschweil","Bonndorf","Bosingen","Braunlingen","Breisach","Breisgau","Breitnau","Brigachtal","Buchenbach","Buggingen","Buhl","Buhlertal","Calw","Dachsberg","Dobel","Donaueschingen","Dornhan","Dornstetten","Dottingen","Dunningen","Durbach","Durrheim","Ebhausen","Ebringen","Efringen","Egenhausen","Ehrenkirchen","Ehrsberg","Eimeldingen","Eisenbach","Elzach","Elztal","Emmendingen","Endingen","Engelsbrand","Enz","Enzklosterle","Eschbronn","Ettenheim","Ettlingen","Feldberg","Fischerbach","Fischingen","Fluorn","Forbach","Freiamt","Freiburg","Freudenstadt","Friedenweiler","Friesenheim","Frohnd","Furtwangen","Gaggenau","Geisingen","Gengenbach","Gernsbach","Glatt","Glatten","Glottertal","Gorwihl","Gottenheim","Grafenhausen","Grenzach","Griesbach","Gutach","Gutenbach","Hag","Haiterbach","Hardt","Harmersbach","Hasel","Haslach","Hausach","Hausen","Hausern","Heitersheim","Herbolzheim","Herrenalb","Herrischried","Hinterzarten","Hochenschwand","Hofen","Hofstetten","Hohberg","Horb","Horben","Hornberg","Hufingen","Ibach","Ihringen","Inzlingen","Kandern","Kappel","Kappelrodeck","Karlsbad","Karlsruhe","Kehl","Keltern","Kippenheim","Kirchzarten","Konigsfeld","Krozingen","Kuppenheim","Kussaberg","Lahr","Lauchringen","Lauf","Laufenburg","Lautenbach","Lauterbach","Lenzkirch","Liebenzell","Loffenau","Loffingen","Lorrach","Lossburg","Mahlberg","Malsburg","Malsch","March","Marxzell","Marzell","Maulburg","Monchweiler","Muhlenbach","Mullheim","Munstertal","Murg","Nagold","Neubulach","Neuenburg","Neuhausen","Neuried","Neuweiler","Niedereschach","Nordrach","Oberharmersbach","Oberkirch","Oberndorf","Oberbach","Oberried","Oberwolfach","Offenburg","Ohlsbach","Oppenau","Ortenberg","otigheim","Ottenhofen","Ottersweier","Peterstal","Pfaffenweiler","Pfalzgrafenweiler","Pforzheim","Rastatt","Renchen","Rheinau","Rheinfelden","Rheinmunster","Rickenbach","Rippoldsau","Rohrdorf","Rottweil","Rummingen","Rust","Sackingen","Sasbach","Sasbachwalden","Schallbach","Schallstadt","Schapbach","Schenkenzell","Schiltach","Schliengen","Schluchsee","Schomberg","Schonach","Schonau","Schonenberg","Schonwald","Schopfheim","Schopfloch","Schramberg","Schuttertal","Schwenningen","Schworstadt","Seebach","Seelbach","Seewald","Sexau","Simmersfeld","Simonswald","Sinzheim","Solden","Staufen","Stegen","Steinach","Steinen","Steinmauern","Straubenhardt","Stuhlingen","Sulz","Sulzburg","Teinach","Tiefenbronn","Tiengen","Titisee","Todtmoos","Todtnau","Todtnauberg","Triberg","Tunau","Tuningen","uhlingen","Unterkirnach","Reichenbach","Utzenfeld","Villingen","Villingendorf","Vogtsburg","Vohrenbach","Waldachtal","Waldbronn","Waldkirch","Waldshut","Wehr","Weil","Weilheim","Weisenbach","Wembach","Wieden","Wiesental","Wildberg","Winzeln","Wittlingen","Wittnau","Wolfach","Wutach","Wutoschingen","Wyhlen","Zavelstein"],
      ["Abingdon","Albrighton","Alcester","Almondbury","Altrincham","Amersham","Andover","Appleby","Ashboume","Atherstone","Aveton","Axbridge","Aylesbury","Baldock","Bamburgh","Barton","Basingstoke","Berden","Bere","Berkeley","Berwick","Betley","Bideford","Bingley","Birmingham","Blandford","Blechingley","Bodmin","Bolton","Bootham","Boroughbridge","Boscastle","Bossinney","Bramber","Brampton","Brasted","Bretford","Bridgetown","Bridlington","Bromyard","Bruton","Buckingham","Bungay","Burton","Calne","Cambridge","Canterbury","Carlisle","Castleton","Caus","Charmouth","Chawleigh","Chichester","Chillington","Chinnor","Chipping","Chisbury","Cleobury","Clifford","Clifton","Clitheroe","Cockermouth","Coleshill","Combe","Congleton","Crafthole","Crediton","Cuddenbeck","Dalton","Darlington","Dodbrooke","Drax","Dudley","Dunstable","Dunster","Dunwich","Durham","Dymock","Exeter","Exning","Faringdon","Felton","Fenny","Finedon","Flookburgh","Fowey","Frampton","Gateshead","Gatton","Godmanchester","Grampound","Grantham","Guildford","Halesowen","Halton","Harbottle","Harlow","Hatfield","Hatherleigh","Haydon","Helston","Henley","Hertford","Heytesbury","Hinckley","Hitchin","Holme","Hornby","Horsham","Kendal","Kenilworth","Kilkhampton","Kineton","Kington","Kinver","Kirby","Knaresborough","Knutsford","Launceston","Leighton","Lewes","Linton","Louth","Luton","Lyme","Lympstone","Macclesfield","Madeley","Malborough","Maldon","Manchester","Manningtree","Marazion","Marlborough","Marshfield","Mere","Merryfield","Middlewich","Midhurst","Milborne","Mitford","Modbury","Montacute","Mousehole","Newbiggin","Newborough","Newbury","Newenden","Newent","Norham","Northleach","Noss","Oakham","Olney","Orford","Ormskirk","Oswestry","Padstow","Paignton","Penkneth","Penrith","Penzance","Pershore","Petersfield","Pevensey","Pickering","Pilton","Pontefract","Portsmouth","Preston","Quatford","Reading","Redcliff","Retford","Rockingham","Romney","Rothbury","Rothwell","Salisbury","Saltash","Seaford","Seasalter","Sherston","Shifnal","Shoreham","Sidmouth","Skipsea","Skipton","Solihull","Somerton","Southam","Southwark","Standon","Stansted","Stapleton","Stottesdon","Sudbury","Swavesey","Tamerton","Tarporley","Tetbury","Thatcham","Thaxted","Thetford","Thornbury","Tintagel","Tiverton","Torksey","Totnes","Towcester","Tregoney","Trematon","Tutbury","Uxbridge","Wallingford","Wareham","Warenmouth","Wargrave","Warton","Watchet","Watford","Wendover","Westbury","Westcheap","Weymouth","Whitford","Wickwar","Wigan","Wigmore","Winchelsea","Winkleigh","Wiscombe","Witham","Witheridge","Wiveliscombe","Woodbury","Yeovil"],
      ["Adon","Aillant","Amilly","Andonville","Ardon","Artenay","Ascheres","Ascoux","Attray","Aubin","Audeville","Aulnay","Autruy","Auvilliers","Auxy","Aveyron","Baccon","Bardon","Barville","Batilly","Baule","Bazoches","Beauchamps","Beaugency","Beaulieu","Beaune","Bellegarde","Boesses","Boigny","Boiscommun","Boismorand","Boisseaux","Bondaroy","Bonnee","Bonny","Bordes","Bou","Bougy","Bouilly","Boulay","Bouzonville","Bouzy","Boynes","Bray","Breteau","Briare","Briarres","Bricy","Bromeilles","Bucy","Cepoy","Cercottes","Cerdon","Cernoy","Cesarville","Chailly","Chaingy","Chalette","Chambon","Champoulet","Chanteau","Chantecoq","Chapell","Charme","Charmont","Charsonville","Chateau","Chateauneuf","Chatel","Chatenoy","Chatillon","Chaussy","Checy","Chevannes","Chevillon","Chevilly","Chevry","Chilleurs","Choux","Chuelles","Clery","Coinces","Coligny","Combleux","Combreux","Conflans","Corbeilles","Corquilleroy","Cortrat","Coudroy","Coullons","Coulmiers","Courcelles","Courcy","Courtemaux","Courtempierre","Courtenay","Cravant","Crottes","Dadonville","Dammarie","Dampierre","Darvoy","Desmonts","Dimancheville","Donnery","Dordives","Dossainville","Douchy","Dry","Echilleuses","Egry","Engenville","Epieds","Erceville","Ervauville","Escrennes","Escrignelles","Estouy","Faverelles","Fay","Feins","Ferolles","Ferrieres","Fleury","Fontenay","Foret","Foucherolles","Freville","Gatinais","Gaubertin","Gemigny","Germigny","Gidy","Gien","Girolles","Givraines","Gondreville","Grangermont","Greneville","Griselles","Guigneville","Guilly","Gyleslonains","Huetre","Huisseau","Ingrannes","Ingre","Intville","Isdes","Jargeau","Jouy","Juranville","Bussiere","Laas","Ladon","Lailly","Langesse","Leouville","Ligny","Lombreuil","Lorcy","Lorris","Loury","Louzouer","Malesherbois","Marcilly","Mardie","Mareau","Marigny","Marsainvilliers","Melleroy","Menestreau","Merinville","Messas","Meung","Mezieres","Migneres","Mignerette","Mirabeau","Montargis","Montbarrois","Montbouy","Montcresson","Montereau","Montigny","Montliard","Mormant","Morville","Moulinet","Moulon","Nancray","Nargis","Nesploy","Neuville","Neuvy","Nevoy","Nibelle","Nogent","Noyers","Ocre","Oison","Olivet","Ondreville","Onzerain","Orleans","Ormes","Orville","Oussoy","Outarville","Ouzouer","Pannecieres","Pannes","Patay","Paucourt","Pers","Pierrefitte","Pithiverais","Pithiviers","Poilly","Potier","Prefontaines","Presnoy","Pressigny","Puiseaux","Quiers","Ramoulu","Rebrechien","Rouvray","Rozieres","Rozoy","Ruan","Sandillon","Santeau","Saran","Sceaux","Seichebrieres","Semoy","Sennely","Sermaises","Sigloy","Solterre","Sougy","Sully","Sury","Tavers","Thignonville","Thimory","Thorailles","Thou","Tigy","Tivernon","Tournoisis","Trainou","Treilles","Trigueres","Trinay","Vannes","Varennes","Vennecy","Vieilles","Vienne","Viglain","Vignes","Villamblain","Villemandeur","Villemoutiers","Villemurlin","Villeneuve","Villereau","Villevoques","Villorceau","Vimory","Vitry","Vrigny","Ivre"],
      ["Accumoli","Acquafondata","Acquapendente","Acuto","Affile","Agosta","Alatri","Albano","Allumiere","Alvito","Amaseno","Amatrice","Anagni","Anguillara","Anticoli","Antrodoco","Anzio","Aprilia","Aquino","Arce","Arcinazzo","Ardea","Ariccia","Arlena","Arnara","Arpino","Arsoli","Artena","Ascrea","Atina","Ausonia","Bagnoregio","Barbarano","Bassano","Bassiano","Bellegra","Belmonte","Blera","Bolsena","Bomarzo","Borbona","Borgo","Borgorose","Boville","Bracciano","Broccostella","Calcata","Camerata","Campagnano","Campodimele","Campoli","Canale","Canepina","Canino","Cantalice","Cantalupo","Canterano","Capena","Capodimonte","Capranica","Caprarola","Carbognano","Casalattico","Casalvieri","Casape","Casaprota","Casperia","Cassino","Castelforte","Castelliri","Castello","Castelnuovo","Castiglione","Castro","Castrocielo","Cave","Ceccano","Celleno","Cellere","Ceprano","Cerreto","Cervara","Cervaro","Cerveteri","Ciampino","Ciciliano","Cineto","Cisterna","Cittaducale","Cittareale","Civita","Civitavecchia","Civitella","Colfelice","Collalto","Colle","Colleferro","Collegiove","Collepardo","Collevecchio","Colli","Colonna","Concerviano","Configni","Contigliano","Corchiano","Coreno","Cori","Cottanello","Esperia","Fabrica","Faleria","Falvaterra","Fara","Farnese","Ferentino","Fiamignano","Fiano","Filacciano","Filettino","Fiuggi","Fiumicino","Fondi","Fontana","Fonte","Fontechiari","Forano","Formello","Formia","Frascati","Frasso","Frosinone","Fumone","Gaeta","Gallese","Gallicano","Gallinaro","Gavignano","Genazzano","Genzano","Gerano","Giuliano","Gorga","Gradoli","Graffignano","Greccio","Grottaferrata","Grotte","Guarcino","Guidonia","Ischia","Isola","Itri","Jenne","Labico","Labro","Ladispoli","Lanuvio","Lariano","Latera","Lenola","Leonessa","Licenza","Longone","Lubriano","Maenza","Magliano","Mandela","Manziana","Marano","Marcellina","Marcetelli","Marino","Marta","Mazzano","Mentana","Micigliano","Minturno","Mompeo","Montalto","Montasola","Monte","Montebuono","Montefiascone","Monteflavio","Montelanico","Monteleone","Montelibretti","Montenero","Monterosi","Monterotondo","Montopoli","Montorio","Moricone","Morlupo","Morolo","Morro","Nazzano","Nemi","Nepi","Nerola","Nespolo","Nettuno","Norma","Olevano","Onano","Oriolo","Orte","Orvinio","Paganico","Palestrina","Paliano","Palombara","Pastena","Patrica","Percile","Pescorocchiano","Pescosolido","Petrella","Piansano","Picinisco","Pico","Piedimonte","Piglio","Pignataro","Pisoniano","Pofi","Poggio","Poli","Pomezia","Pontecorvo","Pontinia","Ponza","Ponzano","Posta","Pozzaglia","Priverno","Proceno","Prossedi","Riano","Rieti","Rignano","Riofreddo","Ripi","Rivodutri","Rocca","Roccagiovine","Roccagorga","Roccantica","Roccasecca","Roiate","Ronciglione","Roviano","Sabaudia","Sacrofano","Salisano","Sambuci","Santa","Santi","Santopadre","Saracinesco","Scandriglia","Segni","Selci","Sermoneta","Serrone","Settefrati","Sezze","Sgurgola","Sonnino","Sora","Soriano","Sperlonga","Spigno","Stimigliano","Strangolagalli","Subiaco","Supino","Sutri","Tarano","Tarquinia","Terelle","Terracina","Tessennano","Tivoli","Toffia","Tolfa","Torre","Torri","Torrice","Torricella","Torrita","Trevi","Trevignano","Trivigliano","Turania","Tuscania","Vacone","Valentano","Vallecorsa","Vallemaio","Vallepietra","Vallerano","Vallerotonda","Vallinfreda","Valmontone","Varco","Vasanello","Vejano","Velletri","Ventotene","Veroli","Vetralla","Vicalvi","Vico","Vicovaro","Vignanello","Viterbo","Viticuso","Vitorchiano","Vivaro","Zagarolo"],
      ["Abanades","Ablanque","Adobes","Ajofrin","Alameda","Alaminos","Alarilla","Albalate","Albares","Albarreal","Albendiego","Alcabon","Alcanizo","Alcaudete","Alcocer","Alcolea","Alcoroches","Aldea","Aldeanueva","Algar","Algora","Alhondiga","Alique","Almadrones","Almendral","Almoguera","Almonacid","Almorox","Alocen","Alovera","Alustante","Angon","Anguita","Anover","Anquela","Arbancon","Arbeteta","Arcicollar","Argecilla","Arges","Armallones","Armuna","Arroyo","Atanzon","Atienza","Aunon","Azuqueca","Azutan","Baides","Banos","Banuelos","Barcience","Bargas","Barriopedro","Belvis","Berninches","Borox","Brihuega","Budia","Buenaventura","Bujalaro","Burguillos","Burujon","Bustares","Cabanas","Cabanillas","Calera","Caleruela","Calzada","Camarena","Campillo","Camunas","Canizar","Canredondo","Cantalojas","Cardiel","Carmena","Carranque","Carriches","Casa","Casarrubios","Casas","Casasbuenas","Caspuenas","Castejon","Castellar","Castilforte","Castillo","Castilnuevo","Cazalegas","Cebolla","Cedillo","Cendejas","Centenera","Cervera","Checa","Chequilla","Chillaron","Chiloeches","Chozas","Chueca","Cifuentes","Cincovillas","Ciruelas","Ciruelos","Cobeja","Cobeta","Cobisa","Cogollor","Cogolludo","Condemios","Congostrina","Consuegra","Copernal","Corduente","Corral","Cuerva","Domingo","Dosbarrios","Driebes","Duron","El","Embid","Erustes","Escalona","Escalonilla","Escamilla","Escariche","Escopete","Espinosa","Espinoso","Esplegares","Esquivias","Estables","Estriegana","Fontanar","Fuembellida","Fuensalida","Fuentelsaz","Gajanejos","Galve","Galvez","Garciotum","Gascuena","Gerindote","Guadamur","Henche","Heras","Herreria","Herreruela","Hijes","Hinojosa","Hita","Hombrados","Hontanar","Hontoba","Horche","Hormigos","Huecas","Huermeces","Huerta","Hueva","Humanes","Illan","Illana","Illescas","Iniestola","Irueste","Jadraque","Jirueque","Lagartera","Las","Layos","Ledanca","Lillo","Lominchar","Loranca","Los","Lucillos","Lupiana","Luzaga","Luzon","Madridejos","Magan","Majaelrayo","Malaga","Malaguilla","Malpica","Mandayona","Mantiel","Manzaneque","Maqueda","Maranchon","Marchamalo","Marjaliza","Marrupe","Mascaraque","Masegoso","Matarrubia","Matillas","Mazarete","Mazuecos","Medranda","Megina","Mejorada","Mentrida","Mesegar","Miedes","Miguel","Millana","Milmarcos","Mirabueno","Miralrio","Mocejon","Mochales","Mohedas","Molina","Monasterio","Mondejar","Montarron","Mora","Moratilla","Morenilla","Muduex","Nambroca","Navalcan","Negredo","Noblejas","Noez","Nombela","Noves","Numancia","Nuno","Ocana","Ocentejo","Olias","Olmeda","Ontigola","Orea","Orgaz","Oropesa","Otero","Palmaces","Palomeque","Pantoja","Pardos","Paredes","Pareja","Parrillas","Pastrana","Pelahustan","Penalen","Penalver","Pepino","Peralejos","Peralveche","Pinilla","Pioz","Piqueras","Polan","Portillo","Poveda","Pozo","Pradena","Prados","Puebla","Puerto","Pulgar","Quer","Quero","Quintanar","Quismondo","Rebollosa","Recas","Renera","Retamoso","Retiendas","Riba","Rielves","Rillo","Riofrio","Robledillo","Robledo","Romanillos","Romanones","Rueda","Sacecorbo","Sacedon","Saelices","Salmeron","San","Santa","Santiuste","Santo","Sartajada","Sauca","Sayaton","Segurilla","Selas","Semillas","Sesena","Setiles","Sevilleja","Sienes","Siguenza","Solanillos","Somolinos","Sonseca","Sotillo","Sotodosos","Talavera","Tamajon","Taragudo","Taravilla","Tartanedo","Tembleque","Tendilla","Terzaga","Tierzo","Tordellego","Tordelrabano","Tordesilos","Torija","Torralba","Torre","Torrecilla","Torrecuadrada","Torrejon","Torremocha","Torrico","Torrijos","Torrubia","Tortola","Tortuera","Tortuero","Totanes","Traid","Trijueque","Trillo","Turleque","Uceda","Ugena","Ujados","Urda","Utande","Valdarachas","Valdesotos","Valhermoso","Valtablado","Valverde","Velada","Viana","Vinuelas","Yebes","Yebra","Yelamos","Yeles","Yepes","Yuncler","Yunclillos","Yuncos","Yunquera","Zaorejas","Zarzuela","Zorita"],
      ["Belgorod","Beloberezhye","Belyi","Belz","Berestiy","Berezhets","Berezovets","Berezutsk","Bobruisk","Bolonets","Borisov","Borovsk","Bozhesk","Bratslav","Bryansk","Brynsk","Buryn","Byhov","Chechersk","Chemesov","Cheremosh","Cherlen","Chern","Chernigov","Chernitsa","Chernobyl","Chernogorod","Chertoryesk","Chetvertnia","Demyansk","Derevesk","Devyagoresk","Dichin","Dmitrov","Dorogobuch","Dorogobuzh","Drestvin","Drokov","Drutsk","Dubechin","Dubichi","Dubki","Dubkov","Dveren","Galich","Glebovo","Glinsk","Goloty","Gomiy","Gorodets","Gorodische","Gorodno","Gorohovets","Goroshin","Gorval","Goryshon","Holm","Horobor","Hoten","Hotin","Hotmyzhsk","Ilovech","Ivan","Izborsk","Izheslavl","Kamenets","Kanev","Karachev","Karna","Kavarna","Klechesk","Klyapech","Kolomyya","Kolyvan","Kopyl","Korec","Kornik","Korochunov","Korshev","Korsun","Koshkin","Kotelno","Kovyla","Kozelsk","Kozelsk","Kremenets","Krichev","Krylatsk","Ksniatin","Kulatsk","Kursk","Kursk","Lebedev","Lida","Logosko","Lomihvost","Loshesk","Loshichi","Lubech","Lubno","Lubutsk","Lutsk","Luchin","Luki","Lukoml","Luzha","Lvov","Mtsensk","Mdin","Medniki","Melecha","Merech","Meretsk","Mescherskoe","Meshkovsk","Metlitsk","Mezetsk","Mglin","Mihailov","Mikitin","Mikulino","Miloslavichi","Mogilev","Mologa","Moreva","Mosalsk","Moschiny","Mozyr","Mstislav","Mstislavets","Muravin","Nemech","Nemiza","Nerinsk","Nichan","Novgorod","Novogorodok","Obolichi","Obolensk","Obolensk","Oleshsk","Olgov","Omelnik","Opoka","Opoki","Oreshek","Orlets","Osechen","Oster","Ostrog","Ostrov","Perelai","Peremil","Peremyshl","Pererov","Peresechen","Perevitsk","Pereyaslav","Pinsk","Ples","Polotsk","Pronsk","Proposhesk","Punia","Putivl","Rechitsa","Rodno","Rogachev","Romanov","Romny","Roslavl","Rostislavl","Rostovets","Rsha","Ruza","Rybchesk","Rylsk","Rzhavesk","Rzhev","Rzhischev","Sambor","Serensk","Serensk","Serpeysk","Shilov","Shuya","Sinech","Sizhka","Skala","Slovensk","Slutsk","Smedin","Sneporod","Snitin","Snovsk","Sochevo","Sokolec","Starica","Starodub","Stepan","Sterzh","Streshin","Sutesk","Svinetsk","Svisloch","Terebovl","Ternov","Teshilov","Teterin","Tiversk","Torchevsk","Toropets","Torzhok","Tripolye","Trubchevsk","Tur","Turov","Usvyaty","Uteshkov","Vasilkov","Velil","Velye","Venev","Venicha","Verderev","Vereya","Veveresk","Viazma","Vidbesk","Vidychev","Voino","Volodimer","Volok","Volyn","Vorobesk","Voronich","Voronok","Vorotynsk","Vrev","Vruchiy","Vselug","Vyatichsk","Vyatka","Vyshegorod","Vyshgorod","Vysokoe","Yagniatin","Yaropolch","Yasenets","Yuryev","Yuryevets","Zaraysk","Zhitomel","Zholvazh","Zizhech","Zubkov","Zudechev","Zvenigorod"],
      ["Akureyri","Aldra","Alftanes","Andenes","Austbo","Auvog","Bakkafjordur","Ballangen","Bardal","Beisfjord","Bifrost","Bildudalur","Bjerka","Bjerkvik","Bjorkosen","Bliksvaer","Blokken","Blonduos","Bolga","Bolungarvik","Borg","Borgarnes","Bosmoen","Bostad","Bostrand","Botsvika","Brautarholt","Breiddalsvik","Bringsli","Brunahlid","Budardalur","Byggdakjarni","Dalvik","Djupivogur","Donnes","Drageid","Drangsnes","Egilsstadir","Eiteroga","Elvenes","Engavogen","Ertenvog","Eskifjordur","Evenes","Eyrarbakki","Fagernes","Fallmoen","Fellabaer","Fenes","Finnoya","Fjaer","Fjelldal","Flakstad","Flateyri","Flostrand","Fludir","Gardabær","Gardur","Gimstad","Givaer","Gjeroy","Gladstad","Godoya","Godoynes","Granmoen","Gravdal","Grenivik","Grimsey","Grindavik","Grytting","Hafnir","Halsa","Hauganes","Haugland","Hauknes","Hella","Helland","Hellissandur","Hestad","Higrav","Hnifsdalur","Hofn","Hofsos","Holand","Holar","Holen","Holkestad","Holmavik","Hopen","Hovden","Hrafnagil","Hrisey","Husavik","Husvik","Hvammstangi","Hvanneyri","Hveragerdi","Hvolsvollur","Igeroy","Indre","Inndyr","Innhavet","Innes","Isafjordur","Jarklaustur","Jarnsreykir","Junkerdal","Kaldvog","Kanstad","Karlsoy","Kavosen","Keflavik","Kjelde","Kjerstad","Klakk","Kopasker","Kopavogur","Korgen","Kristnes","Krutoga","Krystad","Kvina","Lande","Laugar","Laugaras","Laugarbakki","Laugarvatn","Laupstad","Leines","Leira","Leiren","Leland","Lenvika","Loding","Lodingen","Lonsbakki","Lopsmarka","Lovund","Luroy","Maela","Melahverfi","Meloy","Mevik","Misvaer","Mornes","Mosfellsbær","Moskenes","Myken","Naurstad","Nesberg","Nesjahverfi","Nesset","Nevernes","Obygda","Ofoten","Ogskardet","Okervika","Oknes","Olafsfjordur","Oldervika","Olstad","Onstad","Oppeid","Oresvika","Orsnes","Orsvog","Osmyra","Overdal","Prestoya","Raudalaekur","Raufarhofn","Reipo","Reykholar","Reykholt","Reykjahlid","Rif","Rinoya","Rodoy","Rognan","Rosvika","Rovika","Salhus","Sanden","Sandgerdi","Sandoker","Sandset","Sandvika","Saudarkrokur","Selfoss","Selsoya","Sennesvik","Setso","Siglufjordur","Silvalen","Skagastrond","Skjerstad","Skonland","Skorvogen","Skrova","Sleneset","Snubba","Softing","Solheim","Solheimar","Sorarnoy","Sorfugloy","Sorland","Sormela","Sorvaer","Sovika","Stamsund","Stamsvika","Stave","Stokka","Stokkseyri","Storjord","Storo","Storvika","Strand","Straumen","Strendene","Sudavik","Sudureyri","Sundoya","Sydalen","Thingeyri","Thorlakshofn","Thorshofn","Tjarnabyggd","Tjotta","Tosbotn","Traelnes","Trofors","Trones","Tverro","Ulvsvog","Unnstad","Utskor","Valla","Vandved","Varmahlid","Vassos","Vevelstad","Vidrek","Vik","Vikholmen","Vogar","Vogehamn","Vopnafjordur"],
      ["Abdera","Abila","Abydos","Acanthus","Acharnae","Actium","Adramyttium","Aegae","Aegina","Aegium","Aenus","Agrinion","Aigosthena","Akragas","Akrai","Akrillai","Akroinon","Akrotiri","Alalia","Alexandreia","Alexandretta","Alexandria","Alinda","Amarynthos","Amaseia","Ambracia","Amida","Amisos","Amnisos","Amphicaea","Amphigeneia","Amphipolis","Amphissa","Ankon","Antigona","Antipatrea","Antioch","Antioch","Antiochia","Andros","Apamea","Aphidnae","Apollonia","Argos","Arsuf","Artanes","Artemita","Argyroupoli","Asine","Asklepios","Aspendos","Assus","Astacus","Athenai","Athmonia","Aytos","Ancient","Baris","Bhrytos","Borysthenes","Berge","Boura","Bouthroton","Brauron","Byblos","Byllis","Byzantium","Bythinion","Callipolis","Cebrene","Chalcedon","Calydon","Carystus","Chamaizi","Chalcis","Chersonesos","Chios","Chytri","Clazomenae","Cleonae","Cnidus","Colosse","Corcyra","Croton","Cyme","Cyrene","Cythera","Decelea","Delos","Delphi","Demetrias","Dicaearchia","Dimale","Didyma","Dion","Dioscurias","Dodona","Dorylaion","Dyme","Edessa","Elateia","Eleusis","Eleutherna","Emporion","Ephesus","Ephyra","Epidamnos","Epidauros","Eresos","Eretria","Erythrae","Eubea","Gangra","Gaza","Gela","Golgi","Gonnos","Gorgippia","Gournia","Gortyn","Gythium","Hagios","Hagia","Halicarnassus","Halieis","Helike","Heliopolis","Hellespontos","Helorus","Hemeroskopeion","Heraclea","Hermione","Hermonassa","Hierapetra","Hierapolis","Himera","Histria","Hubla","Hyele","Ialysos","Iasus","Idalium","Imbros","Iolcus","Itanos","Ithaca","Juktas","Kallipolis","Kamares","Kameiros","Kannia","Kamarina","Kasmenai","Katane","Kerkinitida","Kepoi","Kimmerikon","Kios","Klazomenai","Knidos","Knossos","Korinthos","Kos","Kourion","Kume","Kydonia","Kynos","Kyrenia","Lamia","Lampsacus","Laodicea","Lapithos","Larissa","Lato","Laus","Lebena","Lefkada","Lekhaion","Leibethra","Leontinoi","Lepreum","Lessa","Lilaea","Lindus","Lissus","Epizephyrian","Madytos","Magnesia","Mallia","Mantineia","Marathon","Marmara","Maroneia","Masis","Massalia","Megalopolis","Megara","Mesembria","Messene","Metapontum","Methana","Methone","Methumna","Miletos","Misenum","Mochlos","Monastiraki","Morgantina","Mulai","Mukenai","Mylasa","Myndus","Myonia","Myra","Myrmekion","Mutilene","Myos","Nauplios","Naucratis","Naupactus","Naxos","Neapoli","Neapolis","Nemea","Nicaea","Nicopolis","Nirou","Nymphaion","Nysa","Oenoe","Oenus","Odessos","Olbia","Olous","Olympia","Olynthus","Opus","Orchomenus","Oricos","Orestias","Oreus","Oropus","Onchesmos","Pactye","Pagasae","Palaikastro","Pandosia","Panticapaeum","Paphos","Parium","Paros","Parthenope","Patrae","Pavlopetri","Pegai","Pelion","Peiraieús","Pella","Percote","Pergamum","Petsofa","Phaistos","Phaleron","Phanagoria","Pharae","Pharnacia","Pharos","Phaselis","Philippi","Pithekussa","Philippopolis","Platanos","Phlius","Pherae","Phocaea","Pinara","Pisa","Pitane","Pitiunt","Pixous","Plataea","Poseidonia","Potidaea","Priapus","Priene","Prousa","Pseira","Psychro","Pteleum","Pydna","Pylos","Pyrgos","Rhamnus","Rhegion","Rhithymna","Rhodes","Rhypes","Rizinia","Salamis","Same","Samos","Scyllaeum","Selinus","Seleucia","Semasus","Sestos","Scidrus","Sicyon","Side","Sidon","Siteia","Sinope","Siris","Sklavokampos","Smyrna","Soli","Sozopolis","Sparta","Stagirus","Stratos","Stymphalos","Sybaris","Surakousai","Taras","Tanagra","Tanais","Tauromenion","Tegea","Temnos","Tenedos","Tenea","Teos","Thapsos","Thassos","Thebai","Theodosia","Therma","Thespiae","Thronion","Thoricus","Thurii","Thyreum","Thyria","Tiruns","Tithoraea","Tomis","Tragurion","Trapeze","Trapezus","Tripolis","Troizen","Troliton","Troy","Tylissos","Tyras","Tyros","Tyritake","Vasiliki","Vathypetros","Zakynthos","Zakros","Zankle"],
      ["Abila","Adflexum","Adnicrem","Aelia","Aelius","Aeminium","Aequum","Agrippina","Agrippinae","Ala","Albanianis","Ambianum","Andautonia","Apulum","Aquae","Aquaegranni","Aquensis","Aquileia","Aquincum","Arae","Argentoratum","Ariminum","Ascrivium","Atrebatum","Atuatuca","Augusta","Aurelia","Aurelianorum","Batavar","Batavorum","Belum","Biriciana","Blestium","Bonames","Bonna","Bononia","Borbetomagus","Bovium","Bracara","Brigantium","Burgodunum","Caesaraugusta","Caesarea","Caesaromagus","Calleva","Camulodunum","Cannstatt","Cantiacorum","Capitolina","Castellum","Castra","Castrum","Cibalae","Clausentum","Colonia","Concangis","Condate","Confluentes","Conimbriga","Corduba","Coria","Corieltauvorum","Corinium","Coriovallum","Cornoviorum","Danum","Deva","Divodurum","Dobunnorum","Drusi","Dubris","Dumnoniorum","Durnovaria","Durocobrivis","Durocornovium","Duroliponte","Durovernum","Durovigutum","Eboracum","Edetanorum","Emerita","Emona","Euracini","Faventia","Flaviae","Florentia","Forum","Gerulata","Gerunda","Glevensium","Hadriani","Herculanea","Isca","Italica","Iulia","Iuliobrigensium","Iuvavum","Lactodurum","Lagentium","Lauri","Legionis","Lemanis","Lentia","Lepidi","Letocetum","Lindinis","Lindum","Londinium","Lopodunum","Lousonna","Lucus","Lugdunum","Luguvalium","Lutetia","Mancunium","Marsonia","Martius","Massa","Matilo","Mattiacorum","Mediolanum","Mod","Mogontiacum","Moridunum","Mursa","Naissus","Nervia","Nida","Nigrum","Novaesium","Noviomagus","Olicana","Ovilava","Parisiorum","Partiscum","Paterna","Pistoria","Placentia","Pollentia","Pomaria","Pons","Portus","Praetoria","Praetorium","Pullum","Ragusium","Ratae","Raurica","Regina","Regium","Regulbium","Rigomagus","Roma","Romula","Rutupiae","Salassorum","Salernum","Salona","Scalabis","Segovia","Silurum","Sirmium","Siscia","Sorviodurum","Sumelocenna","Tarraco","Taurinorum","Theranda","Traiectum","Treverorum","Tungrorum","Turicum","Ulpia","Valentia","Venetiae","Venta","Verulamium","Vesontio","Vetera","Victoriae","Victrix","Villa","Viminacium","Vindelicorum","Vindobona","Vinovia","Viroconium"],
      ["Aanekoski","Abjapaluoja","Ahlainen","Aholanvaara","Ahtari","Aijala","Aimala","Akaa","Alajarvi","Alatornio","Alavus","Antsla","Aspo","Bennas","Bjorkoby","Elva","Emasalo","Espoo","Esse","Evitskog","Forssa","Haapajarvi","Haapamaki","Haapavesi","Haapsalu","Haavisto","Hameenlinna","Hameenmaki","Hamina","Hanko","Harjavalta","Hattuvaara","Haukipudas","Hautajarvi","Havumaki","Heinola","Hetta","Hinkabole","Hirmula","Hossa","Huittinen","Husula","Hyryla","Hyvinkaa","Iisalmi","Ikaalinen","Ilmola","Imatra","Inari","Iskmo","Itakoski","Jamsa","Jarvenpaa","Jeppo","Jioesuu","Jiogeva","Joensuu","Jokela","Jokikyla","Jokisuu","Jormua","Juankoski","Jungsund","Jyvaskyla","Kaamasmukka","Kaarina","Kajaani","Kalajoki","Kallaste","Kankaanpaa","Kannus","Kardla","Karesuvanto","Karigasniemi","Karkkila","Karkku","Karksinuia","Karpankyla","Kaskinen","Kasnas","Kauhajoki","Kauhava","Kauniainen","Kauvatsa","Kehra","Keila","Kellokoski","Kelottijarvi","Kemi","Kemijarvi","Kerava","Keuruu","Kiikka","Kiipu","Kilinginiomme","Kiljava","Kilpisjarvi","Kitee","Kiuruvesi","Kivesjarvi","Kiviioli","Kivisuo","Klaukkala","Klovskog","Kohtlajarve","Kokemaki","Kokkola","Kolho","Koria","Koskue","Kotka","Kouva","Kouvola","Kristiina","Kaupunki","Kuhmo","Kunda","Kuopio","Kuressaare","Kurikka","Kusans","Kuusamo","Kylmalankyla","Lahti","Laitila","Lankipohja","Lansikyla","Lappeenranta","Lapua","Laurila","Lautiosaari","Lepsama","Liedakkala","Lieksa","Lihula","Littoinen","Lohja","Loimaa","Loksa","Loviisa","Luohuanylipaa","Lusi","Maardu","Maarianhamina","Malmi","Mantta","Masaby","Masala","Matasvaara","Maula","Miiluranta","Mikkeli","Mioisakula","Munapirtti","Mustvee","Muurahainen","Naantali","Nappa","Narpio","Nickby","Niinimaa","Niinisalo","Nikkila","Nilsia","Nivala","Nokia","Nummela","Nuorgam","Nurmes","Nuvvus","Obbnas","Oitti","Ojakkala","Ollola","onningeby","Orimattila","Orivesi","Otanmaki","Otava","Otepaa","Oulainen","Oulu","Outokumpu","Paavola","Paide","Paimio","Pakankyla","Paldiski","Parainen","Parkano","Parkumaki","Parola","Perttula","Pieksamaki","Pietarsaari","Pioltsamaa","Piolva","Pohjavaara","Porhola","Pori","Porrasa","Porvoo","Pudasjarvi","Purmo","Pussi","Pyhajarvi","Raahe","Raasepori","Raisio","Rajamaki","Rakvere","Rapina","Rapla","Rauma","Rautio","Reposaari","Riihimaki","Rovaniemi","Roykka","Ruonala","Ruottala","Rutalahti","Saarijarvi","Salo","Sastamala","Saue","Savonlinna","Seinajoki","Sillamae","Sindi","Siuntio","Somero","Sompujarvi","Suonenjoki","Suurejaani","Syrjantaka","Tampere","Tamsalu","Tapa","Temmes","Tiorva","Tormasenvaara","Tornio","Tottijarvi","Tulppio","Turenki","Turi","Tuukkala","Tuurala","Tuuri","Tuuski","Ulvila","Unari","Upinniemi","Utti","Uusikaarlepyy","Uusikaupunki","Vaaksy","Vaalimaa","Vaarinmaja","Vaasa","Vainikkala","Valga","Valkeakoski","Vantaa","Varkaus","Vehkapera","Vehmasmaki","Vieki","Vierumaki","Viitasaari","Viljandi","Vilppula","Viohma","Vioru","Virrat","Ylike","Ylivieska","Ylojarvi"],
      ["Sabi","Wiryeseong","Hwando","Gungnae","Ungjin","Wanggeomseong","Ganggyeong","Jochiwon","Cheorwon","Beolgyo","Gangjin","Gampo","Yecheon","Geochang","Janghang","Hadong","Goseong","Yeongdong","Yesan","Sintaein","Geumsan","Boseong","Jangheung","Uiseong","Jumunjin","Janghowon","Hongseong","Gimhwa","Gwangcheon","Guryongpo","Jinyeong","Buan","Damyang","Jangseong","Wando","Angang","Okcheon","Jeungpyeong","Waegwan","Cheongdo","Gwangyang","Gochang","Haenam","Yeonggwang","Hanam","Eumseong","Daejeong","Hanrim","Samrye","Yongjin","Hamyang","Buyeo","Changnyeong","Yeongwol","Yeonmu","Gurye","Hwasun","Hampyeong","Namji","Samnangjin","Dogye","Hongcheon","Munsan","Gapyeong","Ganghwa","Geojin","Sangdong","Jeongseon","Sabuk","Seonghwan","Heunghae","Hapdeok","Sapgyo","Taean","Boeun","Geumwang","Jincheon","Bongdong","Doyang","Geoncheon","Pungsan","Punggi","Geumho","Wonju","Gaun","Hayang","Yeoju","Paengseong","Yeoncheon","Yangpyeong","Ganseong","Yanggu","Yangyang","Inje","Galmal","Pyeongchang","Hwacheon","Hoengseong","Seocheon","Cheongyang","Goesan","Danyang","Hamyeol","Muju","Sunchang","Imsil","Jangsu","Jinan","Goheung","Gokseong","Muan","Yeongam","Jindo","Seonsan","Daegaya","Gunwi","Bonghwa","Seongju","Yeongdeok","Yeongyang","Ulleung","Uljin","Cheongsong","wayang","Namhae","Sancheong","Uiryeong","Gaya","Hapcheon","Wabu","Dongsong","Sindong","Wondeok","Maepo","Anmyeon","Okgu","Sariwon","Dolsan","Daedeok","Gwansan","Geumil","Nohwa","Baeksu","Illo","Jido","Oedong","Ocheon","Yeonil","Hamchang","Pyeonghae","Gijang","Jeonggwan","Aewor","Gujwa","Seongsan","Jeongok","Seonggeo","Seungju","Hongnong","Jangan","Jocheon","Gohan","Jinjeop","Bubal","Beobwon","Yeomchi","Hwado","Daesan","Hwawon","Apo","Nampyeong","Munsan","Sinbuk","Munmak","Judeok","Bongyang","Ungcheon","Yugu","Unbong","Mangyeong","Dong","Naeseo","Sanyang","Soheul","Onsan","Eonyang","Nongong","Dasa","Goa","Jillyang","Bongdam","Naesu","Beomseo","Opo","Gongdo","Jingeon","Onam","Baekseok","Jiksan","Mokcheon","Jori","Anjung","Samho","Ujeong","Buksam","Tongjin","Chowol","Gonjiam","Pogok","Seokjeok","Poseung","Ochang","Hyangnam","Baebang","Gochon","Songak","Samhyang","Yangchon","Osong","Aphae","Ganam","Namyang","Chirwon","Andong","Ansan","Anseong","Anyang","Asan","Boryeong","Bucheon","Busan","Changwon","Cheonan","Cheongju","Chuncheon","Chungju","Daegu","Daejeon","Dangjin","Dongducheon","Donghae","Gangneung","Geoje","Gimcheon","Gimhae","Gimje","Gimpo","Gongju","Goyang","Gumi","Gunpo","Gunsan","Guri","Gwacheon","Gwangju","Gwangju","Gwangmyeong","Gyeongju","Gyeongsan","Gyeryong","Hwaseong","Icheon","Iksan","Incheon","Jecheon","Jeongeup","Jeonju","Jeju","Jinju","Naju","Namyangju","Namwon","Nonsan","Miryang","Mokpo","Mungyeong","Osan","Paju","Pocheon","Pohang","Pyeongtaek","Sacheon","Sangju","Samcheok","Sejong","Seogwipo","Seongnam","Seosan","Seoul","Siheung","Sokcho","Suncheon","Suwon","Taebaek","Tongyeong","Uijeongbu","Uiwang","Ulsan","Yangju","Yangsan","Yeongcheon","Yeongju","Yeosu","Yongin","Chungmu","Daecheon","Donggwangyang","Geumseong","Gyeongseong","Iri","Jangseungpo","Jeomchon","Jeongju","Migeum","Onyang","Samcheonpo","Busan","Busan","Cheongju","Chuncheon","Daegu","Daegu","Daejeon","Daejeon","Gunsan","Gwangju","Gwangju","Gyeongseong","Incheon","Incheon","Iri","Jeonju","Jinhae","Jinju","Masan","Masan","Mokpo","Songjeong","Songtan","Ulsan","Yeocheon","Cheongjin","Gaeseong","Haeju","Hamheung","Heungnam","Jinnampo","Najin","Pyeongyang","Seongjin","Sineuiju","Songnim","Wonsan"],
      ["Anding","Anlu","Anqing","Anshun","Baan","Baixing","Banyang","Baoding","Baoqing","Binzhou","Caozhou","Changbai","Changchun","Changde","Changling","Changsha","Changtu","Changzhou","Chaozhou","Cheli","Chengde","Chengdu","Chenzhou","Chizhou","Chongqing","Chuxiong","Chuzhou","Dading","Dali","Daming","Datong","Daxing","Dean","Dengke","Dengzhou","Deqing","Dexing","Dihua","Dingli","Dongan","Dongchang","Dongchuan","Dongping","Duyun","Fengtian","Fengxiang","Fengyang","Fenzhou","Funing","Fuzhou","Ganzhou","Gaoyao","Gaozhou","Gongchang","Guangnan","Guangning","Guangping","Guangxin","Guangzhou","Guide","Guilin","Guiyang","Hailong","Hailun","Hangzhou","Hanyang","Hanzhong","Heihe","Hejian","Henan","Hengzhou","Hezhong","Huaian","Huaide","Huaiqing","Huanglong","Huangzhou","Huining","Huizhou","Hulan","Huzhou","Jiading","Jian","Jianchang","Jiande","Jiangning","Jiankang","Jianning","Jiaxing","Jiayang","Jilin","Jinan","Jingjiang","Jingzhao","Jingzhou","Jinhua","Jinzhou","Jiujiang","Kaifeng","Kaihua","Kangding","Kuizhou","Laizhou","Lanzhou","Leizhou","Liangzhou","Lianzhou","Liaoyang","Lijiang","Linan","Linhuang","Linjiang","Lintao","Liping","Liuzhou","Longan","Longjiang","Longqing","Longxing","Luan","Lubin","Lubin","Luzhou","Mishan","Nanan","Nanchang","Nandian","Nankang","Nanning","Nanyang","Nenjiang","Ningan","Ningbo","Ningguo","Ninguo","Ningwu","Ningxia","Ningyuan","Pingjiang","Pingle","Pingliang","Pingyang","Puer","Puzhou","Qianzhou","Qingyang","Qingyuan","Qingzhou","Qiongzhou","Qujing","Quzhou","Raozhou","Rende","Ruian","Ruizhou","Runing","Shafeng","Shajing","Shaoqing","Shaowu","Shaoxing","Shaozhou","Shinan","Shiqian","Shouchun","Shuangcheng","Shulei","Shunde","Shunqing","Shuntian","Shuoping","Sicheng","Sien","Sinan","Sizhou","Songjiang","Suiding","Suihua","Suining","Suzhou","Taian","Taibei","Tainan","Taiping","Taiwan","Taiyuan","Taizhou","Taonan","Tengchong","Tieli","Tingzhou","Tongchuan","Tongqing","Tongren","Tongzhou","Weihui","Wensu","Wenzhou","Wuchang","Wuding","Wuzhou","Xian","Xianchun","Xianping","Xijin","Xiliang","Xincheng","Xingan","Xingde","Xinghua","Xingjing","Xingqing","Xingyi","Xingyuan","Xingzhong","Xining","Xinmen","Xiping","Xuanhua","Xunzhou","Xuzhou","Yanan","Yangzhou","Yanji","Yanping","Yanqi","Yanzhou","Yazhou","Yichang","Yidu","Yilan","Yili","Yingchang","Yingde","Yingtian","Yingzhou","Yizhou","Yongchang","Yongping","Yongshun","Yongzhou","Yuanzhou","Yuezhou","Yulin","Yunnan","Yunyang","Zezhou","Zhangde","Zhangzhou","Zhaoqing","Zhaotong","Zhenan","Zhending","Zhengding","Zhenhai","Zhenjiang","Zhenxi","Zhenyun","Zhongshan","Zunyi"],
      ["Nanporo","Naie","Kamisunagawa","Yuni","Naganuma","Kuriyama","Tsukigata","Urausu","Shintotsukawa","Moseushi","Chippubetsu","Uryu","Hokuryu","Numata","Tobetsu","Suttsu","Kuromatsunai","Rankoshi","Niseko","Kimobetsu","Kyogoku","Kutchan","Kyowa","Iwanai","Shakotan","Furubira","Niki","Yoichi","Toyoura","Toyako","Sobetsu","Shiraoi","Atsuma","Abira","Mukawa","Hidaka","Biratori","Niikappu","Urakawa","Samani","Erimo","Shinhidaka","Matsumae","Fukushima","Shiriuchi","Kikonai","Nanae","Shikabe","Mori","Yakumo","Oshamambe","Esashi","Kaminokuni","Assabu","Otobe","Okushiri","Imakane","Setana","Takasu","Higashikagura","Toma","Pippu","Aibetsu","Kamikawa","Higashikawa","Biei","Kamifurano","Nakafurano","Minamifurano","Horokanai","Wassamu","Kenbuchi","Shimokawa","Bifuka","Nakagawa","Mashike","Obira","Tomamae","Haboro","Enbetsu","Teshio","Hamatonbetsu","Nakatonbetsu","Esashi","Toyotomi","Horonobe","Rebun","Rishiri","Rishirifuji","Bihoro","Tsubetsu","Ozora","Shari","Kiyosato","Koshimizu","Kunneppu","Oketo","Saroma","Engaru","Yubetsu","Takinoue","Okoppe","Omu","Otofuke","Shihoro","Kamishihoro","Shikaoi","Shintoku","Shimizu","Memuro","Taiki","Hiroo","Makubetsu","Ikeda","Toyokoro","Honbetsu","Ashoro","Rikubetsu","Urahoro","Kushiro","Akkeshi","Hamanaka","Shibecha","Teshikaga","Shiranuka","Betsukai","Nakashibetsu","Shibetsu","Rausu","Hiranai","Imabetsu","Sotogahama","Ajigasawa","Fukaura","Fujisaki","Owani","Itayanagi","Tsuruta","Nakadomari","Noheji","Shichinohe","Rokunohe","Yokohama","Tohoku","Oirase","Oma","Sannohe","Gonohe","Takko","Nanbu","Hashikami","Shizukuishi","Kuzumaki","Iwate","Shiwa","Yahaba","Nishiwaga","Kanegasaki","Hiraizumi","Sumita","Otsuchi","Yamada","Iwaizumi","Karumai","Hirono","Ichinohe","Zao","Shichikashuku","Ogawara","Murata","Shibata","Kawasaki","Marumori","Watari","Yamamoto","Matsushima","Shichigahama","Rifu","Taiwa","Osato","Shikama","Kami","Wakuya","Misato","Onagawa","Minamisanriku","Kosaka","Fujisato","Mitane","Happo","Gojome","Hachirogata","Ikawa","Misato","Ugo","Yamanobe","Nakayama","Kahoku","Nishikawa","Asahi","Oe","Oishida","Kaneyama","Mogami","Funagata","Mamurogawa","Takahata","Kawanishi","Oguni","Shirataka","Iide","Mikawa","Shonai","Yuza","Koori","Kunimi","Kawamata","Kagamiishi","Shimogo","Tadami","Minamiaizu","Nishiaizu","Bandai","Inawashiro","Aizubange","Yanaizu","Mishima","Kaneyama","Aizumisato","Yabuki","Tanagura","Yamatsuri","Hanawa","Ishikawa","Asakawa","Furudono","Miharu","Ono","Hirono","Naraha","Tomioka","Okuma","Futaba","Namie","Shinchi","Ibaraki","Oarai","Shirosato","Daigo","Ami","Kawachi","Yachiyo","Goka","Sakai","Tone","Kaminokawa","Mashiko","Motegi","Ichikai","Haga","Mibu","Nogi","Shioya","Takanezawa","Nasu","Nakagawa","Yoshioka","Kanna","Shimonita","Kanra","Nakanojo","Naganohara","Kusatsu","Higashiagatsuma","Minakami","Tamamura","Itakura","Meiwa","Chiyoda","Oizumi","Ora","Ina","Miyoshi","Moroyama","Ogose","Namegawa","Ranzan","Ogawa","Kawajima","Yoshimi","Hatoyama","Tokigawa","Yokoze","Minano","Nagatoro","Ogano","Misato","Kamikawa","Kamisato","Yorii","Miyashiro","Sugito","Matsubushi","Shisui","Sakae","Kozaki","Tako","Tonosho","Kujukuri","Shibayama","Yokoshibahikari","Ichinomiya","Mutsuzawa","Shirako","Nagara","Chonan","Otaki","Onjuku","Kyonan","Mizuho","Hinode","Okutama","Oshima","Hachijo","Aikawa","Hayama","Samukawa","Oiso","Ninomiya","Nakai","Oi","Matsuda","Yamakita","Kaisei","Hakone","Manazuru","Yugawara","Seiro","Tagami","Aga","Izumozaki","Yuzawa","Tsunan","Kamiichi","Tateyama","Nyuzen","Asahi","Kawakita","Tsubata","Uchinada","Shika","Hodatsushimizu","Nakanoto","Anamizu","Noto","Eiheiji","Ikeda","Minamiechizen","Echizen","Mihama","Takahama","Oi","Wakasa","Ichikawamisato","Hayakawa","Minobu","Nanbu","Fujikawa","Showa","Nishikatsura","Fujikawaguchiko","Koumi","Sakuho","Karuizawa","Miyota","Tateshina","Nagawa","Shimosuwa","Fujimi","Tatsuno","Minowa","Iijima","Matsukawa","Takamori","Anan","Agematsu","Nagiso","Kiso","Ikeda","Sakaki","Obuse","Yamanouchi","Shinano","Iizuna","Ginan","Kasamatsu","Yoro","Tarui","Sekigahara","Godo","Wanouchi","Anpachi","Ibigawa","Ono","Ikeda","Kitagata","Sakahogi","Tomika","Kawabe","Hichiso","Yaotsu","Shirakawa","Mitake","Higashiizu","Kawazu","Minamiizu","Matsuzaki","Nishiizu","Kannami","Shimizu","Nagaizumi","Oyama","Yoshida","Kawanehon","Mori","Togo","Toyoyama","Oguchi","Fuso","Oharu","Kanie","Agui","Higashiura","Minamichita","Mihama","Taketoyo","Mihama","Kota","Shitara","Toei","Kisosaki","Toin","Komono","Asahi","Kawagoe","Taki","Meiwa","Odai","Tamaki","Watarai","Taiki","Minamiise","Kihoku","Mihama","Kiho","Hino","Ryuo","Aisho","Toyosato","Kora","Taga","Oyamazaki","Kumiyama","Ide","Ujitawara","Kasagi","Wazuka","Seika","Kyotamba","Ine","Yosano","Shimamoto","Toyono","Nose","Tadaoka","Kumatori","Tajiri","Misaki","Taishi","Kanan","Inagawa","Taka","Inami","Harima","Ichikawa","Fukusaki","Kamikawa","Taishi","Kamigori","Sayo","Kami","Shinonsen","Heguri","Sango","Ikaruga","Ando","Kawanishi","Miyake","Tawaramoto","Takatori","Kanmaki","Oji","Koryo","Kawai","Yoshino","Oyodo","Shimoichi","Kushimoto","Kimino","Katsuragi","Kudoyama","Koya","Yuasa","Hirogawa","Aridagawa","Mihama","Hidaka","Yura","Inami","Minabe","Hidakagawa","Shirahama","Kamitonda","Susami","Nachikatsuura","Taiji","Kozagawa","Iwami","Wakasa","Chizu","Yazu","Misasa","Yurihama","Kotoura","Hokuei","Daisen","Nanbu","Hoki","Nichinan","Hino","Kofu","Okuizumo","Iinan","Kawamoto","Misato","Onan","Tsuwano","Yoshika","Ama","Nishinoshima","Okinoshima","Wake","Hayashima","Satosho","Yakage","Kagamino","Shoo","Nagi","Kumenan","Misaki","Kibichuo","Fuchu","Kaita","Kumano","Saka","Kitahiroshima","Akiota","Osakikamijima","Sera","Jinsekikogen","Suooshima","Waki","Kaminoseki","Tabuse","Hirao","Abu","Katsuura","Kamikatsu","Ishii","Kamiyama","Naka","Mugi","Minami","Kaiyo","Matsushige","Kitajima","Aizumi","Itano","Kamiita","Tsurugi","Higashimiyoshi","Tonosho","Shodoshima","Miki","Naoshima","Utazu","Ayagawa","Kotohira","Tadotsu","Manno","Kamijima","Kumakogen","Masaki","Tobe","Uchiko","Ikata","Kihoku","Matsuno","Ainan","Toyo","Nahari","Tano","Yasuda","Motoyama","Otoyo","Tosa","Ino","Niyodogawa","Nakatosa","Sakawa","Ochi","Yusuhara","Tsuno","Shimanto","Otsuki","Kuroshio","Nakagawa","Umi","Sasaguri","Shime","Sue","Shingu","Hisayama","Kasuya","Ashiya","Mizumaki","Okagaki","Onga","Kotake","Kurate","Keisen","Chikuzen","Tachiarai","Oki","Hirokawa","Kawara","Soeda","Itoda","Kawasaki","Oto","Fukuchi","Kanda","Miyako","Yoshitomi","Koge","Chikujo","Yoshinogari","Kiyama","Kamimine","Miyaki","Genkai","Arita","Omachi","Kohoku","Shiroishi","Tara","Nagayo","Togitsu","Higashisonogi","Kawatana","Hasami","Ojika","Saza","Shinkamigoto","Misato","Gyokuto","Nankan","Nagasu","Nagomi","Ozu","Kikuyo","Minamioguni","Oguni","Takamori","Mifune","Kashima","Mashiki","Kosa","Yamato","Hikawa","Ashikita","Tsunagi","Nishiki","Taragi","Yunomae","Asagiri","Reihoku","Hiji","Kusu","Kokonoe","Mimata","Takaharu","Kunitomi","Aya","Takanabe","Shintomi","Kijo","Kawaminami","Tsuno","Kadogawa","Misato","Takachiho","Hinokage","Gokase","Satsuma","Nagashima","Yusui","Osaki","Higashikushira","Kinko","Minamiosumi","Kimotsuki","Nakatane","Minamitane","Yakushima","Setouchi","Tatsugo","Kikai","Tokunoshima","Amagi","Isen","Wadomari","China","Yoron","Motobu","Kin","Kadena","Chatan","Nishihara","Yonabaru","Haebaru","Kumejima","Yaese","Taketomi","Yonaguni"]
    ];
  }

  function calculateChains() {
    for (let c=0; c < nameBase.length; c++) {
      chain[c] = calculateChain(c);
    }
  }

  // calculate Markov's chain from namesbase data
  function calculateChain(c) {
    const chain = [];
    const d = nameBase[c].join(" ").toLowerCase();
    const method = nameBases[c].method;

    for (let i = -1, prev = " ", str = ""; i < d.length - 2; prev = str, i += str.length, str = "") {
      let vowel = 0, f = " ";
      if (method === "let-to-let") {str = d[i+1];} else {
        for (let c=i+1; str.length < 5; c++) {
          if (d[c] === undefined) break;
          str += d[c];
          if (str === " ") break;
          if (d[c] !== "o" && d[c] !== "e" && vowels.includes(d[c]) && d[c+1] === d[c]) break;
          if (d[c+2] === " ") {str += d[c+1]; break;}
          if (vowels.includes(d[c])) vowel++;
          if (vowel && vowels.includes(d[c+2])) break;
        }
      }
      if (i >= 0) {
        f = d[i];
        if (method === "syl-to-syl") f = prev;
      }
      if (chain[f] === undefined) chain[f] = [];
      chain[f].push(str);
    }
    return chain;
  }

  // get settlement and country names based on option selected
  function getNames() {
    console.time('getNames');
    for (let i=0; i < manors.length; i++) {
      const culture = manors[i].culture;
      manors[i].name = generateName(culture);
      if (i < states.length) states[i].name = generateStateName(i);
    }
    console.timeEnd('getNames');
  }

  // generate random name using Markov's chain
  function generateName(culture, base) {
    if (base === undefined) {
      if (!cultures[culture]) {
        console.error("culture " + culture + " is not defined. Will load default cultures and set first culture");
        generateCultures();
        culture = 0;
      }
      base = cultures[culture].base;
    }
    if (!nameBases[base]) {
      console.error("nameBase " + base + " is not defined. Will load default names data and first base");
      if (!nameBases[0]) applyDefaultNamesData();
      base = 0;
    }
    const method = nameBases[base].method;
    const error = function(base) {
      tip("Names data for base " + nameBases[base].name + " is incorrect. Please fix in Namesbase Editor");
      editNamesbase();
    }

    if (method === "selection") {
      if (nameBase[base].length < 1) {error(base); return;}
      const rnd = rand(nameBase[base].length - 1);
      const name = nameBase[base][rnd];
      return name;
    }

    const data = chain[base];
    if (data === undefined || data[" "] === undefined) {error(base); return;}
    const max = nameBases[base].max;
    const min = nameBases[base].min;
    const d = nameBases[base].d;
    let word = "", variants = data[" "];
    if (variants === undefined) {error(base); return;};
    let cur = variants[rand(variants.length - 1)];
    for (let i=0; i < 21; i++) {
      if (cur === " " && Math.random() < 0.8) {
        // space means word end, but we don't want to end if word is too short
        if (word.length < min) {
          word = "";
          variants = data[" "];
        } else {break;}
      } else {
        const l = method === "let-to-syl" && cur.length > 1 ? cur[cur.length - 1] : cur;
        variants = data[l];
        // word is getting too long, restart
        word += cur; // add current el to word
        if (word.length > max) word = "";
      }
      if (variants === undefined) {error(base); return;};
      cur = variants[rand(variants.length - 1)];
    }
    // very rare case, let's just select a random name
    if (word.length < 2) word = nameBase[base][rand(nameBase[base].length - 1)];

    // do not allow multi-word name if word is foo short or not allowed for culture
    if (word.includes(" ")) {
      let words = word.split(" "), parsed;
      if (Math.random() > nameBases[base].m) {word = words.join("");}
      else {
        for (let i=0; i < words.length; i++) {
          if (words[i].length < 2) {
            if (!i) words[1] = words[0] + words[1];
            if (i) words[i-1] = words[i-1] + words[i];
            words.splice(i, 1);
        	  i--;
          }
        }
        word = words.join(" ");
      }
    }

    // parse word to get a final name
    const name = [...word].reduce(function(r, c, i, data) {
      if (c === " ") {
        if (!r.length) return "";
        if (i+1 === data.length) return r;
      }
      if (!r.length) return c.toUpperCase();
      if (r.slice(-1) === " ") return r + c.toUpperCase();
      if (c === data[i-1]) {
        if (!d.includes(c)) return r;
        if (c === data[i-2]) return r;
      }
      return r + c;
    }, "");
    return name;
  }

  // generate region name
  function generateStateName(state) {
    let culture = null;
    if (states[state]) if(manors[states[state].capital]) culture = manors[states[state].capital].culture;
    let name = "NameIdontWant";
    if (Math.random() < 0.85 || culture === null) {
      // culture is random if capital is not yet defined
      if (culture === null) culture = rand(cultures.length - 1);
      // try to avoid too long words as a basename
      for (let i=0; i < 20 && name.length > 7; i++) {
        name = generateName(culture);
      }
    } else {
      name = manors[state].name;
    }
    const base = cultures[culture].base;

    let addSuffix = false;
    // handle special cases
    const e = name.slice(-2);
    if (base === 5 && (e === "sk" || e === "ev" || e === "ov")) {
      // remove -sk and -ev/-ov for Ruthenian
      name = name.slice(0,-2);
      addSuffix = true;
    } else if (name.length > 5 && base === 1 && name.slice(-3) === "ton") {
      // remove -ton ending for English
      name = name.slice(0,-3);
      addSuffix = true;
    } else if (name.length > 6 && name.slice(-4) === "berg") {
      // remove -berg ending for any
      name = name.slice(0,-4);
      addSuffix = true;
    } else if (base === 12) {
      // Japanese ends on vowels
      if (vowels.includes(name.slice(-1))) return name;
      return name + "u";
    } else if (base === 10) {
      // Korean has "guk" suffix
      if (name.slice(-3) === "guk") return name;
      if (name.slice(-1) === "g") name = name.slice(0,-1);
      if (Math.random() < 0.2 && name.length < 7) name = name + "guk"; // 20% for "guk"
      return name;
    } else if (base === 11) {
      // Chinese has "guo" suffix
      if (name.slice(-3) === "guo") return name;
      if (name.slice(-1) === "g") name = name.slice(0,-1);
      if (Math.random() < 0.3 && name.length < 7) name = name + " Guo"; // 30% for "guo"
      return name;
    }

    // define if suffix should be used
    let vowel = vowels.includes(name.slice(-1)); // last char is vowel
    if (vowel && name.length > 3) {
      if (Math.random() < 0.85) {
        if (vowels.includes(name.slice(-2,-1))) {
          name = name.slice(0,-2);
          addSuffix = true; // 85% for vv
        } else if (Math.random() < 0.7) {
          name = name.slice(0,-1);
          addSuffix = true; // ~60% for cv
        }
      }
    } else if (Math.random() < 0.6) {
      addSuffix = true; // 60% for cc and vc
    }

    if (addSuffix === false) return name;
    let suffix = "ia"; // common latin suffix
    const rnd = Math.random();
    if (rnd < 0.05 && base === 3) suffix = "terra"; // 5% "terra" for Italian
    else if (rnd < 0.05 && base === 4) suffix = "terra"; // 5% "terra" for Spanish
    else if (rnd < 0.05 && base == 2) suffix = "terre"; // 5% "terre" for French
    else if (rnd < 0.5 && base == 0) suffix = "land"; // 50% "land" for German
    else if (rnd < 0.4 && base == 1) suffix = "land"; // 40% "land" for English
    else if (rnd < 0.3 && base == 6) suffix = "land"; // 30% "land" for Nordic
    else if (rnd < 0.1 && base == 7) suffix = "eia"; // 10% "eia" for Greek ("ia" is also Greek)
    else if (rnd < 0.4 && base == 9) suffix = "maa"; // 40% "maa" for Finnic
    if (name.slice(-1 * suffix.length) === suffix) return name; // no suffix if name already ends with it
    return name + suffix;
  }