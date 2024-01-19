<template>
  <div v-if="isAuthorized">
    <h2>Alle Gebruikers</h2>
    <table class="user-table">
      <thead>
        <tr>
          <th>Email</th>
          <th>Rol</th>
          <th v-if="selectedUserEmail">Bewerken</th>
          <th v-if="selectedUserEmail">Verwijderen</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.email">
          <td>
            {{ user.email }}
          </td>
          <td>
            <div v-if="!user.editing">
              {{ user.role }}
            </div>
            <div v-else>
              <p>kies rol:</p>
              <select v-model="user.role" @change="saveRole(user)">
                <option v-if="role === 'admin' || role === 'manager'" value="guest">Guest</option>
                <option v-if="role === 'admin'" value="admin">Admin</option>
                <option v-if="role === 'admin'" value="manager">Manager</option>
                <option v-if="role === 'manager'" value="manager">Manager</option>
              </select>
              <button @click="cancelEdit(user)">Annuleren</button>
            </div>
          </td>
          <td v-if="selectedUserEmail === user.email">
            <button v-if="!user.editing" @click="editRole(user)">Gebruiker bewerken</button>
          </td>
          <td v-if="selectedUserEmail === user.email">
            <button v-if="!user.editing" @click="deleteUser(user.email)">Gebruiker verwijderen</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="email-dropdown">
      <label for="userEmails">Selecteer gebruiker:</label>
      <select id="userEmails" v-model="selectedUserEmail" @change="selectUser">
        <option v-for="user in users" :key="user.email" :value="user.email">{{ user.email }}</option>
      </select>
    </div>
  </div>
</template>

<script>
import { addUserAction } from '../LoggingFunctions/LoggingDatabaseFunctions.js';

export default {
  name: 'Gebruikerlijst',
  data() {
    return {
      users: [],
      username: null,
      role: null,
      selectedUserEmail: null,
    };
  },
  mounted() {
    this.username = sessionStorage.getItem('username');
    this.role = sessionStorage.getItem('role');

    if (this.isAuthorized) {
      this.fetchUsers();
    } else {
      const userRole = sessionStorage.getItem('role');

      if (userRole !== 'Admin') {
        alert('Niet geautoriseerd. U wordt doorgestuurd naar de home pagina.');
        window.location.href = "/";
      }

    }

    this.actionOpenPageInLoggingDatabase();
  },
  computed: {
    isAuthorized() {
      return this.role === 'admin';
    },
  },
  methods: {
    actionOpenPageInLoggingDatabase() {
      addUserAction("Opent het scherm", this.$options.name);
    },
    async fetchUsers() {
      try {
        const response = await fetch('https://84.235.165.56:1880/get/login/all');
        if (response.status != 200) {
          addUserAction("Foutmeldingscode " + response.status + " API call {https://84.235.165.56:1880/get/login/all} in method {fetchUsers()}",
            this.$options.name, String.empty, String.empty, "Het ophalen van alle gebruikers is mislukt.");
        }

        const data = await response.json();
        this.users = data.map(({ email, role }) => ({ email, role }));
      } catch (error) {
        addUserAction("Foutmelding in method {fetchUsers()}", this.$options.name, String.empty, String.empty,
          "Server http://84.235.165.56:1880 down.");
        console.error('Error fetching user data:', error);
      }
    },
    editRole(user) {
      user.editing = true; // Set editing status to true
    },
    async saveRole(user) {
      try {
        const response = await fetch('http://84.235.165.56:1880/update/role', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            role: user.role,
          }),
        });

        if (response.ok) {
          console.log('Role saved:', user.role);
          user.editing = false; // Set editing status to false
        } else {
          addUserAction("Foutmeldingscode " + response.status + " API call {http://84.235.165.56:1880/update/role} in method {saveRole(user)}",
            this.$options.name, String.empty, String.empty, "Het wijzigen van de rol van de gebruiker is mislukt.");
          console.error('Failed to save role:', response.statusText);
        }
      } catch (error) {
        addUserAction("Foutmelding in method {saveRole(user)}", this.$options.name, String.empty, String.empty,
          "Server http://84.235.165.56:1880 down.");
        console.error('Error saving role:', error);
      }
    },
    cancelEdit(user) {
      user.editing = false; // Cancel editing, revert to text
    },
    async deleteUser(userEmail) {
      console.log(userEmail);
      try {
        const response = await fetch(`http://84.235.165.56:1880/delete/user`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
          }),
        });
        if (response.ok) {
          console.log('User deleted:', userEmail);
          this.fetchUsers(); // Refresh the user list after deletion
        } else {
          addUserAction("Foutmeldingcode " + response.status + " API call {http://84.235.165.56:1880/delete/user} in method {deleteUser(userEmail)}",
            this.$options.name, String.empty, String.empty, "Het verwijderen van de gebruiker is mislukt.");
          console.error('Failed to delete user:', response.statusText);
        }
      } catch (error) {
        addUserAction("Foutmelding in method {deleteUser(userEmail)}", this.$options.name, String.empty, String.empty,
          "Server http://84.235.165.56:1880 down.");
        console.error('Error deleting user:', error);
      }
    }
  },
  selectUser() {
    // Geen functie nodig, omdat v-model de geselecteerde gebruiker bijhoudt
  },
};
</script>

<style>
h2 {
  margin-bottom: 20px;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.user-table th,
.user-table td {
  border: 1px solid #555;
  /* Donkerdere kleur voor de randen, bijvoorbeeld #555 */
  padding: 8px;
  text-align: left;
  cursor: pointer;
}

.user-table th {
  background-color: #f2f2f2;
}

select {
  margin-right: 10px;
}

.email-dropdown {
  margin-top: 20px;
}
</style>
