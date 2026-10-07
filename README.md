# Aley Digital Twin — pre-alpha 0.001

This is an intentionally lightweight, playable 2D driving prototype for a focused Piscine Street / Aley Center district. It draws an offline stylized map from bundled OpenStreetMap road and building geometry.

## Run it

Open `index.html` in any modern browser. It needs no installation, game engine, account or internet connection.

## What it proves

- Aley can start as a lightweight browser experiment on the 2015 Mac.
- The player can drive to three delivery markers while traffic loops through the district.
- We can iterate on scale, landmark placement and driving feel before buying a game-development PC.
- The eventual data pipeline is: exact OpenStreetMap road graph/building footprints + terrain DEM + manually curated Aley landmarks.

## What it does not claim

The car uses smooth arcade steering constrained to the road surface. It is deliberately not full vehicle physics, collision handling, or a full traffic simulation yet.
