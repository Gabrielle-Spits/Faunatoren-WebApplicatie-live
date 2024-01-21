<template>
  <div class="dashboard">
    <h1>Faunatoren Dashboard</h1>

    <!-- Filters -->
    <div class="filters-and-cart">
      <div class="filters">
        <div class="filter-group">
          <h2 class="filterh2">Filter op:</h2>

          <!-- Tijd filter -->
          <div class="filter-cel">
            <label for="selectTime">Tijd:</label>
            <select v-model="selectedTime" @change="changeTime" id="selectTime">
              <option value="1h">1 uur</option>
              <option value="1d">1 dag</option>
              <option value="1w">7 dagen</option>
              <option value="1m">1 maand</option>
            </select>
          </div>

          <!-- Locatie filter -->
          <div class="filter-cel">
            <label for="selectLocationId">Toren:</label>
            <select v-model="selectedLocationId" @change="changeLocationId" id="selectLocationId">
              <option value="">Alle torens</option>
              <option v-for="location in locationOptions" :key="location.locationid" :value="location.locationid">
                {{ location.locationid }}
              </option>
            </select>
          </div>

          <!-- Vogelhuisje filter -->
          <div v-if="isLocationIdSelected" class="filter-cel">
            <label v-if="hasUnoidOptions" for="selectUnoid">Vogelhuisje:</label>
            <select v-if="hasUnoidOptions" v-model="selectedUnoid" @change="changeUnoid" id="selectUnoid">
              <option value="">Alle huisjes</option>
              <option v-for="location in filteredUnoidOptions" :key="location.unoid" :value="location.unoid">
                {{ location.unoname }}
              </option>
            </select>
            <span v-else class="no-data-message">
              Geen huisjes gekoppeld aan deze locatie.
            </span>
          </div>
        </div>
      </div>

      <!-- Locationcart component -->
      <div v-if="isLocationIdSelected" class="location-cart">
        <Locationcart :selectedLocationId="selectedLocationId" />
      </div>
    </div>

    <!-- Chart-container wordt weergegeven als er gegevens zijn -->
     <div class="chart-container">
      <div class="chart-row">
        <Vogelsinuit1hChart :apiUrl="getApiUrlData(selectedTime, selectedUnoid)" :selectedLocationId="selectedLocationId"
          :selectedUnoid="selectedUnoid" />
      </div>
      <div class="chart-row">
        <Radar1hChart :apiUrl="getApiUrlData(selectedTime, selectedUnoid)" :selectedUnoid="selectedUnoid" />
      </div>

      <div class="chart-row">
        <TemperatureChart :apiUrl="getApiUrlData(selectedTime, selectedUnoid)" :selectedUnoid="selectedUnoid" />
      </div>

      <div class="chart-row">
        <Gewicht1hChart :apiUrl="getApiUrlData(selectedTime, selectedUnoid)" :selectedUnoid="selectedUnoid" />
      </div>
    </div> 
  </div>
</template>

<script>
import axios from 'axios';
import Radar1hChart from './radar1hChart.vue';
import TemperatureChart from './tempature1hChart.vue';
import Vogelsinuit1hChart from './vogelsinuit1hChart.vue';
import Gewicht1hChart from './gewicht1hChart.vue';
import Locationcart from './Locationcart.vue';
import { addUserAction } from './../LoggingFunctions/LoggingDatabaseFunctions.js';

