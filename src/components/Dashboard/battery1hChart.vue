<template>
  <div class="batterij">
    <h2>Batterij Capaciteit</h2>
    <div v-if="isLoading" class="loading-message">Bezig met laden...</div>
    <div v-else class="bar-chart-batterij">
      <Bar :data="chartData" :options="chartOptions" :height="300" :width="chartWidth"></Bar>
    </div>
  </div>
</template>

<script>
import { Bar } from 'vue-chartjs';
import { addUserAction } from './../LoggingFunctions/LoggingDatabaseFunctions.js';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarController,
  LinearScale,
  CategoryScale,
  PointElement,
  BarElement,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarController, LinearScale, CategoryScale, PointElement, BarElement);

export default {
  name: 'Battery1hChart',
  components: {
    Bar,
  },
  props: {
    apiUrl: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isLoading: false,
      chartWidth: 1200, // Breedte van het canvas
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'Batterij Capaciteit',
            backgroundColor: '#36A2EB',
            data: [],
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
            maxTicksLimit: 12,
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
            beginAtZero: true,
            title: {
              display: true,
              text: 'Batterij Capaciteit',
              padding: {
                top: 10,
                bottom: 10,
              },
            },
          },
        },
      },
    };
  },
  watch: {
    apiUrl() {
      this.loadChartDataFromAPI();
    },
    selectedTime() {
      this.loadChartDataFromAPI();
    },
  },
  mounted() {
    this.loadChartDataFromAPI();
  },
  methods: {
    async loadChartDataFromAPI() {
      this.isLoading = true;

      try {
        const response = await fetch(this.apiUrl);
        const result = await response.json();

        if (result && result.length > 0) {
          const labels = [];
          const data = [];

          result.forEach((dataRij) => {
            let options = {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Europe/Amsterdam',
            };
            let tmpLabel = new Date(dataRij.time).toLocaleTimeString('nl-NL', options);
            let tmpData = dataRij.battery;

            labels.unshift(tmpLabel);
            data.unshift(tmpData);
          });

          this.chartData.labels = labels;
          this.chartData.datasets[0].data = data;
          this.chartOptions.scales.x.labels = labels.slice();
        } else {
          addUserAction("Foutmelding API ophalen batterijgegevens", this.$options.name, String.empty, String.empty, "Lege of onjuiste API-respons ontvangen.");
          console.error('Lege of onjuiste API-respons ontvangen.');
        }
      } catch (error) {
        addUserAction("Foutmelding API ophalen batterijgegevens", this.$options.name, String.empty, String.empty, "Er is een fout opgetreden bij het ophalen van de batterijgegevens van de Arduino.");
        console.error('Fout bij het laden van de gegevens:', error);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.batterij {
  text-align: center;
}

.bar-chart-batterij {
  width: 100%;
  margin: 0 auto;
  max-height: 300px;
}

.loading-message {
  text-align: center;
  padding: 20px;
}

.bar-chart-batterij canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
