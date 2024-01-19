<template>
  <div class="log-overzicht">
    <button class="toggle-button" @click="toggleComponentVisibility">
      {{ showUserActions ? 'Inlogmomenten gebruikers bekijken' : 'Gebruikersacties bekijken' }}
    </button>
    <logGebruikerActies v-if="showUserActions"></logGebruikerActies>
    <logInlogmomentenGebruiker v-else></logInlogmomentenGebruiker>
  </div>
</template>

<script>
import { getUserLogEntries, addUserAction } from './../LoggingFunctions/LoggingDatabaseFunctions.js';
import logGebruikerActies from './logGebruikerActies.vue';
import logInlogmomentenGebruiker from './logInlogmomentenGebruiker.vue';

export default {
  name: 'logOverzicht',
  components: {
    logGebruikerActies,
    logInlogmomentenGebruiker,
  },
  data() {
    return {
      showUserActions: true, // Standaard weergeven gebruikersacties
    };
  },
  methods: {
    toggleComponentVisibility() {
      this.showUserActions = !this.showUserActions;
    },
    async actionOpenPageInLoggingDatabase() {
      try {
        await addUserAction("Opent het scherm", this.$options.name);
      } catch (error) {
        console.error('Fout bij toevoegen gebruikersactie:', error);
      }
    },

  },
  mounted() {
    this.actionOpenPageInLoggingDatabase();

    const userRole = sessionStorage.getItem('role');

    if (userRole !== 'Admin') {
      alert('Niet geautoriseerd. U wordt doorgestuurd naar de home pagina.');
      window.location.href = "/";
    }
  },

};
</script>

<style scoped>
.log-overzicht {
  text-align: center;
  margin-top: 20px;
}

.toggle-button {
  padding: 10px;
  font-size: 16px;
  color: rgb(19, 101, 61);
  /* Aangepaste kleur bij hover */
  background-color: rgb(39, 204, 124);
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
}
</style>
