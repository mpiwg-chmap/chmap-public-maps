
const L = window.L;

const { PublicMapsController, BootstrapWrap } = window.chmapPublicMaps;

// import { Popover } from '@chmap/utilities/lib/bootstrpWrap';


function initMap() {

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

    map.whenReady(
    () => {
            //sometimes, leaflet component doesn't expand its height in a good result initially.
            //trigger a window resize event to force it to re-calculate its available height again.
            window.dispatchEvent(new Event('resize'));
        }
    );

    PublicMapsController.init(map);
}

function initToolbar(){

    const toolbar = document.getElementById('toolbar');

    const dynamicArea = toolbar.querySelector('#toolbar-dynamic');

    PublicMapsController.addButtonsTo(dynamicArea);

}

function initSidebar(){

    const sidebar = document.getElementById('sidebar');

    //Public maps
    // new Popover(document.querySelector('.what-is-public-map'), {
    //     container: 'body',
    //     trigger: 'hover'
    // });

    PublicMapsController.bindTriggerButtons({
        showAllPublicMapsBtn: sidebar.querySelector('#showAllPublicMapsBtn'),
        placeNameFilterBtn: sidebar.querySelector('#placeNameFilterBtn'),
        coordinateFilterBtn: sidebar.querySelector('#coordinateFilterBtn')
    })

}

document.addEventListener("DOMContentLoaded", (event) => {

    initMap();

    initToolbar();

    initSidebar();

});
