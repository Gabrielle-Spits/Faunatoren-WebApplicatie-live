<template>
  <template v-if="isAuthorized">
    <div class="locatie-container">
      <div class="locatieupdatentoevoegen">
        <h1 v-if="showUpdateForm">Arduino updaten</h1>
        <h1 v-else>Arduino toevoegen</h1>

        <!-- Meldingsdiv voor fouten -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- Meldingsdiv voor succes -->
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <form @submit.prevent="handleSubmit" class="form-container">
          <div class="form-group">
            <label for="arduinoid">Arduino ID:</label>
            <input type="text" id="arduinoid" v-model="unoid" :readonly="showUpdateForm" />
          </div>
          <div class="form-group">
            <label for="arduinonaam">Vogelhuisje Naam:</label>
            <input type="text" id="arduinonaam" v-model="arduinonaam" />
          </div>
          <div class="form-group">
            <label for="locatie">Locatie ID:</label>
            <select id="locatie" v-model="locatieId">
              <option v-for="location in locations" :key="location" :value="location">
                {{ location }}
              </option>
            </select>
          </div>
          <button type="submit" class="action-button">{{ showUpdateForm ? 'Updaten' : 'Verzend' }}</button>
        </form>
      </div>
      <div class="readUno">
        <h1>Arduino gegevens</h1>
        <table class="arduino-table">
          <thead>
            <tr>
              <th>Locatie ID</th>
              <th>Vogelhuisje Naam</th>
              <th>Arduino ID</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="arduino in arduinoData" :key="arduino.unoid">
              <td>{{ arduino.locationid }}</td>
              <td>{{ arduino.unoname }}</td>
              <td>{{ arduino.unoid }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Update-knop -->
        <button class="action-button" @click="updateArduinoClicked">
          {{ showUpdateForm ? 'Annuleren' : 'Update Arduino' }}
        </button>

        <!-- Dropdown met locatie-ID's -->
        <select v-if="showUpdateForm" v-model="selectedLocation" @change="fillFormWithSelectedArduino">
          <option v-for="arduino in arduinoData" :key="arduino.unoid" :value="arduino.unoid">
            {{ arduino.unoid }}
          </option>
        </select>
      </div>
    </div>
  </template>
</template>

<script>
import { addUserAction } from '../LoggingFunctions/LoggingDatabaseFunctions.js';
export default {
  name: 'ArduinoLocation',
  data() {
    return {
      locatieId: '',
      unoid: '',
      arduinonaam: '',
      locations: [], // Array om locatie-id's op te slaan
      arduinoData: [],
      showUpdateForm: false,
      role: sessionStorage.getItem('role'),
      errorMessage: '',
      successMessage: '',
    };
  },
  mounted() {
    this.fetchLocations();
    this.fetchArduinoData();
    this.actionOpenPageInLoggingDatabase();
    const userRole = sessionStorage.getItem('role');

    if (userRole !== 'Admin') {
      alert('Niet geautoriseerd. U wordt doorgestuurd naar de home pagina.');
      window.location.href = "/";
    }
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
    async handleSubmit() {
      const isOldDataEmpty = [this.locatieId, this.unoid, this.arduinonaam].some(value => value === '');

      if (!isOldDataEmpty) {
        this.handleDataSubmission();
      } else {
        this.showError('Niet alle velden zijn ingevuld.');
      }
    },

    async handleDataSubmission() {
      const unonameExists = await this.checkUnonameExists(this.locatieId, this.arduinonaam);

      if (!unonameExists) {
        if (this.showUpdateForm) {
          this.updateArduino();
        } else {
          this.postArduino();
        }
      } else {
        this.showError('Arduino met deze naam bestaat al op deze locatie.');
      }
    },

    async postArduino() {
      const unoidExists = await this.checkUnoidExists(this.unoid);
      if (unoidExists) {
        this.showError('Arduino met dit ID bestaat al.');
        return;
      }
      else {
      }
      const data = {
        locationid: this.locatieId,
        unoid: this.unoid,
        unoname: this.arduinonaam,
      };

      try {
        const response = await fetch('https://84.235.165.56:1880/post/uno', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const result = await response.json();
          this.showSuccess('Arduino succesvol toegevoegd.');
          addUserAction("Arduino toevoegen", this.$options.name, null, JSON.stringify(data));
          this.resetForm();
          this.fetchArduinoData();
        } else {
          addUserAction("Foutmelding API toevoegen Arduino UNO", this.$options.name, String.empty, String.empty, "Er is iets fout gegaan in de API call /post/uno.");
          this.showError('Fout bij het toevoegen van Arduino-gegevens.');
        }
      } catch (error) {
        addUserAction("Foutmelding API toevoegen Arduino UNO", this.$options.name, String.empty, String.empty, "De API call van het toevoegen van een Arduino UNO is ongeldig.");
        this.showError('Fout bij het toevoegen van Arduino-gegevens.');
      }
    },
    async updateArduino() {
      const data = {
        locationid: this.locatieId,
        unoid: this.unoid,
        unoname: this.arduinonaam,
      };

      try {
        const response = await fetch('https://84.235.165.56:1880/update/uno', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const result = await response.json();
          this.showSuccess('Arduino succesvol bijgewerkt.');

          // Haalt de originele Arduino gegegevens op
          const getOriginalArduino = this.arduinoData.find(arduino => arduino.unoid == data.unoid);

          // Sla de originele Arduino gegevens in een nieuwe array op
          const makeOriginalArduinoObject = {
            locationid: getOriginalArduino.locationid,
            unoid: getOriginalArduino.unoid,
            unoname: getOriginalArduino.unoname
          }

          addUserAction("Arduino wijzigen", this.$options.name, JSON.stringify(makeOriginalArduinoObject), JSON.stringify(data));
          
          this.fetchArduinoData();
        } else {
          addUserAction("Foutmelding API wijzigen Arduino UNO", this.$options.name, String.empty, String.empty, "Er is iets fout gegaan in de API call /update/uno.");
          this.showError('Fout bij het bijwerken van Arduino-gegevens.');
        }
      }
      catch (error) {
        addUserAction("Foutmelding API wijzigen Arduino UNO", this.$options.name, String.empty, String.empty, "De API call van het wijzigen van een Arduino UNO is ongeldig.");
        this.showError('Er is iet fout gegaan bij het wijzigen van de Arduino probeer het later opnieuw.');

      }
    },


    async checkUnoidExists() {
      try {
        const url = `https://84.235.165.56:1880/get/uno/one/${this.unoid}`;
        const response = await fetch(url);
        if (response.status != 200) {
          addUserAction("Foutmeldingscode " + response.status + " API call {https://84.235.165.56:1880/get/uno/one/${unoid}} in method {checkUnoidExists(unoid)}",
            this.$options.name, String.empty, String.empty, "Het ophalen van gegevens van één specifieke Arduino is mislukt.");
        }
        const data = await response.json();
        return data.length > 0;
      }
      catch (error) {
        addUserAction("Foutmelding in method checkUnoidExists(unoid)", this.$options.name, String.empty, String.empty,
          "Server https://84.235.165.56:1880 down.");
          this.showError('Er is iet fout gegaan probeer het later opnieuw.');

        return false;
      }
    },

    async checkUnonameExists(locatieId, unoname) {
      try {
        const response = await fetch(`https://84.235.165.56:1880/get/uno/${locatieId}`);

        if (response.status != 200) {
          addUserAction("Foutmeldingscode " + response.status + "API call {https://84.235.165.56:1880/get/uno/${locatieId}} in method {checkUnonameExists(locatieId, unoname)}",
            this.$options.name, String.empty, String.empty, "Het ophalen van gegevens van één specifieke locatie is mislukt.");
        }

        const data = await response.json();
        return data.some(arduino => arduino.unoname === unoname);
      } catch (error) {
        addUserAction("Foutmelding in method checkUnonameExists(locatieId, unoname)", this.$options.name, String.empty, String.empty,
          "Server https://84.235.165.56:1880 down.");
        return false;
      }
    },





    async fetchLocations() {
      try {
        const response = await fetch('https://84.235.165.56:1880/get/location');
        if (response.status != 200) {
          addUserAction("Foutmeldingscode " + response.status + " API {https://84.235.165.56:1880/get/location} in method {fetchLocations()}",
            this.$options.name, String.empty, String.empty, "Het ophalen van alle locaties is mislukt.");
        }

        const data = await response.json();
        this.locations = data.map(location => location.locationid);
      } catch (error) {
        addUserAction("Foutmelding in method {fetchLocations()}", this.$options.name, String.empty, String.empty,
          "Server https://84.235.165.56:1880 down.");
      }
    },

    async fetchArduinoData() {
      try {
        const response = await fetch('https://84.235.165.56:1880/get/uno');
        if (response.status != 200) {
          addUserAction("Foutmeldingscode " + response.status + " API {https://84.235.165.56:1880/get/uno} in method {fetchArduinoData()}",
            this.$options.name, String.empty, String.empty, "Het ophalen van alle Arduino UNO's is mislukt.");
        }

        const data = await response.json();
        this.arduinoData = data;
      } catch (error) {
        addUserAction("Foutmelding in method {fetchArduinoData()}", this.$options.name, String.empty, String.empty,
          "Server https://84.235.165.56:1880 down.");
      }
    },
   
    updateArduinoClicked() {
      this.showUpdateForm = !this.showUpdateForm;

      if (this.showUpdateForm && this.arduinoData.length > 0) {
        this.selectedLocation = this.arduinoData[0].unoid;
        this.fillFormWithSelectedArduino();
      } else {
        this.selectedLocation = null;
        this.resetForm();
      }
    },
    fillFormWithSelectedArduino() {
      const selectedArduino = this.arduinoData.find(arduino => arduino.unoid === this.selectedLocation);

      if (selectedArduino) {
        this.locatieId = selectedArduino.locationid;
        this.unoid = selectedArduino.unoid;
        this.arduinonaam = selectedArduino.unoname;
      }
    },
    resetForm() {
      this.locatieId = '';
      this.unoid = '';
      this.arduinonaam = '';
    },
    showSuccess(message) {
      this.successMessage = message;
      setTimeout(() => {
        this.successMessage = ''; // Verwijder de succesmelding na een paar seconden
      }, 5000);
    },
    showError(message) {
      this.errorMessage = message;
      setTimeout(() => {
        this.errorMessage = ''; // Verwijder de foutmelding na een paar seconden
      }, 5000);
    },
  },
};
</script>

<style scoped>
.locatie-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  /* Extra ruimte aan de bovenkant voor consistentie */
}

