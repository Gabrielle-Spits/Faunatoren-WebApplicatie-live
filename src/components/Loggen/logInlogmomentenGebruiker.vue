<template>
  <div>
    <h1>Gebruikers Inloggegevens</h1>
    <div class="filter-container">
      <label class="lblEmail" for="userEmails">Filter op e-mail:</label>
      <select id="userEmails" v-model="selectedUserEmail" @change="filterUserLoginData">
        <option value="">Alle e-mails</option>
        <option v-for="email in userEmails" :key="email" :value="email">{{ email }}</option>
      </select>
    </div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Emailadres</th>
            <th>Moment</th>
            <th>Ingelogd</th>
            <th>Ok</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in visibleUsers" :key="user.emailadres">
            <td>{{ user.emailadres }}</td>
            <td>{{ user.moment }}</td>
            <td>{{ user.boolIngelogd }}</td>
            <td>{{ user.boolOk }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
  
<script>
  import { addUserAction } from './../LoggingFunctions/LoggingDatabaseFunctions.js';

export default {
  name: 'logInlogmomentenGebruiker',
  data() {
    return {
      users: [],
      userEmails: [],
      visibleUsers: [],
      selectedUserEmail: '', // Initieel is het leeg, wat betekent dat alle e-mails worden getoond.
      displayRowCount: 20,
    };
  },
  mounted() {
    // Haal gegevens op van de API
    this.fetchUserLoginData();

    this.actionOpenPageInLoggingDatabase();
  },
  methods: {
    actionOpenPageInLoggingDatabase() {
      addUserAction("Opent het scherm", this.$options.name);
    },
    async fetchUserLoginData() {
      try {
        const response = await fetch('https://84.235.165.56:1880/get/LoginGebruikers');

        if (response.status != 200){
          addUserAction("Foutmeldingscode " + response.status + " API call {https://84.235.165.56:1880/get/LoginGebruikers} in method {fetchUserLoginData()}",
          this.$options.name, String.empty, String.empty, "Het ophalen van gegevens van de ingelogde gebruikers is mislukt.");
        }

        const data = await response.json();
        this.users = data;
        this.userEmails = [...new Set(this.users.map(user => user.emailadres))];
        this.filterUserLoginData(); // Toon alle gegevens bij het laden
      } catch (error) {
        addUserAction("Foutmelding in method {fetchUserLoginData()}", this.$options.name, String.empty, String.empty,
        "Server https://84.235.165.56:1880 down.");
        // console.error('Fout bij ophalen gebruikersinloggegevens:', error);
      }
    },

    filterUserLoginData() {
      if (!this.selectedUserEmail) {
        this.visibleUsers = this.users.slice(0, this.displayRowCount);
      } else {
        this.visibleUsers = this.users.filter(user => user.emailadres === this.selectedUserEmail).slice(0, this.displayRowCount);
      }
    },
  },
};
</script>
  
<style scoped>
h1 {
  margin-bottom: 20px;
  color: rgb(19, 101, 61);
}

.filter-container {
  margin-bottom: 20px;
}

.lblEmail {
  margin-bottom: 15px;
}



.table-container {
  max-height: 400px;
  overflow-y: auto;
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid rgb(34, 176, 107);
  padding: 8px;
  text-align: left;
}

th {
  background-color: rgb(38, 193, 118);
  position: sticky;
  top: 0;
}
</style>
  