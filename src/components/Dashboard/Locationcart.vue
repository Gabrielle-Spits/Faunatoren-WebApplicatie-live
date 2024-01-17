<template>
  <div>
    <div id="mapdiv" style="height: 400px;"></div>
  </div>
</template>

<script>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { defaults as defaultControls, MousePosition } from "ol/control";
import { Tile as TileWMS, Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Icon, Style } from "ol/style";
import axios from 'axios';
import { addUserAction } from './../LoggingFunctions/LoggingDatabaseFunctions.js';

export default {
  name: "Locationcart",
  props: {
    selectedLocationId: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      map: null,
      markersLayer: null,
      locationData: null,
    };
  },
  mounted() {
    this.start();
  },
  watch: {
    selectedLocationId: function(newVal, oldVal) {
      this.getLocationData();
    },
  },
  methods: {
    async getLocationData() {
      try {
        const response = await axios.get(`http://84.235.165.56:1880/get/location`);
        const location = response.data.find(loc => loc.locationid === this.selectedLocationId);
        
        if (location) {
          this.locationData = location;
          this.addPin(location.longitude, location.latitude);
          this.centerMap(location.longitude, location.latitude, 16);
        }
      } catch (error) {
        addUserAction("Foutmelding API ophalen locatiegegevens van het vogelhuisje", this.$options.name, String.empty, String.empty, "Het ophalen van de locatiegegevens van het vogelhuisje is mislukt.");
        console.error('Fout bij het ophalen van locatiegegevens:', error);
      }
    },
    start() {
      this.map = new Map({
        target: "mapdiv",
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        controls: defaultControls().extend([
          new MousePosition({
            coordinateFormat: fromLonLat,
            projection: "EPSG:4326",
            className: "custom-mouse-position",
            target: document.getElementById("mouse-position"),
            undefinedHTML: "&nbsp;",
          }),
        ]),
        view: new View({
          center: fromLonLat([5.1, 51.1]),
          zoom: 16,
        }),
      });

      this.markersLayer = new VectorLayer({
        source: new VectorSource(),
      });

      this.map.addLayer(this.markersLayer);
    },
    addPin(lon, lat) {
      const marker = new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
      });

      marker.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: "@/public/img/marker.png",
          }),
        })
      );

      this.markersLayer.getSource().clear(); // Verwijder eventuele vorige markers
      this.markersLayer.getSource().addFeature(marker);
    },
    centerMap(lon, lat, zoom) {
      this.map.getView().setCenter(fromLonLat([lon, lat]));
      this.map.getView().setZoom(zoom);
    },
  },
};
</script>

<style>
#mouse-position {
  position: absolute;
  bottom: 0;
  left: 0;
  margin: 10px;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 5px;
  border-radius: 5px;
}
</style>
