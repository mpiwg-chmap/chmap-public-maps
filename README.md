# public-maps

This project provides a list that contains 300+ public maps collected by CHMap project

## Demos

- [example](http://www.github.io/chmap/public-maps/example)

## Getting Started

Several quick start options are available:

- Insert `<script src="js/chmap-public-maps.js"></script>` into the `<head>` tag.
- Install with npm: `npm install @chmap/public-maps`
- Install with yarn: `yarn add @chmap/public-maps`

## Usage with the scrip tag

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
    <meta http-equiv="x-ua-compatible" content="ie=edge"/>
    <title>CHMap</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==" crossorigin=""/>
    <link href="css/index.css" rel="stylesheet" />
    <script src="js/chmap-public-maps.js"></script>
</head>
<body>
    <div id="map" />
</body>
</html>
```

You can extract components from the global variable, chmapPublicMaps, such as:

```
const { PublicMapsController } = window.chmapPublicMaps;

const defaultLayer = L.tileLayer("https://stamen-tiles-a.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}.png",
    { attribution: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> â€” Map data Â© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tileset url:<span style="color:blue">https://stamen-tiles-a.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}.png</span>' });

const map = L.map("map", {
    center: [35, 108],
    attributionControl: false,
    zoom: 4,
    minZoom: 0,
    maxZoom: 16,
    layers: [defaultLayer],
});

PublicMapsController.init(map);
    
```

Please browse all files under the example folder for more detail usage.

## Building from the source

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
    <meta http-equiv="x-ua-compatible" content="ie=edge"/>
    <title>CHMap</title>
    <link href="css/index.css" rel="stylesheet" />
</head>
<body>
    <div id="map" />
    <script src="js/index.js"></script>
</body>
</html>
```

```
import { PublicMapsController } from "@chmap/public-maps";

const defaultLayer = L.tileLayer("https://stamen-tiles-a.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}.png",
    { attribution: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> â€” Map data Â© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tileset url:<span style="color:blue">https://stamen-tiles-a.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}.png</span>' });

const map = L.map("map", {
    center: [35, 108],
    attributionControl: false,
    zoom: 4,
    minZoom: 0,
    maxZoom: 16,
    layers: [defaultLayer],
});

PublicMapsController.init(map);

```


## License

Licensed under the [GNU GPLv3](LICENSE) license.
