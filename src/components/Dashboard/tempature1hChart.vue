<template>
  <div class="temperatuur">
    <h2>Temperatuur</h2>
    <div v-if="isLoading" class="loading-message">Bezig met laden...</div>
    <div v-else-if="hasData" class="line-chart-temperature">
      <Line :data="chartData" :options="chartOptions" ref="chart"></Line>
    </div>
    <div v-else-if="!isLoading" class="no-data-message">Geen gegevens beschikbaar.</div>
  </div>
</template>

<script>
import { Line } from 'vue-chartjs';
import { addUserAction } from './../LoggingFunctions/LoggingDatabaseFunctions.js';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineController,
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
} from 'chart.js/auto';
import axios from 'axios';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineController,
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement
);

export default {
  name: 'TemperatureChart',
  components: {
    Line,
  },
  props: {
    apiUrl: {
      type: String,
      required: true,
    },
    selectedUnoid: {
      type: String,
    },
    reloadInterval: {
      type: Number,
      default: 300000 // standaard herlaadinterval is 5 minuten
    },
  },
  computed: {
    hasData() {
      if (this.selectedUnoid) {
        return this.chartData.datasets.some(
          (dataset) =>
            dataset.unoid === this.selectedUnoid && dataset.data.length > 0
        );
      } else {
        return (
          this.chartData.datasets.length > 0 &&
          this.chartData.datasets.some((dataset) => dataset.data.length > 0)
        );
      }
    }
  },
  data() {
    return {
      isLoading: false,
      chartData: {
        labels: [],
        datasets: [],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'category',
            labels: [],
            maxRotation: 45,
            minRotation: 0,
            maxTicksLimit: 10,
            title: {
              display: true,
              text: 'Tijd',
              padding: {
                top: 10,
                bottom: 10,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: 'Temperatuur (°C)',
              padding: {
                top: 10,
                bottom: 10,
              },
            },
            ticks: {
              stepSize: 1,
              callback: function (value) {
                return value.toLocaleString('nl-NL', { minimumFractionDigits: 1 });
              },
            },
          },
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              return `Temperatuur: ${Math.round(tooltipItem.parsed.y)} °C`;
            },
          },
        },
      },
    };
  },
  watch: {
    apiUrl() {
      this.loadTemperatureChartDataFromAPI();
    },
    selectedUnoid: "loadTemperatureChartDataFromAPI",
  },
  mounted() {
    this.loadTemperatureChartDataFromAPI();
    setInterval(() => {
      this.loadTemperatureChartDataFromAPI();
    }, this.reloadInterval);
  },
  methods: {
    async loadTemperatureChartDataFromAPI() {
      this.isLoading = true;

      try {
        const response = await axios.get(this.apiUrl);
        const result = response.data;

        if (result && result.length > 0) {
          const labels = [];
          const datasets = [];

          result.forEach((dataRij) => {
            let tmpLabel = new Date(dataRij.time).toLocaleTimeString('nl-NL', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              timeZone: 'Europe/Amsterdam',
            });

            labels.unshift(tmpLabel);

            let existingDataset = datasets.find(dataset => dataset.unoid === dataRij.unoid);

            if (!existingDataset) {
              existingDataset = {
                unoid: dataRij.unoid,
                label: `Temperatuur ${dataRij.unoid}`,
                borderColor: this.getRandomColor(),
                fill: false,
                data: [],
              };
              datasets.push(existingDataset);
            }

            let tmpData = dataRij.temp;
            existingDataset.data.unshift(tmpData);
          });

          this.chartData.labels = labels;
          this.chartData.datasets = datasets;

          // Update the max and min temperature
          const allTemperatures = datasets.reduce((acc, dataset) => acc.concat(dataset.data), []);
          const maxTemp = Math.max(...allTemperatures);
          const minTemp = Math.min(...allTemperatures);

          this.chartOptions.scales.y.ticks.min = Math.floor(minTemp);
          this.chartOptions.scales.y.ticks.max = Math.ceil(maxTemp);

          this.chartOptions.scales.x.labels = labels;
        } 
      } catch (error) {

        // Response status controleren
        if (error.response){
          // Als de response status niet 200 is
          if (error.response.status != 200){
            addUserAction("Foutmeldingscode " + error.response.status + " API call {https://84.235.165.56:1880/get/data/${time}/${unoid}} in bestand dashBoard.vue method {getApiUrlData(time, unoid)}",
            this.$options.name, String.empty, String.empty, "Het ophalen van de temperatuurdata van de Arduino (= de toren) is mislukt.");
          }
        }

        // Checken of de server plat is
        if (error.request){
          // Als de server plat ligt
          if (error.request.status == 0){
            addUserAction("Foutmelding in method {loadTemperatureChartDataFromAPI()}", this.$options.name, String.empty, String.empty,
            "Server https://84.235.165.56:1880 down.");
          }
        }
      } finally {
        this.isLoading = false;
      }
    },
    getRandomColor() {
      // Functie om willekeurige hex-kleur te genereren
      return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }
  },
};
</script>

<style scoped>
.temperatuur {
  text-align: center;
  width: 100%;
}

.line-chart-temperature {
  width: 100%;
  /* max-width: 1250px; */
  margin: 0 auto;
  max-height: 300px;
}

.loading-message {
  text-align: center;
  padding: 20px;
}

.line-chart-temperature canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
