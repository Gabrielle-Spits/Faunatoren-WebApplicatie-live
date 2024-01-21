<template>
  <div class="line-chart-container">
    <h2>Gewicht Vogelhuisje</h2>
    <div v-if="isLoading" class="loading-message">Bezig met laden...</div>
    <div v-else-if="hasData" class="line-chart-gewicht">
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
  LineElement
} from 'chart.js/auto';

import axios from 'axios';

ChartJS.register(Title, Tooltip, Legend, LineController, LinearScale, CategoryScale, PointElement, LineElement);

export default {
  name: 'LineChartGewicht',
  components: {
    Line
  },
  props: {
    apiUrl: {
      type: String,
      required: true
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
        // Toon alleen dataset voor geselecteerde unoid als deze is geselecteerd
        return this.chartData.datasets.some(dataset => dataset.unoid === this.selectedUnoid && dataset.data.length > 0);
      } else {
                // Toon alle datasets als er geen unoid is geselecteerd
        return this.chartData.datasets.length > 0 && this.chartData.datasets.some(dataset => dataset.data.length > 0);
      }
    }
  },
  data() {
    return {
      isLoading: false,
      chartData: {
        labels: [],
        datasets: []
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
            maxTicksLimit: 12,
            title: {
              display: true,
              text: 'Tijd',
              padding: {
                top: 10,
                bottom: 10
              }
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Gewicht (g)',
              padding: {
                top: 10,
                bottom: 10
              }
            },
            ticks: {
              beginAtZero: true,
              stepSize: 1,
              callback: function (value) {
                return Math.round(value);
              }
            }
          }
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              return `Gewicht: ${Math.round(tooltipItem.parsed.y)} g`;
            }
          }
        }
      }
    };
  },
  watch: {
    apiUrl() {
      this.loadWeightChartDataFromAPI();
    },
    selectedUnoid: {
      handler: 'loadWeightChartDataFromAPI',
      deep: true
    }
  },
  mounted() {
    this.loadWeightChartDataFromAPI();
    setInterval(() => {
      this.loadWeightChartDataFromAPI();
    }, this.reloadInterval);
  },
  methods: {
    async loadWeightChartDataFromAPI() {
      this.isLoading = true;
      try {
        const response = await axios.get(this.apiUrl);
        const result = response.data;

        if (result && result.length > 0) {
          const labels = [];
          const datasets = [];

          result.forEach((dataRij) => {
            let tmpLabel = new Date(dataRij.time).toLocaleString('nl-NL', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              timeZone: 'Europe/Amsterdam',
            });

            // Controleer of het dataset voor deze unoid al bestaat
            let existingDatasetIndex = datasets.findIndex(dataset => dataset.unoid === dataRij.unoid);

            if (existingDatasetIndex === -1) {
              // Dataset bestaat nog niet, voeg het toe
              let newDataset = {
                unoid: dataRij.unoid,
                label: `Gewicht ${dataRij.unoid}`,
                borderColor: this.getRandomColor(),
                fill: false,
                data: [dataRij.weight], // Voeg het gewicht toe aan de nieuwe dataset
              };

              datasets.push(newDataset);
            } else {
              // Dataset bestaat al, voeg het gewicht toe aan de bestaande dataset
              datasets[existingDatasetIndex].data.unshift(dataRij.weight);
            }

            labels.unshift(tmpLabel);
          });

          this.chartData.labels = labels;
          this.chartData.datasets = datasets;
          this.chartOptions.scales.x.labels = labels;

        } 
      } catch (error) {
        // Response status controleren
        if (error.response){
          // Als de response status niet 200 is
          if (error.response.status != 200){
            console.log("FOUT API gewicht1hChart");
            addUserAction("Foutmeldingscode " + error.response.status + " API call {https://84.235.165.56:1880/get/data/${time}/${unoid}} in bestand dashBoard.vue method {getApiUrlData(time, unoid)}",
            this.$options.name, String.empty, String.empty, "Het ophalen van de gewichtsdata van de Arduino (= de toren) is mislukt.");
          }
        }

        // Checken of de server plat is
        if (error.request){
          // Als de server plat ligt
          if (error.request.status == 0){
            console.log("SERVER PLAT gewicht1hChart");
            addUserAction("Foutmelding in method {loadWeightChartDataFromAPI()}", this.$options.name, String.empty, String.empty,
            "Server https://84.235.165.56:1880 down.");
          }
        }
      } finally {
        this.isLoading = false;
      }
    },

    getRandomColor() {
      return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }
  }
};
</script>

<style scoped>
.line-chart-container {
  text-align: center;
  width: 100%;
}

.line-chart-gewicht {
  width: 100%;
  /* max-width: 1250px; */
  margin: 0 auto;
  max-height: 300px;
}

.loading-message {
  text-align: center;
  padding: 20px;
}

.line-chart-gewicht canvas {
  width: 100% !important;
  height: 100% !important;
}

.no-data-message {
  text-align: center;
  padding: 20px;
  color: #888;
}
</style>
