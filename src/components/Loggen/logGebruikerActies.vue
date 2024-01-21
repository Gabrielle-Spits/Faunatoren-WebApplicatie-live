<template>
  <template v-if="isAuthorized">
    <div class="logGebruikerActies">
      <h1 class="h1-gebruikersacties">Gebruikerslogoverzicht</h1>
      <div class="email-dropdown">
        <label class="lblEmail" for="userEmails">Filter op e-mail:</label>
        <select id="userEmails" v-model="selectedUserEmail" @change="filterUserLogEntries">
          <option value="">Alle e-mails</option>
          <option v-for="email in userEmails" :key="email" :value="email">{{ email }}</option>
        </select>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Emailadres</th>
              <th>Inlogmoment</th>
              <th>Moment</th>
              <th>Activiteit Type</th>
              <th>Schermnaam</th>
              <th>Foutmelding</th>
              <th>Originele Waarde</th>
              <th>Nieuwe Waarde</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="logEntry in filteredUserLogEntries" :key="logEntry.id">
              <td>{{ logEntry.emailadres }}</td>
              <td>{{ logEntry.inlogmoment }}</td>
              <td>{{ logEntry.moment }}</td>
              <td>{{ logEntry.activiteitType }}</td>
              <td>{{ logEntry.schermnaam }}</td>
              <td>{{ logEntry.foutmelding }}</td>
              <td>{{ logEntry.origineleWaarde }}</td>
              <td>{{ logEntry.nieuweWaarde }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
</template>


<style scoped>
.logGebruikerActies {
  padding-top: 10px;
}

.h1-gebruikersacties{
  margin-bottom: 20px;
  color: rgb(19, 101, 61);
}

.email-dropdown {
  margin-bottom: 20px;
}

.lblEmail{
  margin-bottom: 15px;
  text-align: center;
}

.table-container {
  margin-top: 20px;
  max-height: 500px;
  overflow-y: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid rgb(39, 204, 124);
  padding: 8px;
  text-align: center;
}

th {
  border: 1px solid rgb(30, 161, 98);
  background-color:rgb(39, 204, 124);
  color: black;
  position: sticky;
  top: 0;
  text-align: center;
}


</style>

<script>
import { getUserLogEntries, addUserAction } from './../LoggingFunctions/LoggingDatabaseFunctions.js';

export default {
  name: 'logGebruikerActies',
  data() {
    return {
      userLogEntries: [],
      userEmails: [],
      filteredUserLogEntries: [],
      selectedUserEmail: '', // Initieel is het leeg, wat betekent dat alle e-mails worden getoond.
      role: sessionStorage.getItem('role'),
    };
  },
  computed: {
    isAuthorized() {
      return this.role === 'Admin';
    },
  },
  methods: {
    actionOpenPageInLoggingDatabase() {
      addUserAction("Opent het scherm", this.$options.name);
    },
    async fetchUserLogEntries() {
      try {
        this.userLogEntries = await getUserLogEntries();
        this.userEmails = [...new Set(this.userLogEntries.map(entry => entry.emailadres))];
        this.filterUserLogEntries();
      } catch (error) {
        // console.error('Fout bij ophalen gebruikersacties:', error);
      }
    },

    
    filterUserLogEntries() {
      if (!this.selectedUserEmail) {
        this.filteredUserLogEntries = this.userLogEntries;
      } else {
        this.filteredUserLogEntries = this.userLogEntries.filter(entry => entry.emailadres === this.selectedUserEmail);
      }
    },
  },
  mounted() {
    this.fetchUserLogEntries();
    this.actionOpenPageInLoggingDatabase();

    const userRole = sessionStorage.getItem('role');

    if (userRole !== 'Admin') {
      alert('Niet geautoriseerd. U wordt doorgestuurd naar de home pagina.');
      window.location.href = "/";
    }
  },
};
</script>

