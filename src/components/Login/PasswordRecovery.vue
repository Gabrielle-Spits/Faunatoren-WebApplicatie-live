<template>
  <div class="register-container">
    <div class="header">
      <h1>Wachtwoord Herstellen</h1>
    </div>
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    <div class="form-container">
      <form @submit.prevent="recoveryPassword">
        <div class="form-group">
          <label for="email">E-mailadres:</label>
          <input type="email" id="email" v-model="email" />
        </div>

        <div class="form-group">
          <label for="password">Nieuw Wachtwoord:</label>
          <input type="password" id="password" v-model="password" />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Herhaal Wachtwoord:</label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" />
        </div>

        <div class="form-group">
          <label for="passwordRecovery">Wachtwoordzin:</label>
          <input type="text" id="passwordRecovery" v-model="passwordRecovery" />
        </div>

        <button type="submit">Wachtwoord veranderen</button>
      </form>
    </div>
  </div>
</template>
  
<script>
import axios from 'axios';

export default {
  data() {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      passwordRecovery: '',
      errorMessage: '',
    };
  },
  methods: {
    async recoveryPassword() {
      this.errorMessage = '';
      this.successMessage = '';

      if (!this.email || !this.password || !this.confirmPassword || !this.passwordRecovery) {
        this.showError('Vul alle velden in.');
      } else if (
        this.password.length < 12 ||
        !/[A-Z]/.test(this.password) ||
        !/[!@#$%^&*(),.?":{}|<>]/.test(this.password)
      ) {
        this.showError('Wachtwoord moet 12 karakters lang zijn en een hoofdletter en een speciaal teken bevatten.');
      } else if (this.password !== this.confirmPassword) {
        this.showError('Wachtwoorden zijn niet hetzelfde probeer het opnieuw');
      } else {
        await this.verifyEmailAndPasswordRecovery();
      }
    },
    async verifyEmailAndPasswordRecovery() {
      try {
        const checkEmailUrl = `http://84.235.165.56:1880/get/login/one/${this.email}`;
        const emailResponse = await axios.get(checkEmailUrl);

        if (!emailResponse.ok) {
          this.showError('Dit e-mailadres is niet bij ons bekend');
          this.$router.push('/Register');
        }
        else {
          const emailData = emailResponse.data;

          if (emailData.length > 0) {
            const emaildb = emailData[0].email;
            const passwordRecoverydb = emailData[0].passwordRecovery;

            try {
              const checkPasswordRecovery = `http://84.235.165.56:1880/get/hash/` + this.passwordRecovery;
              const hashResponse = await axios.get(checkPasswordRecovery);
              const hashData = hashResponse.data;
              const hashPasswordRecovery = hashData.hash;

              if (passwordRecoverydb === hashPasswordRecovery && emaildb.toLowerCase() === this.email.toLowerCase()) {
                await this.handlePasswordChange();
              } else {
                this.showError('De combinatie van de wachtwoordherstelzin en e-mail is incorrect');
              }
            } catch (error) {
              this.showError('Er is een fout opgetreden probeer het later opnieuw');
            }
          } else {
            this.alert = 'Geen gegevens gevonden voor het opgegeven e-mailadres';
            this.$router.push('/Register');
          }
        }
      } catch (error) {
        this.showError('Er is een fout opgetreden, probeer het later opnieuw');
      }
    },
    async handlePasswordChange() {
      try {
        const formData = {
          email: this.email,
          password: this.password,
        };

        const response = await axios.put('http://84.235.165.56:1880/update/login', formData);

        if (response.ok) {
          alert('Wachtwoord is succesvol gewijzigd!');
          this.$router.push('/Login');
        } else {
          this.showError('er is iets fout gegaan probeer het later opnieuw');
        }
      } catch (error) {
        this.showError('er is iets fout gegaan probeer het later opnieuw');
      }
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
.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
}

.header {
  text-align: center;
}

.message-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.message-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  margin-top: 10px;
}

.error-message {
  color: red;
}


.close-button {
  cursor: pointer;
  color: #6c63ff;
  font-weight: bold;
}

.form-container {
  width: 100%;
  max-width: 400px;
  padding: 16px;
  border: 1px solid gray;
  border-radius: 10px;
  background-color: rgb(245, 245, 245);
  margin: 0 auto;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input,
button {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  transition: border-color 0.3s;
}

input:focus,
button:focus {
  outline: none;
  border-color: #6c63ff;
}
</style>
  