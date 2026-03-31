# Cadre

Prototype d'interface admin pour centraliser les données de courts métrages d'animation sélectionnés en festivals (majeurs et niches).

## Objectif
Construire une base exploitable pour :
- référencer les films,
- tracer leurs passages en festivals,
- relier les personnes clés (réalisation, production, etc.),
- stocker trailers / liens de visionnage,
- permettre une manipulation simple en interface (création, édition, suppression, import/export JSON),
- préparer une ingestion de données à grande échelle.

> ⚠️ Une liste « complète de tous les films de tous les festivals » nécessite des connecteurs/API/scraping et une curation éditoriale continue.

## Démarrage rapide
Aucun build n'est requis pour la maquette actuelle.

```bash
python3 -m http.server 8000
```

Puis ouvrez :
- `http://localhost:8000/admin/`

## Fonctionnalités de l'interface
- Recherche multi-champs (film, personne, festival)
- Filtres année / pays
- Sélection d'un film depuis la liste
- Édition complète des champs principaux
- Gestion des lignes dynamiques : personnes, screenings festivals, médias (trailer, film complet, etc.)
- Création / suppression de film
- Sauvegarde locale automatique (`localStorage`)
- Import / export JSON pour manipuler le catalogue

## Structure
- `admin/` : interface admin statique (prototype fonctionnel orienté manipulation de données).
- `data/sample_short_films.json` : exemples de données multi-festivals.
- `data/schema.sql` : schéma relationnel recommandé (PostgreSQL/SQLite avec ajustements mineurs).
- `data/data_dictionary.md` : dictionnaire de données et champs essentiels.

## Prochaines étapes recommandées
1. Brancher l'interface sur une API backend (auth + persistance serveur).
2. Implémenter ingestion par source (Annecy, Clermont-Ferrand, Ottawa, etc.).
3. Ajouter workflow QA (doublons, normalisation des noms, liens morts).
4. Ajouter historique de modifications et rôles utilisateur.
5. Exposer API publique read-only.
