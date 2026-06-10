const SONGS = [

  // ══════════════════════════════════════════════════════
  //  🇫🇷  FRANCO-EUROPÉEN
  // ══════════════════════════════════════════════════════
  { id: 1,  title: "Oggy et les Cafards",          youtubeId: "ybI6UecpU8w", startAt: 5, category: "🇫🇷 Franco-Européen" },
  { id: 2,  title: "Les Zinzins de l'Espace",       youtubeId: "mbd2linSia4", startAt: 5, category: "🇫🇷 Franco-Européen" },
  { id: 3,  title: "Totally Spies (VF)",            youtubeId: "U6lvy7ZFZ5M", startAt: 5, category: "🇫🇷 Franco-Européen" },
  { id: 4,  title: "Code Lyoko",                    youtubeId: "lLwk_lpvL44", startAt: 5, category: "🇫🇷 Franco-Européen" },
  { id: 5,  title: "Wakfu",                         youtubeId: "cp1J7CJ7A8w", startAt: 5, category: "🇫🇷 Franco-Européen" },
  { id: 6,  title: "Galactik Football",             youtubeId: "abzhBJDqYug", startAt: 5, category: "🇫🇷 Franco-Européen" },
  { id: 7,  title: "Winx Club (VF)",                youtubeId: "C7LZ4LVUA4o", startAt: 5, category: "🇫🇷 Franco-Européen" },
  { id: 8,  title: "W.I.T.C.H. (VF)",              youtubeId: "CezZlMitCq8", startAt: 5, category: "🇫🇷 Franco-Européen" },
  { id: 9,  title: "Corneil et Bernie",             youtubeId: "6wwJEUuYdQc", startAt: 5, category: "🇫🇷 Franco-Européen" },
  { id: 10, title: "Skyland",                       youtubeId: "bA7TKjmWYFU", startAt: 5, category: "🇫🇷 Franco-Européen" },

  // ══════════════════════════════════════════════════════
  //  ⚽  SPORT & URBAN
  // ══════════════════════════════════════════════════════
  { id: 11, title: "Foot 2 Rue",                    youtubeId: "CaR7ADuVWvg", startAt: 5, category: "⚽ Sport & Urban" },
  { id: 12, title: "Baskup : Tony Parker",          youtubeId: "rrsK1iEbya8", startAt: 5, category: "⚽ Sport & Urban" },
  { id: 13, title: "Olive & Tom (Captain Tsubasa)", youtubeId: "juQl2UbcD7w", startAt: 5, category: "⚽ Sport & Urban" },
  { id: 14, title: "Inazuma Eleven (VF)",           youtubeId: "3aHHa3vbCzU", startAt: 5, category: "⚽ Sport & Urban" },

  // ══════════════════════════════════════════════════════
  //  🕹️  CLASSIQUES 80–90s
  // ══════════════════════════════════════════════════════
  { id: 15, title: "Inspecteur Gadget (VF)",        youtubeId: "VHneKZ9AmwM", startAt: 5, category: "🕹️ Classiques 80-90s" },
  { id: 16, title: "Capitaine Flam",                youtubeId: "Q_hE-UhuJoY", startAt: 5, category: "🕹️ Classiques 80-90s" },
  { id: 17, title: "Les Tortues Ninja (VF)",        youtubeId: "fM-ZdYXFI30", startAt: 5, category: "🕹️ Classiques 80-90s" },
  { id: 18, title: "Aaahh!!! Les Dingues (VF)",     youtubeId: "8VfPz-2V8PU", startAt: 5, category: "🕹️ Classiques 80-90s" },
  { id: 19, title: "Courage le Chien Froussard (VF)", youtubeId: "CS94Dhv8Eoo", startAt: 5, category: "🕹️ Classiques 80-90s" },

  // ══════════════════════════════════════════════════════
  //  📺  CN, NICK & DISNEY
  // ══════════════════════════════════════════════════════
  { id: 20, title: "Dexter (VF)",                   youtubeId: "jSJo0UKRg7w", startAt: 5, category: "📺 CN, Nick & Disney" },
  { id: 21, title: "Les Supers Nanas (VF)",         youtubeId: "ggPtT2By51o", startAt: 5, category: "📺 CN, Nick & Disney" },
  { id: 22, title: "Ben 10 (VF)",                   youtubeId: "Wd7vFAyFLZk", startAt: 5, category: "📺 CN, Nick & Disney" },
  { id: 23, title: "Bob l'Éponge (VF)",             youtubeId: "0wGq5gpkBC0", startAt: 5, category: "📺 CN, Nick & Disney" },
  { id: 24, title: "Danny Phantom (VF)",            youtubeId: "FOLib6CzdOg", startAt: 5, category: "📺 CN, Nick & Disney" },
  { id: 25, title: "Avatar : Le Dernier Maître (VF)", youtubeId: "SRw0f2S8JcE", startAt: 5, category: "📺 CN, Nick & Disney" },
  { id: 26, title: "Mes Parrains Magiques (VF)",    youtubeId: "jsJcQAhV83o", startAt: 5, category: "📺 CN, Nick & Disney" },
  { id: 27, title: "Kim Possible (VF)",             youtubeId: "GkKx5fz31w8", startAt: 5, category: "📺 CN, Nick & Disney" },
  { id: 28, title: "American Dragon Jake Long (VF)", youtubeId: "cxwSxWuaBr8", startAt: 5, category: "📺 CN, Nick & Disney" },

  // ══════════════════════════════════════════════════════
  //  🎌  ANIME VF
  // ══════════════════════════════════════════════════════
  { id: 29, title: "Naruto (VF)",                   youtubeId: "rDwg7Y8BdXE", startAt: 5, category: "🎌 Anime VF" },
  { id: 30, title: "Dragon Ball Z (VF)",            youtubeId: "1JAuE1XC-ro", startAt: 5, category: "🎌 Anime VF" },
  { id: 31, title: "One Piece (VF)",                youtubeId: "LDHwn2dUbMw", startAt: 5, category: "🎌 Anime VF" },
  { id: 32, title: "Pokémon (VF)",                  youtubeId: "YhN4oAS3O4c", startAt: 5, category: "🎌 Anime VF" },
  { id: 33, title: "Yu-Gi-Oh! (VF)",               youtubeId: "ErhzuwW9uGs", startAt: 5, category: "🎌 Anime VF" },
  { id: 34, title: "Fairy Tail (VF)",               youtubeId: "NOldpCyItVc", startAt: 5, category: "🎌 Anime VF" },
  { id: 35, title: "Beyblade (VF)",                 youtubeId: "TGgUbDoPj3w", startAt: 5, category: "🎌 Anime VF" },
  { id: 36, title: "Sonic X (VF)",                  youtubeId: "5c8Q7LzaI5k", startAt: 5, category: "🎌 Anime VF" },
];

module.exports = SONGS;
