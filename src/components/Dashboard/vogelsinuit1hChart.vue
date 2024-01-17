<template>
  <div class="vogels">
    <h2>Vogels In/Uit</h2>
    <h3 v-if="aantalVogelLocatie !== null">
      {{ aantalVogelLocatie }}
    </h3>
    <h3 v-if="aantalVogelArduino !== null">
      {{ aantalVogelArduino }}
    </h3>
    <div v-if="isLoading" class="loading-message">Bezig met laden...</div>
    <div v-else-if="hasData" class="LineVogel">
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
  LineElement,
} from 'chart.js/auto';
import axios from 'axios';

ChartJS.register(Title, Tooltip, Legend, LineController, LinearScale, CategoryScale, LineElement);

export default {
  name: 'VogelsInUit1hChart',
  components: { Line },
  props: {
    apiUrl: {
      type: String,
      required: true,
    },
    selectedLocationId: {
      type: String,
    },
    selectedUnoid: {
      type: String,
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
    },
  },
  data() {
    return {
      aantalVogelLocatie: '',
      aantalVogelArduino: '',
      isLoading: false,
      selectedTime: '1h',
      chartData: {
        labels: [],
        datasets: [
          {
            fill: false,
            data: [],
            unoidid: '',
          },
          {
            fill: false,
            data: [],
            unoidid: '',
          },
          {
            fill: false,
            data: [],
            unoidid: '',
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
              text: 'Aantal Vogels',
              padding: {
                top: 10,
                bottom: 10,
              },
            },
            beginAtZero: true,
            stepSize: 1,
            ticks: {
              callback: function (value) {
                return Number.isInteger(value) ? value : '';
              },
            },
          },
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              return Math.round(tooltipItem.yLabel);
            },
          },
        },
      },
    };
  },
  watch: {
    selectedTime() {
      this.loadVogelsDataFromAPI();
    },
    apiUrl() {
      this.loadLineChartDataFromAPI();
    },
    selectedLocationId() {
      this.fetchVogelsDataLocatie();
    },
    selectedUnoid() {
      this.fetchVogelsDataUno();
    },
  },
  mounted() {
    this.loadLineChartDataFromAPI();
    this.fetchVogelsDataLocatie();
    this.fetchVogelsDataUno();

    setInterval(() => {
      this.loadLineChartDataFromAPI();
    }, 300000);
  },
  methods: {
    async fetchVogelsDataLocatie() {
      try {
        if (!this.selectedLocationId) {
          this.aantalVogelLocatie = '';
        } else {
          const apiUrl = `http://84.235.165.56:1880/get/InUitVL/${this.selectedLocationId}`;
          const response = await axios.get(apiUrl);
          const data = response.data;
          this.aantalVogelLocatie = `aantal vogels in de toren ${this.selectedLocationId}: ${data.totalIn}`;
        }
      } catch (error) {
        console.error('Fout bij het ophalen van vogelgegevens:', error);
      }
    },
    async fetchVogelsDataUno() {
      try {
        if (!this.selectedUnoid) {
          this.aantalVogelArduino = '';
        } else {
          const apiUrl = `http://84.235.165.56:1880/get/InUitVU/${this.selectedUnoid}`;
          const response = await axios.get(apiUrl);
          const data = response.data;
          this.aantalVogelArduino = `aantal vogels in het vogelhuisje ${this.selectedUnoid}: ${data.TotalIn}`;
        }
      } catch (error) {
        console.error('Fout bij het ophalen van vogelgegevens:', error);
      }
    },
    async loadLineChartDataFromAPI() {
      this.isLoading = true;

      const labels = [];
      const vogelsInData = [];
      const vogelsUitData = [];
      const vogelsInUitData = [];

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

            let existingDataset1 = this.chartData.datasets.find(
              (dataset) => dataset.unoid === dataRij.unoid
            );
            if (!existingDataset1) {
              existingDataset1 = {
                unoid: dataRij.unoid,
                label: `Arduino ${dataRij.unoid} aantal vogels in`,
                borderColor: this.getRandomColor(),
                fill: false,
                data: [],
              };
              this.chartData.datasets.push(existingDataset1);
            }

            let tmpVogelsIn = dataRij.vogelsIn;
            existingDataset1.data.unshift(tmpVogelsIn);

            let existingDataset2 = this.chartData.datasets.find(
              (dataset) => dataset.unoid === dataRij.unoid + '_Uit'
            );
            if (!existingDataset2) {
              existingDataset2 = {
                unoid: dataRij.unoid + '_Uit',
                label: `Arduino ${dataRij.unoid} aantal vogels uit`,
                borderColor: this.getRandomColor(),
                fill: false,
                data: [],
              };
              this.chartData.datasets.push(existingDataset2);
            }

            let tmpVogelsUit = -dataRij.vogelsUit;
            existingDataset2.data.unshift(tmpVogelsUit);

            let existingDataset3 = this.chartData.datasets.find(
              (dataset) => dataset.unoid === dataRij.unoid + '_InUit'
            );
            if (!existingDataset3) {
              existingDataset3 = {
                unoid: dataRij.unoid + '_InUit',
                label: `Arduino ${dataRij.unoid} aantal vogels in-uit`,
                borderColor: this.getRandomColor(),
                fill: false,
                data: [],
              };
              this.chartData.datasets.push(existingDataset3);
            }

            let tmpVogelsInUit = tmpVogelsIn + tmpVogelsUit;
            existingDataset3.data.unshift(tmpVogelsInUit);
          });

          this.chartData.labels = labels;
          this.chartData.datasets[0].data = vogelsInData;
          this.chartData.datasets[1].data = vogelsUitData;
          this.chartData.datasets[2].data = vogelsInUitData;

          this.chartOptions.scales.x.labels = labels;
        } else {
          console.error('Lege of onjuiste vogel-API-respons ontvangen.');
        }
      } catch (error) {
        console.error('Fout bij het laden van de vogelgegevens:', error);
      } finally {
        this.isLoading = false;
      }
    },
    getRandomColor() {
      // Functie om willekeurige hex-kleur te genereren
      return '#' + Math.floor(Math.random() * 16777215).toString(16);
    },
  },
};
</script>

<style>
.vogels {
  text-align: center;
  width: 100%;
}

.LineVogel {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  max-height: 300px;
}

.loading-message {
  text-align: center;
  padding: 20px;
}

.LineVogel canvas {
  width: 100% !important;
  height: 100% !important;
}

.no-data-message {
  text-align: center;
  padding: 20px;
  color: #888; /* Voeg een grijze kleur toe aan de tekst voor een informatieve uitstraling */
}
</style>
