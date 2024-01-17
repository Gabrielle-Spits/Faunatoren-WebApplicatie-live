<template>
  <div>
    <h2>Voorspelling vogels morgen</h2>
    <table class="vogels-table">
      <thead>
        <tr>
          <th>Vogels in</th>
          <th>Vogels uit</th>
          <th>Vogels langs</th>
          <th>Voorspelling temperatuur</th>
          <th>Datum</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="vogel in vogels" :key="vogel.id">
          <td>{{ vogel.voorVogelsIn }}</td>
          <td>{{ vogel.voorVogelsUit }}</td>
          <td>{{ getRadarPredict(vogel.id) }}</td>
          <td>{{ vogel.d1tmax }}</td>
          <td>{{ vogel.date }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  import { addUserAction } from './../LoggingFunctions/LoggingDatabaseFunctions.js';
export default {
  name: 'Voorspelling',
  data() {
    return {
      vogels: [],
      vogelsLangs: [],
    };
  },
  methods: {
    // Data in document Gebruikersacties van database logging zetten
    actionOpenPageInLoggingDatabase() {
      addUserAction("Opent het scherm", this.$options.name);
    },
    async fetchData() {
      try {
        // Fetch gegevens van de eerste API
        const responseVogels = await fetch('http://84.235.165.56:1880/mc/vogels');
        const dataVogels = await responseVogels.json();
        this.vogels = dataVogels;

        // Fetch gegevens van de tweede API
        const responseLangs = await fetch('http://84.235.165.56:1880/get/mc/radar');
        const dataLangs = await responseLangs.json();
        this.vogelsLangs = dataLangs;
      } catch (error) {
        console.error('Er is een fout opgetreden bij het ophalen van de gegevens:', error);
      }
    },
    getRadarPredict(id) {
      const matchingVogel = this.vogelsLangs.find(vogel => vogel.id === id);
      return matchingVogel ? matchingVogel.radarPredict : 'N/A';
    },
  },
  mounted() {
    this.fetchData();
    this.actionOpenPageInLoggingDatabase();
  }
};
</script>

<style scoped>
/* Voeg hier stijlen toe voor de tabel */
.vogels-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.vogels-table th,
.vogels-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.vogels-table th {
  background-color: #f2f2f2;
}
</style>
