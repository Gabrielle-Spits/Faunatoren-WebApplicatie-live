<template>
  <div class="dashboard">
    <h1>Faunatoren Dashboard</h1>

    <!-- Filters -->
    <div class="filters-and-cart">
      <div class="filters">
        <div class="filter-group">
          <h2>Filter op:</h2>

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
    <div v-if="hasData" class="chart-container">
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
      <div class="chart-row">
        <Battery1hChart :apiUrl="getApiUrlData(selectedTime, selectedUnoid)" />
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
        const response = await axios.get('http://84.235.165.56:1880/get/location');
        this.locationOptions = response.data;
        this.locationOptions = this.locationOptions.map(location => ({
          locationid: location.locationid,
        }));
      } catch (error) {
        addUserAction("Foutmelding API ophalen alle locaties", this.$options.name, String.empty, String.empty, "Het ophalen van alle locaties is mislukt.");
        console.error('Fout bij het ophalen van locatie-opties:', error);
      }
    },
    async fetchUnoidOptions() {
      try {
        const response = await axios.get(`http://84.235.165.56:1880/get/uno/${this.selectedLocationId}`);
        this.unoidOptions = response.data;
        this.filteredUnoidOptions = this.unoidOptions.map(location => ({
          unoid: location.unoid,
          unoname: location.unoname,
        }));
        this.hasData = this.filteredUnoidOptions.length > 0;
      } catch (error) {
        addUserAction("Foutmelding API ophalen Arduino UNO's van locaties", this.$options.name, String.empty, String.empty, "Het ophalen van alle Arduino UNO's van de geselecteerde locatie is mislukt.");
        console.error('Fout bij het ophalen van unoid-opties:', error);
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
        console.log("doe jij iets")
        const response = await axios.get(this.getApiUrlData(this.selectedTime, this.selectedUnoid));
      } catch (error) {
        addUserAction("Foutmelding API ophalen sensordata", this.$options.name, String.empty, String.empty, "Het ophalen van de sensordata o.b.v. tijd en unoID is mislukt.");
        console.error('Fout bij het ophalen van gegevens:', error);
      }
    },
    getApiUrlData(time, unoid) {
      return `http://84.235.165.56:1880/get/data/${time}/${unoid}`;
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

.filters-and-cart {
  display: flex;
}

.filters {
  width: 50%;
  display: grid;
  gap: 10px;
}

.filter-group {
  display: grid;
  gap: 10px;
}

.filter-cel {
  flex-direction: column;
  width: 100%;
}

.location-cart {
  width: 50%;
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
