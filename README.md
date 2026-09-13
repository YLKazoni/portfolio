# Portfolio — Yves Landry Kazoni

Site statique HTML/CSS/JS, sans dépendance de build, prêt pour GitHub Pages.
Structure conforme au brief « modèle mon-portfolio-data-analyst.fr » :
projets organisés **par outil/compétence**, section procédé en 4 étapes,
contact direct.

## Structure

```
index.html            Accueil (héros + atout dev + 3 catégories + procédé)
projets.html            Vue d'ensemble des projets (grille de catégories)
powerbi.html             Catégorie Power BI (galerie de dashboards cliquables)
econometrie.html          Catégorie R/Économétrie (cartes vers les 2 mini-projets)
projet-assurance.html      Détail mini-projet 1 — onglets + tableaux triables
projet-chomage.html        Détail mini-projet 2 — onglets + tableaux triables
machine-learning.html      Catégorie Python/ML ("à venir")
a-propos.html             Parcours narratif (dev → terrain → économétrie)
cv.html                  CV complet
contact.html              Formulaire + coordonnées
style.css / script.js
powerbi/                  Fichiers .pbix
reports/                  PDF des rapports (non liés dans l'interface actuellement)
```

## Ce qui distingue cette version

- **Atout "développement" mis en avant** : bandeau sur l'accueil, encart sur
  la page Projets et sur la page Économétrie, section dédiée sur À propos,
  callout + ligne de formation enrichie sur le CV.
- **Navigation par catégorie d'outil**, comme le site de référence : Power BI /
  Économétrie (R) / Python-ML, chacune avec sa propre sous-navigation.
- Les tableaux de résultats restent **triables et filtrables** dans les
  pages de détail projet.

## À finaliser avant publication

1. Liens GitHub / LinkedIn dans `contact.html` (actuellement `href="#"`).
2. Vraies captures d'écran ou liens "Publier sur le web" pour les dashboards
   Power BI (voir la note technique dans `powerbi.html`).
3. Premier projet Python à ajouter dans `machine-learning.html` quand prêt.

## Déployer sur GitHub Pages

```bash
cd portfolio
git init && git add . && git commit -m "Portfolio"
git branch -M main
git remote add origin https://github.com/ton-pseudo/portfolio.git
git push -u origin main
```
Puis **Settings → Pages → Deploy from a branch → main / (root)**.
