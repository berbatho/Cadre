# Dictionnaire de données — Courts métrages d'animation en festival

## Entité `films`
- `id` : identifiant unique.
- `title` : titre officiel.
- `original_title` : titre original si différent.
- `release_year` : année de sortie.
- `country_codes` : pays de production (ISO alpha-2, multiple).
- `duration_minutes` : durée.
- `synopsis` : résumé court.
- `animation_techniques` : 2D, stop-motion, CG, mixte, etc.
- `languages` : langues parlées.
- `subtitles` : langues de sous-titrage disponibles.
- `genres` : drame, comédie, expérimental, etc.
- `age_rating` : tous publics / +12 / +16...
- `status` : completed / in_production / announced.
- `website_url` : site officiel du film.
- `poster_url` : visuel affiche.
- `created_at`, `updated_at` : audit.

## Entité `people`
- `id`, `full_name`, `country_code`, `birth_year`.
- `website_url`, `imdb_url`, `social_url`.

## Entité `film_people_roles`
Table pivot pour relier film ↔ personne ↔ rôle.
- `role`: director, producer, writer, animator, composer, editor...
- `credit_order`: ordre d'apparition générique.

## Entité `festivals`
- `id`, `name`, `country_code`, `city`.
- `website_url`.
- `tier`: A-list, recognized, niche, student, regional.

## Entité `festival_editions`
- `festival_id`, `year`, `start_date`, `end_date`.
- `theme`, `edition_label`.

## Entité `screenings`
- relie un film à une édition de festival.
- `section_name`: compétition, panorama, midnight, etc.
- `screening_date`.
- `premiere_status`: world / international / national / regional.
- `award_outcome`: winner / nominee / official_selection.
- `award_name`.

## Entité `media_assets`
- `asset_type`: trailer, full_film, teaser, clip, press_kit, interview.
- `url`.
- `platform`: YouTube, Vimeo, festival_platform, private_screener.
- `is_public`.
- `language`, `geo_restriction`, `expires_at`.

## Entité `sources`
- source de vérité de chaque info.
- `source_type`: official_festival, distributor, filmmaker, scraper, manual.
- `source_url`, `source_name`, `confidence_score`, `last_checked_at`.

## Entité `film_external_ids`
- map vers IMDb, TMDb, Letterboxd, Unifrance, etc.
- utile pour dédoublonnage et enrichissement.
