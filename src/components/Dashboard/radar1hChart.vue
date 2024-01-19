<template>
  <div class="line-chart-container">
    <h2>Aantal vogels langs Vogelhuisje</h2>
    <div v-if="isLoading" class="loading-message">Bezig met laden...</div>
    <div v-else-if="hasData" class="line-chart-radar">
      <Line :data="chartData" :options="chartOptions" ref="chart"></Line>
    </div>
    <div v-else-if="!isLoading" class="no-data-message">Geen gegevens beschikbaar.</div>
  </div>
</template>

<script>
import { Line } from 'vue-chartjs';
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
} from 'chart.js';
import axios from 'axios';

ChartJS.register(Title, Tooltip, Legend, LineController, LinearScale, CategoryScale, PointElement, LineElement);

export default {
  name: 'LineChartRadar',
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
  },
  computed: {
    hasData() {
      if (this.selectedUnoid) {
        return this.chartData.datasets.some(dataset => dataset.unoid === this.selectedUnoid && dataset.data.length > 0);
      } else {
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
            maxTicksLimit: 10,
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
            stepSize: 1,
            min: 0,
            title: {
              display: true,
              text: 'Aantal vogels langs radar',
              padding: {
                top: 10,
                bottom: 10
              }
            },
            ticks: {
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
              return `Aantal: ${Math.round(tooltipItem.parsed.y)}`;
            }
          }
        }
      }
    };
  },
  watch: {
    apiUrl() {
      this.loadLineChartDataFromAPI();
    },
    selectedUnoid() {
      this.loadLineChartDataFromAPI();
    }
  },
  mounted() {
    this.loadLineChartDataFromAPI();
    setInterval(() => {
      this.loadLineChartDataFromAPI();
    }, 300000);
  },
  methods: {
    async loadLineChartDataFromAPI() {
      this.isLoading = true;

      let labels = [];
      let datasets = [];

      try {
        const response = await axios.get(this.apiUrl);
        const result = response.data;

        if (result && result.length > 0) {
          result.forEach((dataRij) => {
            if (this.selectedUnoid && dataRij.unoid !== this.selectedUnoid) {
              return; // Skip data if unoid is selected and doesn't match
            }

            let options = {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              timeZone: 'Europe/Amsterdam',
            };
            let tmpLabel = new Date(dataRij.time).toLocaleTimeString('nl-NL', options);
            let tmpVogelsLangs = dataRij.radar;

            let existingDataset = datasets.find(dataset => dataset.unoid === dataRij.unoid);
            if (!existingDataset) {
              existingDataset = {
                unoid: dataRij.unoid,
                label: ` Arduino: ${dataRij.unoid}, aantal vogels langs`,
                borderColor: this.getRandomColor(),
                fill: false,
                data: []
              };
              datasets.push(existingDataset);
            }

            existingDataset.data.unshift(tmpVogelsLangs);
            labels.unshift(tmpLabel);
          });

          this.chartData.labels = labels;
          this.chartData.datasets = datasets;
          this.chartOptions.scales.x.labels = labels;

        } else {
          console.error('Lege of onjuiste radar-API-respons ontvangen.');
        }
      } catch (error) {
        console.error('Fout bij het laden van de radar gegevens:', error);
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

.line-chart-radar {
  width: 100%;
  margin: 0 auto;
  max-height: 300px;
}

.loading-message {
  text-align: center;
  padding: 20px;
}

.line-chart-radar canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
