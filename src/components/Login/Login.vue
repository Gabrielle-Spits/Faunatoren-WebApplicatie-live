<template>
  <div class="login-container">
    <h1 class="h1-position">Inloggen</h1>
    <div class="form-container-login">
      <!-- Toegevoegde div voor foutmelding -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="email">Emailadres:</label>
          <input type="email" id="email" name="email" v-model="email">
        </div>
        <div class="form-group">
          <label for="password">Wachtwoord:</label>
          <input type="password" id="password" name="password" v-model="password">
        </div>
        <div class="button-group">
          <input type="submit" value="Inloggen">
          <router-link class="registreren-btn" to="/Register">Registreren</router-link>
        </div>
      </form>
      <p><router-link class="wwVergeten" to="/PasswordRecovery">Wachtwoord vergeten?</router-link></p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      role: '',
      // Toegevoegde data voor fout- en succesmeldingen
      errorMessage: '',
    };
  },
  methods: {
    getNameOfVueFile() {
      console.log(this.$options.name);
    },
    login() {
      if (!this.email || !this.password) {
        this.showError('Vul alle velden in.');
      } else {
        this.handleLogin();
      }
    },
    async addLoggedUserInLoggingDatabase(isSuccesvolIngelogd) {
      try {
        const currentdatetime = new Date().toLocaleString("nl-NL").replace('T', ' ').replace('Z', '');
        const jsonInloggenLoginGebruikers = {
          emailadres: this.email,
          moment: currentdatetime,
          boolIngelogd: 1,
          boolOk: isSuccesvolIngelogd
        };
        const addEmailAndInlogmomentInLoggingDatabase = await fetch('https://193.123.33.162:1880/post/loglogin', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify(jsonInloggenLoginGebruikers),
        });

        if (addEmailAndInlogmomentInLoggingDatabase.ok) {
          console.log('Login data posted successfully');
        } else {
          console.error('Failed to post login data');
        }
      } catch (error) {
        console.error('Er is een fout opgetreden tijdens het invoeren van loggen:', error);
      }
    },
    async handleLogin() {
      try {
        const checkEmailUrl = `https://84.235.165.56:1880/get/login/one/` + this.email;
        const emailResponse = await fetch(checkEmailUrl);

        if (!emailResponse.ok) {
          this.errorMessage = 'Dit e-mailadres is niet bij ons bekend';
        } else {
          const emailData = await emailResponse.json();
          const wachtwoordDB = emailData[0].password;
          const emaildb = emailData[0].email;

          const checkPassword = `https://84.235.165.56:1880/get/hash/` + this.password;
          const hashResponse = await fetch(checkPassword);

          if (!hashResponse.ok) {
            this.showError('Er is iets fout gegaan probeer het later nog eens');
          } else {
            const hashData = await hashResponse.json();
            const hashWachtwoord = hashData.hash;

            if (wachtwoordDB === hashWachtwoord && emaildb.toLowerCase() === this.email.toLowerCase()) {
              alert('U bent succesvol ingelogd');
              this.email = emaildb;
              const roledb = emailData[0].role;

              this.addLoggedUserInLoggingDatabase(1);

              if (roledb === 'admin' || roledb === 'manager') {
                sessionStorage.setItem('inlogmoment', new Date().toLocaleString("nl-NL").replace('T', ' ').replace('Z', ''));
                sessionStorage.setItem('username', emaildb);
                sessionStorage.setItem('role', roledb);

                this.role = roledb;
                window.location.href = "/";
              }

            } else {
              this.showError('Combinatie van wachtwoord en email in correct');
              this.addLoggedUserInLoggingDatabase(0);
            }
          }
        }
      } catch (error) {
        this.showError('Er is een fout opgetreden, probeer het later nog een keer');
      }
    },
    showError(message) {
      this.errorMessage = message;
      setTimeout(() => {
        this.errorMessage = ''; // Verwijder de foutmelding na een paar seconden
      }, 5000);
    },
  },
  mounted() {
    this.getNameOfVueFile();
  },
};
</script>

<style>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.h1-position {
  margin-left: 0;
}

.form-container-login {
  padding: 16px;
  border: 1px solid gray;
  border-radius: 10px;
  background-color: rgb(245, 245, 245);
  margin: 0 auto;
  text-align: center;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input,
.registreren-btn {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  transition: border-color 0.3s;
}

.registreren-btn {
  margin-left: 10px;
  text-decoration: none;
  color: black;
}

.registreren-btn:hover {
  text-decoration: underline;
}

input:focus {
  outline: none;
  border-color: #6c63ff;
}

.button-group {
  display: flex;
  justify-content: space-between;
}

.wwVergeten {
  text-decoration: none;
  color: #fe41e8;
}

.wwVergeten:hover {
  text-decoration: underline;
}

/* Stijl voor foutmeldingen */
.error-message {
  color: white;
  padding: 10px;
  margin-top: 10px;
  border-radius: 5px;
  background-color: red;
}

/* Stijl voor succesmeldingen */
.success-message {
  color: white;
  padding: 10px;
  margin-top: 10px;
  border-radius: 5px;
  background-color: green;
}
</style>
