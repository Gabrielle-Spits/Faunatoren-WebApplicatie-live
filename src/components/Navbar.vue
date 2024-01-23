<template>
  <div>
    <router-view />
    <nav class="navbar" role="navigation" aria-label="main navigation">
      <li><router-link to="/" class="router-link">Home</router-link></li>

      <!-- Alleen weergeven als gebruiker niet is ingelogd -->
      <li v-if="role !== 'guest' && role !== 'admin'" class="login">
        <router-link class="router-link" to="/Login">Login</router-link>
      </li>

      <!-- Gebruiker is niet op de website ingelogd -->
      <li v-if="isAuthenticated === false" class="login">
        <a class="router-link" @click="loginAuth()">OAuth inloggen</a>
      </li>

      <!-- Gebruiker is wel op de website ingelogd -->
      <li v-if="isAuthenticated === true" class="login">
        <div class="dropdown">
          <a class="router-link" @click="toggleDropdown">Profiel</a>
          <div v-show="dropdownOpen" class="dropdown-content">
            <!-- Dropdown items hier -->
            <li class="dropdown-li"><p>email: {{ username }}</p></li>
            <li class="dropdown-li"><p>rol: {{ role }}</p></li>
            <li class="dropdown-li"><a class="uitloggen" @click="logoutAuth()">Uitloggen</a></li>
          </div>
        </div>
      </li>

      <li v-if="role === 'admin'" class="admin">
        <router-link class="router-link" to="/GebruikerLijst">Gebruikers</router-link>
      </li>
      <li v-if="isAuthenticated === true" class="admin">
        <router-link class="router-link" to='/Location'>Locatie</router-link>
      </li>
      <li v-if="isAuthenticated === true" class="admin">
        <router-link class="router-link" to='/ArduinoLocation'>Arduino</router-link>
      </li>
      <li v-if="isAuthenticated === true"  class="admin">
        <router-link class="router-link" to='/Loggen'>Logs</router-link>
      </li>
      <!-- Alleen weergeven als gebruiker is ingelogd als guest of admin -->
      <li v-if="role === 'guest' || role === 'admin' || role === 'manager'" class="login">
        <a class="router-link" @click="handleLogout">Uitloggen</a>
      </li>
    </nav>
  </div>
</template>

<script>
// Bibliotheek voor Authenticatie
import { useAuth0 } from '@auth0/auth0-vue';
import { addUserAction, addUserInLoginUsers } from './LoggingFunctions/LoggingDatabaseFunctions.js';

export default {
  name: 'Navbar',
  data() {
    return {
      username: sessionStorage.getItem('username'),
      role: sessionStorage.getItem('role'),
      currentUser: {}, // Het user object uit de oAuth meegeven
      isAuthenticated: false, // Aangeven of de gebruiker toegang heeft
      isLoading: null, // Meegeven of de oAuth data al is opgehaald
      dropdownOpen: false,
      test:1,
    };
  },
  methods: {
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    },
    // De gegevens uit oAuth zijn opgehaald
    handleOauthCallback() {
      // Als de gebruiker is geautoriseert (is niet geblokkeerd), het e-mailadres in de session storage zetten
      if (this.isAuthenticated) {
        sessionStorage.setItem("username", this.currentUser.email);
        this.username =this.currentUser.email;
        sessionStorage.setItem("inlogmoment", new Date().toLocaleString("nl-NL").replace('T', ' ').replace('Z', ''));

        try {
          addUserInLoginUsers(1, 1);
        }
        catch (error) {

        }
        // Haalt de rol van de ingelogde gebruiker op
        this.getUserRoleAuth();
      } else if(this.role == 'admin'){

      }
      // De gebruiker is niet ingelogd. De session storage leegmaken
      else {
        sessionStorage.clear();
      }
    },
    // Haalt de rol van de ingelogde gebruiker op
    async getUserRoleAuth() {
      // Slaat de huidige token op
      var currentToken = '';
      // Haalt de token uit de database
      try {
        const getToken = await fetch('https://84.235.165.56:1880/get/token')
          .then(getToken => getToken.json())
          .then(data => {
            currentToken = data[0].token;
          })
      }
      catch (error) {
        // console.log("De token kan niet uit de database worden opgehaald: ", error);
      }

      // Haalt alle rollen uit de OAuth op
      try {
        const getRole = await fetch("https://dev-58uboumz4ybzna3t.us.auth0.com/api/v2/users/" + this.currentUser.sub + "/roles", {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + currentToken
          },
        })
          .then(getRole => getRole.json())
          .then(data => {
            sessionStorage.setItem('role', data[0].name);
            this.role = data[0].name;
          })
      }
      catch (error) {
        // console.log("Alle rollen van de gebruikers kunnen niet in OAuth worden opgehaald: ", error);
      }
    },
    loginAuth() {
      loginWithRedirect();

      // Leeg, want hij wordt toch overschreven in de mounted()
    },
    logoutAuth() {
      this.$auth0.logout({ logoutParams: { returnTo: 'http://localhost:5173' } })
    },
    handleLogout() {
      // hier haal ik email op
      const email = sessionStorage.getItem('username');
      
      // hier maak ik sessie leeg
      sessionStorage.clear();
      window.location.reload();

      // hier voer ik loggen uit voor uitlog moment
      this.logUitlogmoment(email);
    },
    // email moet meegegeven worden
    logUitlogmoment(email) {
      const uitlogmoment = new Date().toLocaleString("nl-NL").replace('T', ' ').replace('Z', '');
      // Maak een object met de gegevens die je wilt toe wilt voegen aan tabel
      const addLogoutMomentToLoggingGebruikers = {
        emailadres: email,
        moment: uitlogmoment,
        boolIngelogd: 0,
        boolOk: 1
      };

      // Maak een Post-verzoek naar de API
      fetch('https://84.235.165.56:1880/post/logLogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addLogoutMomentToLoggingGebruikers)
      })
        .then(response => {
          if (response.ok) {
            window.location.reload();
            // SessionStorage leegmaken

          } else {
            response.json().then(data => {
              // console.error('Er is een fout opgetreden bij het bijwerken van het uitlogmoment:', data);
            });
          }
        })
        .catch(error => {
          // console.error('Er is een fout opgetreden bij het maken van het uitlogverzoek:', error);
        });
    },
  },
  // Authenticatie
  async mounted() {
    const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();

    this.currentUser = user;
    this.isAuthenticated = isAuthenticated;
    this.loginAuth = loginWithRedirect;
    this.logoutAuth = logout;
    this.isLoading = isLoading;
  },
  watch: {
    // Luister naar veranderingen in de isLoading data variabele
    isLoading(newValue, oldValue) {
      // Zodra isLoading veranderd is naar FALSE doe de oauth update methode
      if (newValue == false) {
        this.handleOauthCallback()
      }
    },
  }
};
</script>

<style scoped>
.navbar {
  list-style-type: none;
  position: absolute;
  top: 0%;
  left: 0%;
  border: 0cm;
  width: 100%;
  background-color: rgb(29, 142, 87);
}

li {
  float: left;
  border-right: 1px solid rgb(40, 178, 111);
}

.router-link {
  display: block;
  color: white;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
}

.uitloggen{
  display: block;
  color: white;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
}

.login {
  float: right;
  border-left: 1px solid #bbb;
}

a {
  cursor: pointer;
 
}

a:hover{
  text-decoration: underline;
}

.dropdown-content{
  border-top: 1px solid #bbb;
}
.dropdown-content .dropdown-li {
  border-top: 1px solid #bbb;

  float: none;
  display: block;
  text-align: center;
  color: white;
}


</style>