export default {
  name: 'Dashboard',
  components: {
    Radar1hChart,
    TemperatureChart,
    Vogelsinuit1hChart,
    Gewicht1hChart,
    Locationcart
  },
  data() {
    return {
      selectedTime: '1h',
      selectedLocationId: '',
      selectedUnoid: '',
      locationOptions: [],
      unoidOptions: [],
      isLocationIdSelected: false,
      filteredUnoidOptions: [],
      hasData: true,
    };
  },
  computed: {
    hasUnoidOptions() {
      return this.filteredUnoidOptions.length > 0;
    },
  },
  watch: {
    selectedTime() {
      this.fetchChartData();
    },
    selectedLocationId() {
      this.isLocationIdSelected = Boolean(this.selectedLocationId);
      this.fetchUnoidOptions();
      this.fetchChartData();
    },
    selectedUnoid() {
      this.fetchChartData();
    },
  },
  methods: {
    actionOpenPageInLoggingDatabase() {
      addUserAction("Opent het scherm", this.$options.name);
    },
    async fetchLocationOptions() {
      try {
        const response = await axios.get('https://84.235.165.56:1880/get/location');

        this.locationOptions = response.data;
        this.locationOptions = this.locationOptions.map(location => ({
          locationid: location.locationid,
        }));
      } catch (error) {

        // Response status controleren
        if (error.response){
          // Als de response status niet 200 is
          if (error.response.status != 200){
            addUserAction("Foutmeldingscode " + error.response.status + " API call {https://84.235.165.56:1880/get/location} in method {fetchLocationOptions()}",
              this.$options.name, String.empty, String.empty, "Het ophalen van alle locaties is mislukt.");
          }
        }

        // Checken of de server plat is
        if (error.request){
          // Als de server plat ligt
          if (error.request.status == 0){
            addUserAction("Foutmelding in method {fetchLocationOptions()}", this.$options.name, String.empty, String.empty, 
              "Server https://84.235.165.56:1880 down.");
          }
        }
      }
    },
    async fetchUnoidOptions() {
      try {
        const response = await axios.get(`https://84.235.165.56:1880/get/uno/${this.selectedLocationId}`);
        this.unoidOptions = response.data;
        this.filteredUnoidOptions = this.unoidOptions.map(location => ({
          unoid: location.unoid,
          unoname: location.unoname,
        }));
        this.hasData = this.filteredUnoidOptions.length > 0;
      } catch (error) {

        // Response status controleren
        if (error.response){
          // Als de response status niet 200 is
          if (error.response.status != 200){
            addUserAction("Foutmeldingscode " + error.response.status + " API call {https://84.235.165.56:1880/get/uno/${this.selectedLocationId()} in method {fetchUnoidOptions()}",
            this.$options.name, String.empty, String.empty, "Het ophalen van één Arduino o.b.v. het locationID is mislukt.");
          }
        }

        // Checken of de server plat is
        if (error.request){
          // Als de server plat ligt
          if (error.request.status == 0){
            addUserAction("Foutmelding in method {fetchUnoidOptions()}", this.$options.name, String.empty, String.empty,
            "Server https://84.235.165.56:1880 down.");
          }
        }
      }
    },
    changeTime() {
      this.fetchChartData();
    },
    changeLocationId() {
      this.fetchUnoidOptions();
      this.fetchChartData();
    },
    changeUnoid() {
      this.fetchChartData();
    },
    async fetchChartData() {
      try {
        const response = await axios.get(this.getApiUrlData(this.selectedTime, this.selectedUnoid));
      } catch (error) {

        // Response status controleren
        if (error.response){
          // Als de response status niet 200 is
          if (error.response.status != 200){
            addUserAction("Foutmeldingscode " + error.response.status + " API call {https://84.235.165.56:1880/get/data/${time}/${unoid}} in method {getApiUrlData(time, unoid)}",
            this.$options.name, String.empty, String.empty, "Het ophalen van de sensordata o.b.v. de geselecteerde tijd en Arduino (= de toren) is mislukt.");
          }
        }

        // Checken of de server plat is
        if (error.request){
          // Als de server plat ligt
          if (error.request.status == 0){
            addUserAction("Foutmelding in method {fetchChartData()}", this.$options.name, String.empty, String.empty,
            "Server https://84.235.165.56:1880 down.");
          }
        }
      }
    },
    getApiUrlData(time, unoid) {
      return `https://84.235.165.56:1880/get/data/${time}/${unoid}`;
    },
  },
  mounted() {
    this.fetchLocationOptions();
    this.fetchUnoidOptions();
    this.fetchChartData();
    this.actionOpenPageInLoggingDatabase();
  },
};
</script>

<style scoped>
.dashboard {
  display: grid;
  gap: 20px;
}

.filterh2{
  color: #1f6e13;
}

.filters-and-cart {
  display: flex;

}


.filters {
  width: 50%;
  padding-left: 12.5%;
}

.filter-group {
  width: 50%;
}

.filter-cel {
  width: 50%;
}

.location-cart {
  width: 75%;
}

.chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding-bottom: 20px;
}

.chart {
  width: 250px;
  height: 250px;
  margin-bottom: 20px;
}
</style>
