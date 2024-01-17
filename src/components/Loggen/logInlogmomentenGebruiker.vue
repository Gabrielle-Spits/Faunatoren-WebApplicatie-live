<template>
    <div>
      <h1>Gebruikers Inloggegevens</h1>
      <div class="filter-container">
        <label for="userEmails">Filter op e-mail:</label>
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
    },
    methods: {
      async fetchUserLoginData() {
        try {
          const response = await fetch('http://84.235.165.56:1880/get/LoginGebruikers');
          const data = await response.json();
          this.users = data;
          this.userEmails = [...new Set(this.users.map(user => user.emailadres))];
          this.filterUserLoginData(); // Toon alle gegevens bij het laden
        } catch (error) {
          console.error('Fout bij ophalen gebruikersinloggegevens:', error);
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
  }
  
  .filter-container {
    margin-bottom: 20px;
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
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  
  th {
    background-color: #f2f2f2;
    position: sticky;
    top: 0;
  }
  </style>
  