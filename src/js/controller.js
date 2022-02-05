
import { Spinner, Commons } from "@chmap/utilities";

import CoordinateFilter from "./coordinate-filter";

const PublicMapsController = function() {

    const localEventEmitter = new Commons.EventEmitterClass();

    const initialized = { publicMapsPanel: false };

    let localMap = null;

    function addEventListener(obj, types, fn, context) {
        localEventEmitter.on(obj, types, fn, context);
    }

    function init(map) {

        localMap = map;

        CoordinateFilter.init(map);

        mapEventBinding(map);

        cmpEventBinding();

    }

    function initPublicMapsList(map, publicMapsPanel) {

        publicMapsPanel.init(map);

        // PublicMapsPanel events
        publicMapsPanel.on('addIntoYourLayer', (layers) => {
            localEventEmitter.emit('addIntoYourLayer', layers);
        })

        publicMapsPanel.on('showIIIFViewer', async (params) => {

            const {IIIFViewer} = await import('@chmap/utilities');

            IIIFViewer.open(params);
        });

        publicMapsPanel.on('shown', (offCanvasDom) => {

            Spinner.hide();

            localEventEmitter.emit('panel.shown', offCanvasDom);

        });

        publicMapsPanel.on('hidden', (offCanvasDom) => {

            localEventEmitter.emit('panel.hidden', offCanvasDom);

        });

        publicMapsPanel.on('exception', async (info) => {

            Spinner.hide();

            const {Notification} = await import("@chmap/utilities");

            Notification.show(info, 'danger');
        });

    }

    function addButtonsTo(toolbar) {

        toolbar.appendChild(CoordinateFilter.getPlaceNameInput());

        toolbar.appendChild(CoordinateFilter.getExitButton());
    }

    function bindTriggerButtons({showAllPublicMapsBtn, placeNameFilterBtn, coordinateFilterBtn}) {

        showAllPublicMapsBtn.onclick = (e) => {

            e.preventDefault();

            showAvailablePublicMaps(null, null);

        }

        placeNameFilterBtn.onclick = (e) => {
            e.preventDefault();
            CoordinateFilter.startPlaceNameFiltering();
        }

        coordinateFilterBtn.onclick = (e) => {

            e.preventDefault();

            CoordinateFilter.startLatLngFiltering();

            localEventEmitter.emit('coordinateFilterStart');
        }

    }

    function mapEventBinding(map) {

        map.on('popupopen', (e) => {

            const popupRoot = e.popup._contentNode;

            bindShowAvailableMaps(popupRoot);

        });

    }

    function bindShowAvailableMaps(popupRoot) {

        const btn = popupRoot.querySelector('.load-available-maps-btn');

        if (btn) {

            btn.onclick = (e) => {

                const lat = parseFloat(e.target.getAttribute('data-lat'));
                const lng = parseFloat(e.target.getAttribute('data-lng'));

                showAvailablePublicMaps(lat, lng);
            }
        }

    }

    async function showAvailablePublicMaps(lat, lng) {

        Spinner.show();

        const {default: PublicMapsPanel} = await import("./panel");

        if (!initialized.publicMapsPanel) {

            initPublicMapsList(localMap, PublicMapsPanel);

            initialized.publicMapsPanel = true;
        }

        PublicMapsPanel.filterByLatLng(lat, lng);

    }

    function cmpEventBinding() {

        // CoordinateFilter events
        CoordinateFilter.on('filteringModeStart', (filteringMode) => {
            localEventEmitter.emit('filteringModeStart', filteringMode);
        });

        CoordinateFilter.on('filteringModeStop', async (filteringMode) => {

            await hidePublicMapsPanel();

            localEventEmitter.emit('filteringModeStop', filteringMode);
        });

        CoordinateFilter.on('placeNameSearchStart', () => {

            Spinner.show();

            localEventEmitter.emit('placeNameSearchStart');
        });

        CoordinateFilter.on('placeNameSearchEnd', async () => {

            Spinner.hide();

            await hidePublicMapsPanel();

            localEventEmitter.emit('placeNameSearchEnd');
        });

    }

    async function hidePublicMapsPanel(){

        if(initialized.publicMapsPanel){

            const { default: PublicMapsPanel } = await import("./panel");

            PublicMapsPanel.hide();

        }

    }

    function stopFiltering() {
        CoordinateFilter.stopFiltering();
    }

    return {
        init,
        addButtonsTo,
        bindTriggerButtons,
        stopFiltering,
        on: addEventListener,
    }

    /* Events

    { name: 'addIntoYourLayer', params: layers-Array )
    { name: 'filteringModeStart', params: filteringMode:String }
    { name: 'filteringModeStop', params: filteringMode:String }
    { name: 'placeNameSearchStart', params: null }
    { name: 'placeNameSearchEnd', params: null }
    { name: 'panel.shown', params: offcanvasDom-Object }
    { name: 'panel.hidden', params: offcanvasDom-Object }

    */

}();

export default PublicMapsController;
