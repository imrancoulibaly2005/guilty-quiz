// Récupère la photo Wikipedia d'une célébrité (API publique, sans clé)
async function fetchWikiPhoto(title) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res  = await fetch(url, { headers: { 'User-Agent': 'GuiltyQuiz/2.0' } });
    if (!res.ok) return null;
    const data = await res.json();
    // Préférer la plus grande image disponible
    return data.originalimage?.source || data.thumbnail?.source || null;
  } catch {
    return null;
  }
}

module.exports = fetchWikiPhoto;
