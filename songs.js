const SONGS = [
  // 🇫🇷 FRANCO-EUROPÉEN
  { id: 1,  title: "Oggy et les Cafards",              youtubeId: "VVqhB7naYlo", startAt: 0, category: "🇫🇷 Franco-Européen" },
  { id: 2,  title: "Les Zinzins de l'Espace",           youtubeId: "W1RHpBGKqHY", startAt: 0, category: "🇫🇷 Franco-Européen" },
  { id: 3,  title: "Totally Spies",                     youtubeId: "8u_S5bGMXSQ", startAt: 0, category: "🇫🇷 Franco-Européen" },
  { id: 4,  title: "Code Lyoko",                        youtubeId: "PsebpVtTe8g", startAt: 0, category: "🇫🇷 Franco-Européen" },
  { id: 5,  title: "Wakfu",                             youtubeId: "ZcTJpg5LfEo", startAt: 0, category: "🇫🇷 Franco-Européen" },
  { id: 6,  title: "Galactik Football",                 youtubeId: "U_jA0n2p-5E", startAt: 0, category: "🇫🇷 Franco-Européen" },
  { id: 7,  title: "W.I.T.C.H.",                        youtubeId: "cWN5OPkxb1A", startAt: 0, category: "🇫🇷 Franco-Européen" },
  { id: 8,  title: "Winx Club",                         youtubeId: "UkYY_1JGHoQ", startAt: 0, category: "🇫🇷 Franco-Européen" },
  { id: 9,  title: "Corneil et Bernie",                 youtubeId: "pJ3OTVU0LMU", startAt: 0, category: "🇫🇷 Franco-Européen" },
  { id: 10, title: "Skyland",                           youtubeId: "xHjbCbMkFvY", startAt: 0, category: "🇫🇷 Franco-Européen" },
  { id: 11, title: "Grossology",                        youtubeId: "Vk3GxPbHFpM", startAt: 0, category: "🇫🇷 Franco-Européen" },

  // 📺 CARTOON NETWORK / NICKELODEON
  { id: 12, title: "Dexter's Laboratory",               youtubeId: "OdFBuCSjCb0", startAt: 0, category: "📺 CN / Nickelodeon" },
  { id: 13, title: "Cow and Chicken",                   youtubeId: "y-2B_0rmBkQ", startAt: 0, category: "📺 CN / Nickelodeon" },
  { id: 14, title: "Johnny Bravo",                      youtubeId: "rFmBb9VkgwU", startAt: 0, category: "📺 CN / Nickelodeon" },
  { id: 15, title: "Les Supers Nanas (PPG)",            youtubeId: "6TiOgBYgHSo", startAt: 0, category: "📺 CN / Nickelodeon" },
  { id: 16, title: "Ben 10",                            youtubeId: "YIZLCIbMltY", startAt: 0, category: "📺 CN / Nickelodeon" },
  { id: 17, title: "Danny Phantom",                     youtubeId: "JE_3XBZWNGE", startAt: 0, category: "📺 CN / Nickelodeon" },
  { id: 18, title: "Fairly OddParents",                 youtubeId: "GezD8VFNFrI", startAt: 0, category: "📺 CN / Nickelodeon" },
  { id: 19, title: "SpongeBob SquarePants",             youtubeId: "r9L4AseD2qQ", startAt: 0, category: "📺 CN / Nickelodeon" },
  { id: 20, title: "Jimmy Neutron",                     youtubeId: "z_yDMQPBnkw", startAt: 0, category: "📺 CN / Nickelodeon" },
  { id: 21, title: "Avatar : Le Dernier Maître de l'Air", youtubeId: "d9MyW72ELq0", startAt: 0, category: "📺 CN / Nickelodeon" },
  { id: 22, title: "Courage le chien froussard",        youtubeId: "3gH1E4JgbIw", startAt: 0, category: "📺 CN / Nickelodeon" },
  { id: 23, title: "Yin Yang Yo!",                      youtubeId: "2VBmBbpCkjQ", startAt: 0, category: "📺 CN / Nickelodeon" },

  // 🏰 DISNEY CHANNEL
  { id: 24, title: "Kim Possible",                      youtubeId: "aDLtH_EXFCQ", startAt: 0, category: "🏰 Disney" },
  { id: 25, title: "Lilo & Stitch (série)",             youtubeId: "CsJZ4AQkCxo", startAt: 0, category: "🏰 Disney" },
  { id: 26, title: "La Récré c'est sacré (Recess)",     youtubeId: "8oE_U6IDzb8", startAt: 0, category: "🏰 Disney" },
  { id: 27, title: "American Dragon Jake Long",         youtubeId: "5bSh7lqvFeo", startAt: 0, category: "🏰 Disney" },
  { id: 28, title: "Brandy & Mr. Whiskers",             youtubeId: "2SRBAlJgLJI", startAt: 0, category: "🏰 Disney" },

  // ⚔️ ANIME / SHONEN
  { id: 29, title: "Naruto",                            youtubeId: "Nf3HenHEMdA", startAt: 0, category: "⚔️ Anime / Shonen" },
  { id: 30, title: "Dragon Ball Z (Cha-La Head)",       youtubeId: "IuCpLFGLLpg", startAt: 0, category: "⚔️ Anime / Shonen" },
  { id: 31, title: "One Piece",                         youtubeId: "vGJZQSAiDCQ", startAt: 0, category: "⚔️ Anime / Shonen" },
  { id: 32, title: "Pokémon",                           youtubeId: "rg6CiPI6h1g", startAt: 0, category: "⚔️ Anime / Shonen" },
  { id: 33, title: "Yu-Gi-Oh!",                         youtubeId: "zQlbFN6vIw0", startAt: 0, category: "⚔️ Anime / Shonen" },
  { id: 34, title: "Bleach (Asterisk)",                 youtubeId: "Dgm1-8mJ2_U", startAt: 0, category: "⚔️ Anime / Shonen" },
  { id: 35, title: "Fairy Tail",                        youtubeId: "0TYhR-RJkqY", startAt: 0, category: "⚔️ Anime / Shonen" },
  { id: 36, title: "Beyblade",                          youtubeId: "lHGjnHNKFpA", startAt: 0, category: "⚔️ Anime / Shonen" },
  { id: 37, title: "Sonic X",                           youtubeId: "IxfTwGJyS7M", startAt: 0, category: "⚔️ Anime / Shonen" },

  // ⚽ SPORT & URBAN
  { id: 38, title: "Foot 2 Rue",                        youtubeId: "U9_gHDyMNSA", startAt: 0, category: "⚽ Sport & Urban" },
  { id: 39, title: "Baskup : Tony Parker",              youtubeId: "rW3QiGVDvOA", startAt: 0, category: "⚽ Sport & Urban" },
  { id: 40, title: "Olive & Tom (Captain Tsubasa)",     youtubeId: "QmXnYfRLgUc", startAt: 0, category: "⚽ Sport & Urban" },
  { id: 41, title: "Slam Dunk",                         youtubeId: "gA9mTMJfoB0", startAt: 0, category: "⚽ Sport & Urban" },
  { id: 42, title: "Inazuma Eleven",                    youtubeId: "GKHzPiP5mDI", startAt: 0, category: "⚽ Sport & Urban" },

  // 🕹️ CLASSIQUES 90s
  { id: 43, title: "Inspecteur Gadget",                 youtubeId: "7DP4JB8M2Jw", startAt: 0, category: "🕹️ Classiques 90s" },
  { id: 44, title: "Les Tortues Ninja",                 youtubeId: "nNf4-Mj9WNw", startAt: 0, category: "🕹️ Classiques 90s" },
  { id: 45, title: "Capitaine Flam",                    youtubeId: "xUqMtcXuYBQ", startAt: 0, category: "🕹️ Classiques 90s" },
  { id: 46, title: "Aaahh!!! Les dingues",              youtubeId: "lx6TnMFSsEI", startAt: 0, category: "🕹️ Classiques 90s" },
];

module.exports = SONGS;
