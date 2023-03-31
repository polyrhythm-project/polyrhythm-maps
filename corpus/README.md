# Corpus Map

This map is meant to show the locations of where certain works first premiered. The original interactive map included features that were displayed as a heat map at certain levels. When zoomed in, a user could click on a work and get metadata elements. All metadata is availble on FDS_Metadata_1900DS_ArcGIS_18May2019_master (https://docs.google.com/spreadsheets/d/17rjKQ3lXJHEHAcDfOXTDNX5a0A_jVqwokcaqhd3Ddng/edit?usp=sharing)

Metadata points for this map include:
- Composer Name
- Work Title
- Genre (Sub-genre)
- Composition Year
- Premiere Date
- Publication Year
- Premiere Location: Venue, City, Country
- Performing Ensemble, Conductor, Soloist(s)
- Corpus Examples

NOTES:
- In cases where the venue in unknown, use "unknown" as data point and use gocoding for city
- In cases where there is no performing ensemble, conductor, or soloist, use "none" or "unknown" as datapoint (refer to FDS master)
-  Corpus Examples are listed and associated with links to website example pages (https://polyrhythm.humdrum.org/); IDs start with a letter (R or T), followed by a three-digit number. A number of IDs end with an upper-case letter (A, B, C, or D) or a lower-case "x".

![Original CARTO premieres map](premieres-carto.png)

# Proposed Solution

1. Create map document using Leaflet JS/CSS, using a CARTO basemap ([https://github.com/CartoDB/basemap-styles](https://github.com/CartoDB/basemap-styles)). Alternatively Stamen Designs or other OpenStreetMap-based basemap that allows use without API.
2. Transform a copy of existing csv data into GeoJSON to be queried and displayed as map layer. This GeoJSON file will be stored in this `premieres` directory.
3. Test and implement Leaflet marker clusters plugin ([https://github.com/Leaflet/Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster)).
4. Add to the resulting `premieres-map.html` file inline comments inside the `<html>` and `<script>` tags to indicate where and how to make future configurations. This README.md will also include written instructions describing the files/content of this directory.

# Further Explorations

- [https://github.com/Leaflet/Leaflet.heat](https://github.com/Leaflet/Leaflet.heat) – A tiny, simple and fast heatmap plugin for Leaflet.
