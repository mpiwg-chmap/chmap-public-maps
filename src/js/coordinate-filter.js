
import { OpenStreetMapService, Commons } from '@chmap/utilities';

const CoordinateFilter = function() {

    let localMap = null;

    let ptMarker = null;

    let markers = [];

    let filteringMode = 'None';

    let exitButton = null;

    let placeNameInputWrap = null;

    const localEventEmitter = new Commons.EventEmitterClass();

    function addEventListener(obj, types, fn, context) {
        localEventEmitter.on(obj, types, fn, context);
    }

    function init(map) {

        localMap = map;

    }

// ===== displaying single markers and users can d&d it on the map ==

    function placeMarker() {

        if(!ptMarker){
            ptMarker = L.marker([0, 0], {draggable: true, }).on("dragend", (e) => onDragEnd(e));
        }

        if(localMap.getZoom() < 4) {
            localMap.setZoom(4);
        }

        const { lat, lng } = localMap.getCenter();

        const newLatLng = new L.LatLng(lat, lng);

        ptMarker.setLatLng(newLatLng);

        ptMarker.addTo(localMap);

        setPopupContent({placeInfo: 'place name is loading', lat, lng});

        getPlaceInfo(lat, lng);

    }

    function onDragEnd(event) {

        const latlng = event.target._latlng

        const {lat, lng} = latlng;

        setPopupContent({placeInfo: 'place name is loading', lat, lng});

        getPlaceInfo(lat, lng)

    }

    function getPlaceInfo(lat, lng) {

        const params = {
            callback: setPopupContent,
            lat,
            lng,
            lang: 'en'
        };

        OpenStreetMapService.getInfoByLatLng(params);
    }

    function setPopupContent({placeInfo, lat, lng}) {

        ptMarker.closePopup();

        const info =
        `${placeInfo}<br>
latitude: ${lat.toFixed(6)}<br>
longitude: ${lng.toFixed(6)}<br>
zoom: ${localMap.getZoom()}`;

        ptMarker.bindPopup(createPopupContent(info, lat, lng));

        ptMarker.openPopup();

    }

    function createPopupContent(info, lat, lng) {

//TODO: i18n for button's label
        return `<div style="max-height: 200px;overflow: auto;">
${info}
</div>
<button 
    class="btn btn-primary btn-sm load-available-maps-btn"
    data-lat="${lat}"
    data-lng="${lng}"
>
    Show available maps
</button>`;

    }

//===== displaying multiple markers and users cannot d&d any single marker ==

    function placeMarkers(data) {

        clearMarkers();

        for (const node of data) {

            const {info, lat, lng} = node;

            const marker = L.marker([lat, lng]).bindPopup(createPopupContent(info, lat, lng));

            markers.push(marker);

            marker.addTo(localMap);

        }

        const group = new L.featureGroup(markers);

        localMap.fitBounds(group.getBounds());

        if( markers.length > 0 ) markers[0].openPopup();

    }

    function clearMarkers() {

        for (const marker of markers) {
            localMap.removeLayer(marker);
        }

        markers = [];

    }

//===== UI for filtering ==

    function getExitButton() {

        if (!exitButton) {

            exitButton = document.createElement("button");
            exitButton.className = 'exit-filtering-button';
            exitButton.innerText = "Exit filtering mode";
            exitButton.style.display = 'none';

            exitButton.onclick = stopFiltering;
        }

        return exitButton;

    }

    function getPlaceNameInput() {

        if (!placeNameInputWrap) {

            const div = document.createElement("div");

            placeNameInputWrap = div;

            div.className = 'place-name-input-wrap';
            div.style.display = 'none';

            const input = document.createElement("input");

            input.type = 'text';
            input.className = 'place-name-input';
            input.placeholder = 'Please input a place name';

            input.onkeyup = (e) => {
                if (e.key === "Enter") {
                    filterByPlaceName();
                }
            }

            div.appendChild(input);

            const btn = document.createElement("button");
            btn.className = 'search-button';
            btn.innerHTML = '<i class="icon"></i>'
            btn.onclick = () => filterByPlaceName();

            div.appendChild(btn);
        }

        return placeNameInputWrap;

    }

    function filterByPlaceName() {

        localEventEmitter.emit('placeNameSearchStart');

        const callback = (data) => {
            placeMarkers(data);
            localEventEmitter.emit('placeNameSearchEnd');
        }

        OpenStreetMapService.searchPlaceName(placeNameInputWrap.firstChild.value.trim(), callback);
    }

//===== filtering mode ==

    function startPlaceNameFiltering() {

        stopFiltering();

        filteringMode = 'PlaceName';

        if (placeNameInputWrap) {
            placeNameInputWrap.style.display = 'inline-flex';
        }

        if (exitButton) {
            exitButton.style.display = 'inline-block';
        }

        localEventEmitter.emit('filteringModeStart', filteringMode);

    }

    function startLatLngFiltering() {

        stopFiltering();

        filteringMode = 'LatLng';

        if (exitButton) {
            exitButton.style.display = 'inline-block';
        }

        placeMarker();

        localEventEmitter.emit('filteringModeStart', filteringMode);

    }

    function stopFiltering() {

        if (filteringMode === 'LatLng') {
            localMap.removeLayer(ptMarker);
        }

        if (filteringMode === 'PlaceName') {
            placeNameInputWrap.style.display = 'none';
            clearMarkers();
        }

        if (exitButton) {
            exitButton.style.display = 'none';
        }

        localEventEmitter.emit('filteringModeStop', filteringMode);

        filteringMode = 'None';

    }

    return {
        init,
        getExitButton,
        getPlaceNameInput,
        startPlaceNameFiltering,
        startLatLngFiltering,
        stopFiltering,
        on: addEventListener,
    }

    /* Events

    { name: 'filteringModeStart, params: filteringMode:String },
    { name: 'filteringModeStop, params: filteringMode:String },
    { name: 'placeNameSearchStart', params: null },
    { name: 'placeNameSearchEnd', params: null },

    */
}();

export default CoordinateFilter;
