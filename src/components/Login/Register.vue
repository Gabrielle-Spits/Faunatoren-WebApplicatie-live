<template>
  <div class="register-container">
    <h1 class="h1-position-register">Registreren</h1>
    <div class="form-container-register">
      <!-- Meldingsdiv voor fouten -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>


      <form @submit.prevent="register">
        <div class="form-group">
          <label for="email">Emailadres:</label>
          <input type="email" id="email" name="email" v-model="email">
        </div>
        <div class="form-group">
          <label for="password">Wachtwoord:</label>
          <input type="password" id="password" name="password" v-model="password">
        </div>
        <div class="form-group">
          <label for="repeatPassword">Wachtwoord herhalen:</label>
          <input type="password" id="repeatPassword" name="repeatPassword" v-model="repeatPassword">
        </div>
        <div class="form-group">
          <label for="passwordRecovery">Wachtwoord herstelzin:</label>
          <input type="text" id="passwordRecovery" name="passwordRecovery" v-model="passwordRecovery">
        </div>
        <div v-if="passwordValidation" class="error-message">Wachtwoord moet minimaal 12 karakters lang zijn, een
          hoofdletter en een speciaal teken bevatten.</div>
        <div v-if="emailExists" class="error-message">Dit e-mailadres is al geregistreerd.</div>
        <input type="submit" value="Registreren">
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data() {
    return {
      email: '',
      password: '',
      repeatPassword: '',
      passwordRecovery: '',
      role: 'admin',
      passwordValidation: false,
      emailExists: false,
      errorMessage: '',
    };
  },
  methods: {
    register() {
      if (this.email && this.password && this.repeatPassword && this.passwordRecovery) {
        // alle velden zijn ingevuld
        // Voer de wachtwoordcontrole uit
        this.passwordControl();
      } else {
        // toont error op scherm
        this.showError('Vul alle velden in');
      }
    },
    passwordControl() {
      const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(.{12,})$/;
      const passwordRecoveryRegex = /^.{12,}$/;

      if (!passwordRegex.test(this.password)) {
        // Het wachtwoord voldoet niet aan het patroon
        this.showError('Uw wachtwoord voldoet niet aan patroon er moet 1 hoofdletter en een speciaal teken inzitten en 12 karakters lang zijn');
      } else if (!passwordRecoveryRegex.test(this.passwordRecovery)) {
        // de herstelzin is niet 12 karakaters lang
        this.showError("Wachtwoord herstelzin moet 12 karakters lang zijn")
      }
      else if (this.password !== this.repeatPassword) {
        // Het wachtwooord komt niet overeen met het wachtwoord herhalen
        this.showError("De wachtwoorden zijn niet gelijk aan elkaar");
      } else {
        this.emailControl();
      }
    },
    async emailControl() {
      // Voer de e-mailcontrole uit
      try {
        // Controleer of het e-mailadres het juiste formaat heeft
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\.[a-zA-Z]{2,4}$/;

        if (!emailRegex.test(this.email)) {
          this.showError("Ongeldig e-mailadres formaat. voorbeeld@gmail.com");
          return;
        }

        const formData = {
          email: this.email
        };
        const url = "http://84.235.165.56:1880/get/login/one/" + this.email;

        const response = await fetch(url);

        if (!response.ok) {
          this.showError("Er is een fout opgetreden probeer het later nog een keer")
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.length > 0) {
          this.showError("Dit e-mailadres heeft al een account");
        } else {
          // Doorgaan met registratie als e-mail in orde is
          this.handleRegister();
        }
      } catch (error) {
        this.showError("Er is een fout opgetreden probeer het later nog een keer")
        throw new Error('Network response was not ok');
      }
    },
    async handleRegister() {
      try {
        const formData = {
          email: this.email,
          password: this.password,
          passwordRecovery: this.passwordRecovery,
          role: this.role
        };

        const response = await fetch('http://84.235.165.56:1880/post/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          alert('U registratie is gelukt u wordt doorgestuurd naar de login pagina');
          window.location.href = "/Login";
        } else {
          this.showError("Er is een fout opgetreden probeer het later nog een keer")
        }
      } catch (error) {
        this.showError("Er is een fout opgetreden probeer het later nog een keer")
      }
    },
    showError(message) {
      this.errorMessage = message;
      setTimeout(() => {
        this.errorMessage = ''; // Verwijder de foutmelding na een paar seconden
      }, 5000);
    },
  }
}
</script>

<style>
.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-container-register {
  padding: 16px;
  border: 1px solid gray;
  border-radius: 10px;
  background-color: rgb(245, 245, 245);
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #6c63ff;
}

.error-message {
  background-color: red;
}

.success-message {
  background-color: green;
}
</style>
