const SONGS = [

  // ══════════════════════════════════════════════════════
  //  🇫🇷  FRANCO-EUROPÉEN
  // ══════════════════════════════════════════════════════
  { id: 1,  title: "Oggy et les Cafards",            youtubeId: "ybI6UecpU8w", startAt: 5, category: "🇫🇷 Franco-Européen" },
  { id: 2,  title: "Les Zinzins de l'Espace",         youtubeId: "N-Fk_ucoaCw", startAt: 5, category: "🇫🇷 Franco-Européen" },
  { id: 3,  title: "Totally Spies (VF)",              youtubeId: "U6lvy7ZFZ5M", startAt: 5, category: "🇫🇷 Franco-Européen" },
  { id: 4,  title: "Code Lyoko",                      youtubeId: "lLwk_lpvL44", startAt: 5, category: "🇫🇷 Franco-Européen" },
  { id: 5,  title: "Wakfu",                           youtubeId: "cp1J7CJ7A8w", startAt: 5, category: "🇫🇷 Franco-Européen" },
  { id: 6,  title: "Galactik Football",               youtubeId: "abzhBJDqYug", startAt: 5, category: "🇫🇷 Franco-Européen" },
  { id: 7,  title: "Winx Club (VF)",                  youtubeId: "C7LZ4LVUA4o", startAt: 5, category: "🇫🇷 Franco-Européen" },
  { id: 8,  title: "W.I.T.C.H. (VF)",                youtubeId: "CezZlMitCq8", startAt: 5, category: "🇫🇷 Franco-Européen" },
  { id: 9,  title: "Corneil et Bernie",               youtubeId: "6wwJEUuYdQc", startAt: 5, category: "🇫🇷 Franco-Européen" },
  { id: 10, title: "Skyland",                         youtubeId: "bA7TKjmWYFU", startAt: 5, category: "🇫🇷 Franco-Européen" },
  { id: 11, title: "Martin Mystère (VF)",             youtubeId: "LTEHU3w-Jcc", startAt: 5, category: "🇫🇷 Franco-Européen" },
  { id: 12, title: "Mon Ami Marsupilami (VF)",        youtubeId: "y9GOU53KzUA", startAt: 5, category: "🇫🇷 Franco-Européen" },
  { id: 13, title: "Monster Buster Club (VF)",        youtubeId: "nkP3IG2M7SQ", startAt: 10, category: "🇫🇷 Franco-Européen" },

  // ══════════════════════════════════════════════════════
  //  ⚽  SPORT & URBAN
  // ══════════════════════════════════════════════════════
  { id: 14, title: "Foot 2 Rue",                      youtubeId: "CaR7ADuVWvg", startAt: 5, category: "⚽ Sport & Urban" },
  { id: 15, title: "Baskup : Tony Parker",            youtubeId: "rrsK1iEbya8", startAt: 5, category: "⚽ Sport & Urban" },
  { id: 16, title: "Olive & Tom (Captain Tsubasa)",   youtubeId: "juQl2UbcD7w", startAt: 5, category: "⚽ Sport & Urban" },
  { id: 17, title: "Inazuma Eleven (VF)",             youtubeId: "3aHHa3vbCzU", startAt: 5, category: "⚽ Sport & Urban" },
  { id: 18, title: "Rocket Power (VF)",               youtubeId: "kcJeok_zlsU", startAt: 5, category: "⚽ Sport & Urban" },

  // ══════════════════════════════════════════════════════
  //  🕹️  CLASSIQUES 80–90s
  // ══════════════════════════════════════════════════════
  { id: 19, title: "Inspecteur Gadget (VF)",          youtubeId: "VHneKZ9AmwM", startAt: 5, category: "🕹️ Classiques 80-90s" },
  { id: 20, title: "Capitaine Flam",                  youtubeId: "Q_hE-UhuJoY", startAt: 5, category: "🕹️ Classiques 80-90s" },
  { id: 21, title: "Les Tortues Ninja (VF)",          youtubeId: "zN0ee0qEtXU", startAt: 15, category: "🕹️ Classiques 80-90s" },
  { id: 22, title: "Aaahh!!! Les Dingues (VF)",       youtubeId: "8VfPz-2V8PU", startAt: 5, category: "🕹️ Classiques 80-90s" },
  { id: 23, title: "Courage le Chien Froussard (VF)", youtubeId: "CS94Dhv8Eoo", startAt: 6, category: "🕹️ Classiques 80-90s" },

  // ══════════════════════════════════════════════════════
  //  📺  CN, NICK & DISNEY
  // ══════════════════════════════════════════════════════
  { id: 24, title: "Dexter (VF)",                     youtubeId: "jSJo0UKRg7w", startAt: 5, category: "📺 CN, Nick & Disney" },
  { id: 25, title: "Les Supers Nanas (VF)",           youtubeId: "ggPtT2By51o", startAt: 5, category: "📺 CN, Nick & Disney" },
  { id: 26, title: "Ben 10 (VF)",                     youtubeId: "Wd7vFAyFLZk", startAt: 5, category: "📺 CN, Nick & Disney" },
  { id: 27, title: "Bob l'Éponge (VF)",               youtubeId: "mzxn0IhWPf8", startAt: 5, category: "📺 CN, Nick & Disney" },
  { id: 28, title: "Danny Phantom (VF)",              youtubeId: "FOLib6CzdOg", startAt: 15, category: "📺 CN, Nick & Disney" },
  { id: 29, title: "Avatar : Le Dernier Maître (VF)", youtubeId: "SRw0f2S8JcE", startAt: 5, category: "📺 CN, Nick & Disney" },
  { id: 30, title: "Mes Parrains Magiques (VF)",      youtubeId: "jsJcQAhV83o", startAt: 5, category: "📺 CN, Nick & Disney" },
  { id: 31, title: "Kim Possible (VF)",               youtubeId: "GkKx5fz31w8", startAt: 5, category: "📺 CN, Nick & Disney" },
  { id: 32, title: "American Dragon Jake Long (VF)",  youtubeId: "5EzNVg6E3p8", startAt: 5, category: "📺 CN, Nick & Disney" },
  { id: 33, title: "Phinéas et Ferb (VF)",            youtubeId: "feujSToaWcQ", startAt: 5, category: "📺 CN, Nick & Disney" },
  { id: 34, title: "Yin Yang Yo! (VF)",               youtubeId: "fvY4xqGdV3Y", startAt: 5, category: "📺 CN, Nick & Disney" },
  { id: 35, title: "Kuzco, un Empereur à l'École (VF)", youtubeId: "TEe0YW-Sric", startAt: 5, category: "📺 CN, Nick & Disney" },
  { id: 36, title: "Atomic Betty (VF)",               youtubeId: "cMLHQHKN8vY", startAt: 5, category: "📺 CN, Nick & Disney" },
  { id: 37, title: "Phil du Futur (VF)",              youtubeId: "rBhSNJpeSAo", startAt: 5, category: "📺 CN, Nick & Disney" },

  // ══════════════════════════════════════════════════════
  //  🎌  ANIME VF
  // ══════════════════════════════════════════════════════
  { id: 38, title: "Naruto — ROCKS (OP1)",             youtubeId: "GcgDuB6ShyY", startAt: 5,  category: "🎌 Anime VF" },
  { id: 39, title: "Dragon Ball Z — Cha-La Head-Cha-La", youtubeId: "hcdDnwm4pAE", startAt: 5, category: "🎌 Anime VF" },
  { id: 40, title: "One Piece — We Are! (OP1)",       youtubeId: "TFDDwEQhexs", startAt: 30, category: "🎌 Anime VF" },
  { id: 41, title: "Pokémon (VF)",                    youtubeId: "YhN4oAS3O4c", startAt: 5,  category: "🎌 Anime VF" },
  { id: 42, title: "Yu-Gi-Oh! (VF)",                 youtubeId: "ErhzuwW9uGs", startAt: 5,  category: "🎌 Anime VF" },
  { id: 43, title: "Fairy Tail — Snow Fairy (OP1)",   youtubeId: "j9SFjzhnkzI", startAt: 5,  category: "🎌 Anime VF" },
  { id: 44, title: "Beyblade Metal Fusion (VF)",       youtubeId: "Yw9G9glw9lE", startAt: 5, category: "🎌 Anime VF" },
  { id: 45, title: "Sonic le Rebelle (VF)",            youtubeId: "n4RUrBbvWHA", startAt: 5,  category: "🎌 Anime VF" },
  { id: 46, title: "Shaman King — Over Soul (OP1)",   youtubeId: "IHfmLbtANz0", startAt: 5,  category: "🎌 Anime VF" },

  // ══════════════════════════════════════════════════════
  //  🎤  RAP FR
  // ══════════════════════════════════════════════════════
  { id: 47, title: "Damso — Dieu ne ment jamais",      youtubeId: "jsJRojGBpWw", startAt: 5, category: "🎤 Rap FR" },
  { id: 48, title: "Damso — Mosaïque Solitaire",       youtubeId: "q2c7Ie1Sz1Q", startAt: 5, category: "🎤 Rap FR" },
  { id: 49, title: "Renaud — Laisse béton",            youtubeId: "6uvdSHkKj00", startAt: 5, category: "🎤 Rap FR" },
  { id: 50, title: "Sheryfa Luna — Il avait les mots", youtubeId: "vGxOs9OrLYk", startAt: 5, category: "🎤 Rap FR" },
  { id: 51, title: "Ninho — Goutte d'eau",             youtubeId: "0uLp-tejcSo", startAt: 5, category: "🎤 Rap FR" },
  { id: 52, title: "Leto ft. Ninho — Macaroni",        youtubeId: "Hpoo6R1JyKQ", startAt: 5, category: "🎤 Rap FR" },
  { id: 53, title: "Leto — Freestyle Virus",           youtubeId: "d6_6jmePUHo", startAt: 5, category: "🎤 Rap FR" },
  { id: 54, title: "Niska — PSG",                      youtubeId: "j_s6RFAikzQ", startAt: 5, category: "🎤 Rap FR" },
  { id: 55, title: "Booba — Jour de paye",             youtubeId: "PgnqVuNLtac", startAt: 5, category: "🎤 Rap FR" },
  { id: 56, title: "PNL — Deux Frères",                youtubeId: "vNpl-M3_9_o", startAt: 5, category: "🎤 Rap FR" },
  { id: 57, title: "Nekfeu — On Verra",                youtubeId: "YltjliK0ZeA", startAt: 5, category: "🎤 Rap FR" },
  { id: 58, title: "Kaaris — Goulag",                  youtubeId: "OoaBn1V4Krw", startAt: 5, category: "🎤 Rap FR" },
  { id: 66, title: "Indila — Dernière Danse",          youtubeId: "K5KAc5CoCuk", startAt: 5, category: "🎤 Rap FR" },
  { id: 67, title: "Zaho — C'est chelou",              youtubeId: "pHy0LkdpxSU", startAt: 5, category: "🎤 Rap FR" },
  { id: 68, title: "Colonel Reyel — Aurélie",          youtubeId: "AC_a98Yd_9Q", startAt: 5, category: "🎤 Rap FR" },

  // ══════════════════════════════════════════════════════
  //  🎶  VARIÉTÉS FR
  // ══════════════════════════════════════════════════════
  { id: 69, title: "Plastic Bertrand — Ça plane pour moi", youtubeId: "e3HkYsB1JN4", startAt: 5, category: "🎶 Variétés FR" },
  { id: 70, title: "Claude François — Alexandrie Alexandra", youtubeId: "ZRaOzXS1slI", startAt: 5, category: "🎶 Variétés FR" },
  { id: 71, title: "Dalida — Mourir sur scène",         youtubeId: "X16fYEugii4", startAt: 5, category: "🎶 Variétés FR" },
  { id: 72, title: "Joe Dassin — Et si tu n'existais pas", youtubeId: "fVCAFvIq_F8", startAt: 5, category: "🎶 Variétés FR" },
  { id: 73, title: "Gainsbourg & Birkin — Je t'aime… moi non plus", youtubeId: "GlpDf6XX_j0", startAt: 5, category: "🎶 Variétés FR" },
  { id: 74, title: "France Gall — Ella elle l'a",       youtubeId: "kCN2VlZNbXs", startAt: 5, category: "🎶 Variétés FR" },
  { id: 75, title: "Michel Sardou — La Maladie d'amour", youtubeId: "6YJ_V5V9Zek", startAt: 5, category: "🎶 Variétés FR" },
  { id: 76, title: "Daniel Balavoine — L'Aziza",        youtubeId: "O4ACXQxCgc8", startAt: 5, category: "🎶 Variétés FR" },
  { id: 77, title: "Téléphone — Un autre monde",        youtubeId: "xqnZPHo6qx4", startAt: 5, category: "🎶 Variétés FR" },
  { id: 78, title: "Jean-Jacques Goldman — Il suffira d'un signe", youtubeId: "Vav-2sgJ4MI", startAt: 5, category: "🎶 Variétés FR" },
  { id: 79, title: "Indochine — L'Aventurier",          youtubeId: "M7X6oYg6iro", startAt: 5, category: "🎶 Variétés FR" },

  // ══════════════════════════════════════════════════════
  //  🇺🇸  RAP US
  // ══════════════════════════════════════════════════════
  { id: 59, title: "Macklemore — Can't Hold Us",       youtubeId: "2zNSgSzhBfM", startAt: 5, category: "🇺🇸 Rap US" },
  { id: 60, title: "Eminem ft. Rihanna — The Monster", youtubeId: "EHkozMIXZ8w", startAt: 5, category: "🇺🇸 Rap US" },
  { id: 61, title: "Eminem — Lose Yourself",           youtubeId: "7YuAzR2XVAM", startAt: 5, category: "🇺🇸 Rap US" },
  { id: 62, title: "Jay-Z ft. Alicia Keys — Empire State of Mind", youtubeId: "vk6014HuxcE", startAt: 5, category: "🇺🇸 Rap US" },
  { id: 63, title: "Kendrick Lamar — HUMBLE.",         youtubeId: "MXaqpJmX7JE", startAt: 5, category: "🇺🇸 Rap US" },
  { id: 64, title: "Drake — God's Plan",               youtubeId: "xpVfcZ0ZcFM", startAt: 5, category: "🇺🇸 Rap US" },
  { id: 65, title: "50 Cent — In Da Club",             youtubeId: "5qm8PH4xAss", startAt: 5, category: "🇺🇸 Rap US" },
  { id: 80, title: "Kendrick Lamar — Not Like Us",     youtubeId: "T6eK-2OQtew", startAt: 5, category: "🇺🇸 Rap US" },
];

module.exports = SONGS;
