// Cles publiques Supabase (la cle publishable est faite pour etre exposee cote navigateur, RLS protege les tables).
window.ANTOUKA_CONFIG = {
  url: 'https://mctvmvrsbobiocfumflc.supabase.co',
  key: 'sb_publishable_Jaj5tQHpbojTOUas3AZ0tg_C-cgeWUk',
  // Niveau max accepte par la table runs. Passer a 6 une fois supabase/migrations/0002_level6.sql appliquee.
  maxLevel: 4,
  // Quiz avant boss desactive jusqu'a cette date (ISO UTC). Vide ou passe = quiz actif.
  quizOffUntil: '2026-10-15T15:47:05.012Z',
  // Empreinte SHA-256 du code d'acces dev (genere par scripts/dev-code.mjs). Le code lui-meme n'est pas dans le depot.
  devHash: 'b971318c4f36b1c93b580433609942bda878f9ef7c6394a984031fab84db0541',
};
