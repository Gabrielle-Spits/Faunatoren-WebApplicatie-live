<template>
  <div class="locatie-container">
    <div class="locatieupdatentoevoegen">
      <h1 v-if="showUpdateForm && selectedLocation">Locatie updaten</h1>
      <h1 v-else>Locatie toevoegen</h1>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      <form @submit.prevent="handleSubmit" class="form-container-register">
        <div class="form-group">
          <label for="locationid">Locatie ID:</label>
          <input v-model="locationid" :readonly="showUpdateForm" type="text" id="locationid">
        </div>

        <div class="form-group">
          <label for="locationname">Locatie naam:</label>
          <input v-model="locationname" type="text" id="locationname">
        </div>

        <div class="form-group">
          <label for="latitude">Breedtegraad:</label>
          <input v-model.number="latitude" @input="validateLatitude" type="number" step="any" id="latitude" />
        </div>

        <div class="form-group">
          <label for="longitude">Lengtegraad:</label>
          <input v-model.number="longitude" @input="validateLongitude" type="number" step="any" id="longitude" />
        </div>

        <input type="submit" class="submitLocation" :value="submitButtonLabel">
      </form>
    </div>
    <div class="locatiegegevens">
      <h1>Locatiegegevens</h1>

      <table>
        <thead>
          <tr>
            <th>Locatie ID</th>
            <th>Locatie Naam</th>
            <th>Latitude</th>
            <th>Longitude</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="location in locations" :key="location.locationid">
            <td>{{ location.locationid }}</td>
            <td>{{ location.locationname }}</td>
            <td>{{ location.latitude }}</td>
            <td>{{ location.longitude }}</td>
          </tr>
        </tbody>
      </table>

      <button class="action-button" @click="updateLocationClicked">{{ showUpdateForm ? 'Annuleren' : 'Update Locatie'
      }}</button>

      <select v-if="showUpdateForm" v-model="selectedLocation" @change="locationSelected">
        <option v-for="location in locations" :key="location.locationid" :value="location.locationid">
          {{ location.locationid }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { addUserAction } from './../LoggingFunctions/LoggingDatabaseFunctions.js';

export default {
  name: 'Location',
  data() {
    return {
      locations: [],
      showLocationAdd: false,
      showUpdateForm: false,
      updatedLocationName: '',
      updatedLatitude: '',
      updatedLongitude: '',
      locationIds: [],
      locationid: '',
      locationname: '',
      latitude: '',
      longitude: '',
      username: sessionStorage.getItem('username'),
      role: sessionStorage.getItem('role'),
      submitButtonLabel: 'Locatie toevoegen',
      errorMessage: '',
      successMessage: ''
    };
  },
  created() {
    this.fetchLocations();
  },
  watch: {
    selectedLocation(newVal) {
      this.fetchLocationDetails(newVal);
      this.submitButtonLabel = this.showUpdateForm ? 'Locatie updaten' : 'Locatie toevoegen';
    },
  },
  methods: {
    actionOpenPageInLoggingDatabase() {
      addUserAction("Opent het scherm", this.$options.name);
    },
    async locationSelected() {
      this.fetchLocationDetails(this.selectedLocation);
      this.submitButtonLabel = this.showUpdateForm ? 'Locatie updaten' : 'Locatie toevoegen';
    },
    async fetchLocations() {
      try {
        const response = await fetch('https://84.235.165.56:1880/get/location');

        if (response.status != 200){
          addUserAction("Foutmeldingscode " + response.status + " API call {https://84.235.165.56:1880/get/location} in method {fetchLocations()}",
          this.$options.name, String.empty, String.empty, "Het ophalen van alle locaties is mislukt.");
        }

        const data = await response.json();
        this.locations = data;
        this.locationIds = this.locations.map(location => location.locationid);
      } catch (error) {
        addUserAction("Foutmelding in method {fetchLocations()}", this.$options.name, String.empty, String.empty,
        "Server https://84.235.165.56:1880 down.");

        this.showError('Er gaat iets mis, probeer het later nog een keer');
      }
    },
    async fetchLocationDetails(locationId) {
      try {
        const response = await fetch(`https://84.235.165.56:1880/get/location/${locationId}`);

        if (response.status != 200){
          addUserAction("Foutmeldingscode " + response.status + " API call {https://84.235.165.56:1880/get/location/${locationId}} in method {fetchLocationDetails(locationId)}",
          this.$options.name, String.empty, String.empty, "Het ophalen één specifieke locatie is mislukt.");
        }

        const data = await response.json();

        if (data.length > 0) {
          const locationDetails = data[0];
          this.locationid = locationDetails.locationid;
          this.locationname = locationDetails.locationname;
          this.latitude = locationDetails.latitude;
          this.longitude = locationDetails.longitude;
        } else {
          this.showError('Geselecteerde locatie niet gevonden.');
        }
      } catch (error) {
        addUserAction("Foutmelding in method {fetchLocations()}", this.$options.name, String.empty, String.empty,
        "Server https://84.235.165.56:1880 down.");

        this.showError('Fout bij het ophalen van locatiedetails, probeer het later nog een keer ');
      }
    },
    async checkLatitudeLongitude(latitude, longitude) {
      try {
        const checkLatitudeLongitudeURL = 'https://84.235.165.56:1880/get/location';
        const checkLatitudeResponse = await fetch(checkLatitudeLongitudeURL);

        if (checkLatitudeResponse.status != 200){
          addUserAction("Foutmeldingscode " + checkLatitudeResponse.status + " API call {https://84.235.165.56:1880/get/location} in method {checkLatitudeLongitude(latitude, longitude)}",
          this.$options.name, String.empty, String.empty, "Het ophalen van alle locaties is mislukt.")
        }

        const latitudeLongitudeData = await checkLatitudeResponse.json();

        const latitudeLongitudeExists = latitudeLongitudeData.some(location => location.latitude === latitude && location.longitude === longitude);

        return latitudeLongitudeExists;
      } catch (error) {
        addUserAction("Foutmelding in method {checkLatitudeLongitude(latitude, longitude)}", this.$options.name, String.empty, String.empty,
        "Server https://84.235.165.56:1880 down.");
        this.showError('Er gaat iets fout, probeer het later nog een keer:');
        return false;
      }
    },
    async postLocation() {
      if (this.locationid && this.locationname && this.latitude && this.longitude) {
        const locationExists = await this.checkLocationExists();
        const latitudeLongitudeExists = await this.checkLatitudeLongitude(this.latitude, this.longitude);
        if (!locationExists) {
          if (latitudeLongitudeExists) {
            this.showError('Er bestaat al een locatie met deze lengte- en breedtegraad.');
            return;
          }
          const isLatitudeValid = this.validateLatitude(this.latitude);
          const isLongitudeValid = this.validateLongitude(this.longitude);

          if (isLatitudeValid && isLongitudeValid) {
            const data = {
              locationid: this.locationid,
              locationname: this.locationname,
              latitude: this.latitude,
              longitude: this.longitude,
            };

            try {
              const responsePostLocation = await fetch('https://84.235.165.56:1880/post/location', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
              });

              if (responsePostLocation.ok) {
                const result = await responsePostLocation.json();
                this.showSuccess('Locatiegegevens succesvol toegevoegd');
                addUserAction("Locatie toevoegen", this.$options.name, null, JSON.stringify(data));
                this.clearLocationDetails();
                this.fetchLocations();
              } else {
                addUserAction("Foutmeldingscode " + responsePostLocation.status + " API call {https://84.235.165.56:1880/post/location} in method {postLocation()}",
                this.$options.name, String.empty, String.empty, "Het toevoegen van een locatie is mislukt.");
                this.showError('Er is iets fout gegaan, probeer het later opnieuw');
              }
            } catch (error) {
              addUserAction("Foutmelding in method {postLocation()}", this.$options.name, String.empty, String.empty,
              "Server https://84.235.165.56:1880 down.");
              this.showError('Er is iets fout gegaan, probeer het later opnieuw:');
            }
          } else {
            this.showError('De breedtegraad moet tussen -90 en 90 zijn en de lengtegraad tussen -180 en 180.');
          }
        } else {
          this.showError('De locatie-ID bestaat al.');
        }
      } else {
        this.showError('Vul alle velden in.');
      }
    },
    async updateLocation() {
      const isOldDataEmpty = [this.locationid, this.locationname, this.latitude, this.longitude].some(value => value === '');

      if (!isOldDataEmpty) {
        const isLatitudeValid = this.validateLatitude(this.latitude);
        const isLongitudeValid = this.validateLongitude(this.longitude);

        if (isLatitudeValid && isLongitudeValid) {
          const data = {
            locationid: this.selectedLocation,
            locationname: this.locationname,
            latitude: this.latitude,
            longitude: this.longitude,
          };

          try {
            const response = await fetch(`https://84.235.165.56:1880/update/location`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });

            if (response.ok) {
              const result = await response.json();
              this.showSuccess('Locatiegegevens succesvol bijgewerkt');

              // Haalt de originele locatiegegevens op
              const getOriginalLocation = this.locations.find(location => location.locationid == data.locationid);
              
              // Sla de originele locatiegegevens in een nieuwe array op
              const makeOriginalLocationObject = {
                locationid: getOriginalLocation.locationid,
                locationname: getOriginalLocation.locationname,
                latitude: getOriginalLocation.latitude,
                longitude: getOriginalLocation.longitude
              };

              addUserAction("Locatie wijzigen", this.$options.name, JSON.stringify(makeOriginalLocationObject), JSON.stringify(data));

              this.clearLocationDetails();

              this.fetchLocations();
              this.showUpdateForm = false;
              this.submitButtonLabel = 'Locatie toevoegen';
            } else {
              addUserAction("Foutmeldingscode " + response.status + " API call {https://84.235.165.56:1880/update/location} in method {updateLocation()}",
              this.$options.name, String.empty, String.empty, "Het wijzigen van een locatie is mislukt.");

              this.showError('Er gaat iets mis, probeer het later nog een keer');
            }
          } catch (error) {
            addUserAction("Foutmelding in method {updateLocation()}", this.$options.name, String.empty, String.empty,
            "Server https://84.235.165.56:1880 down.");

            this.showError('Er gaat iets mis, probeer het later nog een keer');
          }
        } else {
          this.showError('Er gaat iets mis, probeer het later nog een keer');
        }
      } else {
        this.showError('Vul alle velden in');
      }
    },
    validateLongitude(longitude) {
      return longitude >= -180 && longitude <= 180;
    },
    validateLatitude(latitude) {
      return latitude >= -90 && latitude <= 90;
    },
    async checkLocationExists() {
      try {
        const url = `https://84.235.165.56:1880/get/location/${this.locationid}`;
        const response = await fetch(url);
        if (!response.ok) {
          addUserAction("Foutmeldingscode " + response.status + " API call {https://84.235.165.56:1880/get/location/${this.locationid}} in method {checkLocationExists()}",
          this.$options.name, String.empty, String.empty, "Het ophalen van de door de gebruiker ingevulde locatie is mislukt.");
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.length > 0;
      } catch (error) {
        addUserAction("Foutmelding in method {checkLocationExists()}", this.$options.name, String.empty, String.empty,
        "Server https://84.235.165.56:1880 down.");
        this.showError('Er is iets fout gegaan, probeer het later nog een keer:');
        return false;
      }
    },
    updateLocationClicked() {
      this.showUpdateForm = !this.showUpdateForm;
      this.selectedLocation = null;
      this.clearLocationDetails();
      this.submitButtonLabel = 'Locatie toevoegen';
    },
    clearLocationDetails() {
      this.locationid = '';
      this.locationname = '';
      this.latitude = '';
      this.longitude = '';
    },
    handleSubmit() {
      if (this.showUpdateForm) {
        this.updateLocation();
      } else {
        this.postLocation();
      }
    },
    showSuccess(message, result) {
      this.successMessage = `${message} ${JSON.stringify(result)}`;
      setTimeout(() => {
        this.successMessage = '';
      }, 5000);
    },
    showError(message) {
      this.errorMessage = message;
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
    },
  },
  mounted() {
    this.actionOpenPageInLoggingDatabase();

    const userRole = sessionStorage.getItem('role');

    if (userRole !== 'Admin') {
      alert('Niet geautoriseerd. U wordt doorgestuurd naar de home pagina.');
      window.location.href = "/";
    }
  }
};
</script>

