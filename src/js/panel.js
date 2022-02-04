
import { Constants, Commons, BootstrapWrap } from "@chmap/utilities";

import { DistortableImageLayer } from '@chmap/leaflet-extensions';

const { Offcanvas } = BootstrapWrap;

const { GEO_REF_IMG_SIZE, PUBLIC_MAP_API_URL } = Constants;

const PublicMapsPanel = function() {

    const localEventEmitter = new Commons.EventEmitterClass();

    let localMap = null;

    let allLayers = [];

    let activeLayer;

    let activeLayerBorder;

    let panel = null;

    let filterInfo = null;

    let panelBody = null;

    let previewInfo = null;

    let lastPreviewBtn = null;

    let showIIIFViewerBtn = null;

    let lastFilter = {};

    const HINT_FOR_PREVIEW = 'Click an eye icon to preview the map. <br>Re-click it again to cancel the preview.';

    function addEventListener(obj, types, fn, context) {
        localEventEmitter.on(obj, types, fn, context);
    }

    function init(map) {

        localMap = map;

    }

//===== UI: Offcanvas ==

    function createUI() {

        const div = document.createElement('div');

        //WARNING: The layout is highly tied to bootstrap V5
        const html =
`<div id="public-maps-list"
     class="offcanvas offcanvas-end"
     data-bs-scroll="true"
     data-bs-backdrop="false"
     tabindex="-1"
     aria-labelledby="offcanvasScrollingLabel">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title">All available public maps</h5>
        <button type="button" class="close-btn" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="filter-info"></div>
    <div class="preview-info preview-hint">${HINT_FOR_PREVIEW}</div>
    <div class="button-container">
        <button class="show-IIIF-viewer-btn" 
                style="visibility:hidden;" title="Show in the IIIF viewer">
            <i class="icon"></i>
        </button>
        <button class="save-btn">
            Add selected into 'Your Layers'
        </button>
    </div>
    <div class="offcanvas-body"></div>
</div>`;

        div.innerHTML = html;

        document.body.append(div);

    }

    function bindPointersAndEvents() {

        const offCanvasDom = document.getElementById('public-maps-list');

        //keep panel pointer
        panel = new Offcanvas(offCanvasDom);

        filterInfo = offCanvasDom.querySelector('.filter-info');

        //keep previewInfo pointer
        previewInfo = offCanvasDom.querySelector('.preview-info');

        //keep showIIIFViewerBtn pointer
        showIIIFViewerBtn = offCanvasDom.querySelector('.show-IIIF-viewer-btn');

        showIIIFViewerBtn.onclick = showIIIFViewer;

        //keep panelBody pointer
        panelBody = offCanvasDom.querySelector('.offcanvas-body');

        //bind closed event for clearing
        offCanvasDom.addEventListener('hidden.bs.offcanvas', clearResources);

        //bind save button's click event
        offCanvasDom.querySelector('.save-btn').onclick = saveLayers;
    }

    function show() {

        if(!panel) return;

        panel.show();

        localEventEmitter.emit('shown', '');

    }

    function hide() {
        if (panel) {
            panel.hide();
        }
    }

    function clearResources() {
        clearPreviewLayer();
    }

//===== re-render UI for doing a filtering ==

    function filterByLatLng(lat, lng) {

        if (lastFilter.lat === lat &&
            lastFilter.lng === lng && panel) {
            show();
            return;
        }

        lastFilter = { lat, lng };

        let strFilterInfo = '';

        let url = PUBLIC_MAP_API_URL;

        if(lat != null && lng != null ){

            strFilterInfo = `around ( lat: ${lat.toFixed(6)}, lng: ${lng.toFixed(6)} )`;

            url += `?lat=${lat}&lng=${lng}`;
        }

        fetch(url)
        .then(response => response.ok ? response : Promise.reject({err: response.status}))
        .then(response => response.json())
        .then(json => renderAndShow(json, strFilterInfo))
        .catch(error => {
            console.error('Error:', error);
            localEventEmitter.emit('exception', 'Cannot access public maps service, please contact administrators');
        });
    }

    function renderAndShow(json, strFilterInfo) {

        if (!panel) {

            createUI();

            bindPointersAndEvents();

        }

        renderList(json, strFilterInfo);

        bindPreviewBtn();

        show();
    }

    function renderList(layers, strFilterInfo) {

        filterInfo.innerText = strFilterInfo;

        allLayers = layers;

        const html = [];
        let lastCategory = "";

        const convertZoomProps = (item) => {
            item.zoomMin = item.zf;
            item.zoomMax = item.zt;

            delete item.zf;
            delete item.zt;
        }

        const IDMap = {};

        for (let index = 0, len = layers.length; index < len; index++) {

            const item = layers[index];

            if(IDMap[item.id]){
                continue;
            }

            IDMap[item.id] = true;

            convertZoomProps(item);

            const isIIIF = (item.ty === "iiif") ? "is-iiif" : "";

            if (lastCategory !== item.cat) {
                if (html.length > 0) {
                    html.push('</div>')
                }
                html.push('<div class="list-group">');
                html.push(item.cat);
                lastCategory = item.cat;
            }

            item.longTitle = `Zoom Level:${item.zoomMin}-${item.zoomMax} ${item.ty}:${item.na} ${item.sname}`;

            html.push(
`<div class="map-list-item ${isIIIF}">
    <input type="checkbox" name="PublicMapCheck" value="${index}">
    <i class="preview-icon" data-layer-index="${index}"></i>
    <span title="${item.longTitle}" >${item.na}  ${item.sname}</span>
 </div>`);

        }

        if (html.length > 0) html.push('</div>');

        panelBody.innerHTML = html.join('');

    }

    function bindPreviewBtn() {

        const btns = panelBody.querySelectorAll('.preview-icon');

        for (const btn of btns) {

            btn.onclick = (e) => {

                if (btn.classList.contains("in-preview")) {

                    clearPreviewLayer(true);

                } else {

                    if (lastPreviewBtn) {
                        const classList = lastPreviewBtn.classList;
                        classList.toggle('in-preview');
                    }

                    previewLayer(parseInt(btn.getAttribute('data-layer-index'), 10));

                    setLastPreviewBtn(btn);

                }

                btn.classList.toggle('in-preview');
            }
        }

    }


//==================

    function showIIIFViewer() {

        localEventEmitter.emit('showIIIFViewer', activeLayer.options.ifffBtnParams);

    }

//===== node's actions ==

    function setLastPreviewBtn(btn) {

        lastPreviewBtn = btn;

    }

    function previewLayer(idx) {

        clearPreviewLayer();

        const layer = allLayers[idx];

        const gj = JSON.parse(layer.geojson);

        let info = "";

        const nowZoomLvl = localMap.getZoom();

        if (nowZoomLvl < layer.zoomMin || nowZoomLvl > layer.zoomMax) {
            localMap.setZoom(layer.zoomMin);
        }

        if (layer.ty === "iiif") {

            const baseUrl = layer.surl;

            const imgURL = `${baseUrl}/full/${GEO_REF_IMG_SIZE * 2},/0/default.jpg`;

            const ifffBtnParams = {
                manifestId: layer.murl,
                canvasId: layer.iurl,
            }

            info = `${layer.na} ${layer.sname}<br/>${layer.murl}`;

            const ca = gj.coordinates[0];

            activeLayer = DistortableImageLayer.build({
                imgURL,
                baseUrl,
                mode: "lock",
                editable: false,
                ifffBtnParams,
                extraActions: {},
                corners: [
                    {lat: ca[0][1], lng: ca[0][0]},
                    {lat: ca[1][1], lng: ca[1][0]},
                    {lat: ca[3][1], lng: ca[3][0]},
                    {lat: ca[2][1], lng: ca[2][0]},
                ],
            }).addTo(localMap);

        } else if (layer.ty === "tiles") {

            activeLayer = L.tileLayer(layer.surl, {attribution: ""});

            activeLayer.setZIndex(9999999);

            localMap.addLayer(activeLayer);

            info = `${layer.na} ${layer.sname} layer(zoom:${layer.zoomMin}-${layer.zoomMax}).<br/>${layer.surl}`;
        }

        previewInfo.innerHTML = info;
        previewInfo.classList.toggle('preview-hint', false);

        showIIIFViewerBtn.style.visibility = (activeLayer.options.ifffBtnParams) ? 'visible' : 'hidden';

        const activeLayerBorderStyle = {
            weight: 2,
            opacity: 1,
            color: "#E74C3C",
            dashArray: "3",
            fillOpacity: 0,
            fillColor: "#FFF",
        };

        activeLayerBorder = L.geoJSON(gj, {style: activeLayerBorderStyle}).addTo(localMap);

    }

    function clearPreviewLayer(stopResetPreviewBtn) {

        if (activeLayer) {
            localMap.removeLayer(activeLayer);
            activeLayer = null;
        }

        if (activeLayerBorder) {
            localMap.removeLayer(activeLayerBorder);
            activeLayerBorder = null;
        }

        previewInfo.innerHTML = HINT_FOR_PREVIEW;
        previewInfo.classList.toggle('preview-hint', true);

        showIIIFViewerBtn.style.visibility = 'hidden';

        if (lastPreviewBtn && !stopResetPreviewBtn) {

            const classList = lastPreviewBtn.classList;
            classList.toggle('in-preview', false);

            lastPreviewBtn = null;
        }

    }

    function saveLayers() {

        const checkedBoxes = panelBody.querySelectorAll('[name=PublicMapCheck]:checked');

        if (checkedBoxes.length === 0) {
            localEventEmitter.emit('exception', "You didn't select(check) any layer.");
            return;
        }

        const layers = [];

        for (const aBox of checkedBoxes) {

            layers.push(allLayers[aBox.value]);

        }

        clearPreviewLayer();

        hide();

        localEventEmitter.emit('addIntoYourLayer', layers);

    }

    return {
        init,
        filterByLatLng,
        hide,
        on: addEventListener,
    }

    /* Events

    { name: 'addIntoYourLayer', params: layers-Array }
    { name: 'exception', params: msg-String }

    */
}();

export default PublicMapsPanel;

