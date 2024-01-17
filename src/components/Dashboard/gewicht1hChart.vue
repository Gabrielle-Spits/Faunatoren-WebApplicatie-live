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
} from 'chart.js/auto'; // Update import

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

    // Stel automatische gegevensherladen in op het gespecificeerde interval
    setInterval(() => {
      console.log('Interval: gegevens worden opnieuw geladen');
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
          result.forEach((dataRij) => {
            let tmpLabel = new Date(dataRij.time).toLocaleString('nl-NL', {
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
                label: `Gewicht ${dataRij.unoid}`,
                borderColor: this.getRandomColor(),
                fill: false,
                data: []
              };
              datasets.push(existingDataset);
            }

            let tmpWeight = dataRij.weight;
            existingDataset.data.unshift(tmpWeight);
          });

          this.chartData.labels = labels;
          this.chartData.datasets = datasets;
          this.chartOptions.scales.x.labels = labels;

        } else {
          addUserAction("Foutmelding API ophalen gewicht van het vogelhuisje", this.$options.name, '', '', "Lege of onjuiste API-respons ontvangen.");
          console.error('Lege of onjuiste gewicht-API-respons ontvangen.');
        }
      } catch (error) {
        addUserAction("Foutmelding API ophalen gewicht van het vogelhuisje", this.$options.name, '', '', "Er is een fout opgetreden bij het ophalen van de gewichtsgegevens van de Arduino.");
        console.error('Fout bij het laden van de gewichtsgegevens:', error);
      } finally {
        this.isLoading = false;
      }
    },
    getRandomColor() {
      // Functie om willekeurige hex-kleur te genereren
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
  color: #888; /* Voeg een grijze kleur toe aan de tekst voor een informatieve uitstraling */
}
</style>