<style scoped>
.locatie-container {
  display: flex;
  justify-content: center;
}

.locatieupdatentoevoegen,
.locatiegegevens {
  width: 50%;
  margin: 20px;
}

.form-container-register {
  width: 100%;
  /* Maak het formulier 100% breed van zijn container */
  max-width: 400px;
  /* Stel een maximale breedte in voor het formulier */
  margin: 0 auto;
  /* Centreer het formulier binnen zijn container */
  background-color: #fdfff3;
}


.submitLocation {
  background-color: #A6AD8D;
  color: #fdfff3;
}

.table-container {
  max-height: 425px;
  overflow-y: auto;
}

.locatiegegevens table {
  width: 100%;
  border-collapse: collapse;
}

.locatiegegevens th,
.locatiegegevens td {
  border: 1px solid #c3caa5;
  padding: 8px;
  text-align: left;
}

.locatiegegevens th {
  background-color: #bfc5a4;
  position: sticky;
  top: 0;
}

.locatiegegevens button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #a6ad8d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
}


.locatiegegevens select {
  width: 100%;
  padding: 8px;
  margin-top: 10px;
  display: inline-block;
  border: 1px solid #ccc;
  box-sizing: border-box;
  border-radius: 4px;
}

.action-button {
  width: 100%;
}
</style>