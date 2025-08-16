# Hunter x Hunter Evolution

Hunter x Hunter Evolution is a fan-made video game project built with **RPG Maker MV**. This repository holds the entire game, a small website, and deployment scripts. The game follows the 2011 anime storyline and can be played in the browser or through separately distributed desktop/Android builds.

## Main Contents

- `audio/`, `img/`, `movies/` – audio/video resources and images for the game
- `data/` – RPG Maker database files (maps, events, etc.)
- `js/` – RPG Maker JavaScript engine and custom plugins
- `fonts/` and `icon/` – font files and icons
- `index.html` – entry point for the web version of the game
- `site/` – PHP pages for the public website where players can download or report bugs
- `workspace/` – scripts used for server deployment

To play the game locally, open `index.html` in a compatible browser (or use an NW.js executable for desktop builds).

## Notes

This is a non-profit fan project. Hunter x Hunter Evolution is not affiliated with any official Hunter x Hunter entities. Content may be removed at the rights holders' request.



🧠 Pseudo-Algorithme Général – Marécage de Nebel
🟢 PHASE D'INTRO

Scène cinématique :

Satotsu guide les participants dans le marécage.

Killua ressent une tension liée à Hisoka.

Dialogue Gon/Killua → alerte.

Dialogue Gon/Kurapika/Leolio → décision de se séparer.

CHOIX JOUEUR :

🅰️ Suivre Gon & Killua

🅱️ Suivre Kurapika & Leolio

🅰️ SCÉNARIO GON & KILLUA
🎮 Gameplay : Suivi de Satotsu

Objectif : rester proche de Satotsu sans trop se faire ralentir.

Événements ralentissants (flaques, ennemis, brouillard).

Suivi invisible de la distance / score.

À la fin :

Si score élevé (distance correcte) → débloque combat jouable Hisoka vs Cherry.

Si score bas (distance trop élevée) → cinématique non jouable du même combat.

🎭 Scène post-combat :

Killua suit Satotsu.

Gon doute → CHOIX : suivre Killua ou non.

Si Gon suit Killua :

Plus tard, mini-jeu de ravisement (type réflexion / souvenir / piste).

Gon revient.

Active la scène de sauvetage de Leolio.

QTE lancé au moment du coup → bonus fidélité si réussi.

Si Gon ne suit pas Killua :

Pas de mini-jeu.

QTE non déclenché.

Moins de fidélité avec Leolio.

🅱️ SCÉNARIO KURAPIKA & LEOLIO
🎮 Gameplay : Exploration

Cartes labyrinthiques, brouillard, pièges, énigmes, mini-jeux.

Combats aléatoires contre monstres du marécage.

Rencontre indirecte avec Cherry/sbires (discussions, repérage).

🎭 Scène finale :

Kurapika & Leolio croisent Hisoka.

Tension → fuite → séparation.

Leolio revient par bravoure → se fait menacer.

Convergence : Gon arrive pour sauver Leolio :

QTE lancé si conditions réunies côté Gon (bon chemin + retour).

QTE réussi = + fidélité.

Échec ou absence = fidélité non modifiée.

🔁 SCÉNARIO EN ORDRE INVERSÉ

Si le joueur commence par Kurapika & Leolio :

Même contenu jusqu'à leur confrontation finale.

À la fin → bascule vers Gon & Killua, joué de manière linéaire :

Suivi de Satotsu,

Scène d'Hisoka (jouable ou non selon performance),

Choix de retour ou non,

QTE final si retour effectué.