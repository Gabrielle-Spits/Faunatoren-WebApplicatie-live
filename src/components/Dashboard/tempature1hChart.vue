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
        datasets: [
          {
            fill: false,
            data: [],
            unoid: '', // Add unoid property to the dataset
          },
        ],
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

      const labels = [];
      const temperatureChartData = [];

      try {
        const response = await axios.get(this.apiUrl);
        const result = response.data;

        if (result && result.length > 0) {
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

            let existingDataset = this.chartData.datasets.find(dataset => dataset.unoid === dataRij.unoid);

            if (!existingDataset) {
              existingDataset = {
                unoid: dataRij.unoid,
                label: `Temperatuur ${dataRij.unoid}`,
                borderColor: this.getRandomColor(),
                fill: false,
                data: []
              };
              this.chartData.datasets.push(existingDataset);
            }

            let tmpData = dataRij.temp;
            existingDataset.data.unshift(tmpData);
          });

          this.chartData.labels = labels;

          // Update the max and min temperature
          const allTemperatures = this.chartData.datasets.reduce((acc, dataset) => acc.concat(dataset.data), []);
          const maxTemp = Math.max(...allTemperatures);
          const minTemp = Math.min(...allTemperatures);

          this.chartOptions.scales.y.ticks.min = Math.floor(minTemp);
          this.chartOptions.scales.y.ticks.max = Math.ceil(maxTemp);

          this.chartOptions.scales.x.labels = labels;
        } else {
          console.error('Lege of onjuiste temperatuur-API-respons ontvangen.');
        }
      } catch (error) {
        console.error('Fout bij het laden van de temperatuurgegevens:', error);
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
  max-width: 1200px;
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
