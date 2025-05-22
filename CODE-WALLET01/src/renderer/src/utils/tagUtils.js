// Fonction utilitaire pour parser une chaîne de tags séparés par virgules
// Renvoie un tableau de tags propres : trim, minuscules, sans doublons
function parseTags(tagString) {
  if (!tagString) return []; // Si chaîne vide ou null, on renvoie un tableau vide
  const tags = tagString.split(',')
    .map(t => t.trim().toLowerCase()) // nettoyage et uniformisation
    .filter(t => t.length > 0); // filtre les entrées vides
  return [...new Set(tags)]; // supprime doublons en convertissant en Set puis array
}

// Filtre les fragments pour ne garder que ceux contenant un tag donné
// Si tag vide, on renvoie tout
function filterFragmentsByTag(fragments, tag) {
  if (!tag) return fragments; // pas de filtre si tag vide
  return fragments.filter(fragment => fragment.tags.includes(tag.toLowerCase())); 
  // on compare en lowercase pour éviter les erreurs de casse
}

module.exports = {
  parseTags,
  filterFragmentsByTag
};
