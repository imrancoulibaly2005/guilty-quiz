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
];

module.exports = SONGS;