.locatieupdatentoevoegen {
  width: 50%;
  padding: 10px;
}


.error-message,
.success-message {
  color: white;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}

.error-message {
  background-color: red;
}

.success-message {
  background-color: green;
}

.form-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  background-color: #fdfff3;
  border: 1px solid gray;
  border-radius: 10px;
  padding: 16px;
  box-sizing: border-box;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  text-align: center;
}

input,
select {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  transition: border-color 0.3s;
}

input:focus,
select:focus {
  outline: none;
  border-color: #6c63ff;
}

#locatie {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  /* Voeg hier de margin toe aan de onderkant van de dropdown */
}

button,
.action-button {
  width: 100%;
  padding: 8px;
  background-color: #a6ad8d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  margin-bottom: 10px;
  /* Voeg hier de margin toe aan de bovenkant van de knop */
}

button:hover,
.action-button:hover {
  background-color: #bababa;
}


.readUno {
  width: 50%;
  padding: 10px;
}

.arduino-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  max-height: 325px;
  overflow-y: auto;
}

.arduino-table th,
.arduino-table td {
  border: 1px solid #bfc5a4;
  padding: 8px;
  text-align: left;
}

.arduino-table th {
  background-color: #bfc5a4;
  position: sticky;
  top: 0;
  z-index: 1;
  /* Zorg ervoor dat de kolomnamen boven de andere cellen blijven */
}
</style>