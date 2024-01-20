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
      // Deze methode wordt pas uitgevoerd als de oAuth klaar is met laden... 
      console.log(this.isAuthenticated);
      console.log(this.currentUser);

      this.checkUserIsBlocked();

      // Als de gebruiker is geautoriseert (is niet geblokkeerd), het e-mailadres in de session storage zetten
      if (this.isAuthenticated) {
        console.log(this.currentUser.email);
        sessionStorage.setItem("username", this.currentUser.email);
        this.username =this.currentUser.email;
        sessionStorage.setItem("inlogmoment", new Date().toLocaleString("nl-NL").replace('T', ' ').replace('Z', ''));

        try {
          addUserInLoginUsers(1, 1);
          console.log("Werkt addUserInLoginUsers.");
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
    checkUserIsBlocked() {
      fetch("https://dev-58uboumz4ybzna3t.us.auth0.com/api/v2/users/auth0%7C6569daa56a822f7ee8380d53", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjJOQy1WZWhKbmJNb1oxdWdLZWpjeSJ9.eyJpc3MiOiJodHRwczovL2Rldi01OHVib3VtejR5YnpuYTN0LnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJxYXVUeHFMdGJFNWdueDJWQmwwNGhpWWlmZlI1a0t5S0BjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9kZXYtNTh1Ym91bXo0eWJ6bmEzdC51cy5hdXRoMC5jb20vYXBpL3YyLyIsImlhdCI6MTcwMjQ4MzY5MSwiZXhwIjoxNzA1MDc1NjkxLCJhenAiOiJxYXVUeHFMdGJFNWdueDJWQmwwNGhpWWlmZlI1a0t5SyIsInNjb3BlIjoicmVhZDpjbGllbnRfZ3JhbnRzIGNyZWF0ZTpjbGllbnRfZ3JhbnRzIGRlbGV0ZTpjbGllbnRfZ3JhbnRzIHVwZGF0ZTpjbGllbnRfZ3JhbnRzIHJlYWQ6dXNlcnMgdXBkYXRlOnVzZXJzIGRlbGV0ZTp1c2VycyBjcmVhdGU6dXNlcnMgcmVhZDp1c2Vyc19hcHBfbWV0YWRhdGEgdXBkYXRlOnVzZXJzX2FwcF9tZXRhZGF0YSBkZWxldGU6dXNlcnNfYXBwX21ldGFkYXRhIGNyZWF0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgcmVhZDp1c2VyX2N1c3RvbV9ibG9ja3MgY3JlYXRlOnVzZXJfY3VzdG9tX2Jsb2NrcyBkZWxldGU6dXNlcl9jdXN0b21fYmxvY2tzIGNyZWF0ZTp1c2VyX3RpY2tldHMgcmVhZDpjbGllbnRzIHVwZGF0ZTpjbGllbnRzIGRlbGV0ZTpjbGllbnRzIGNyZWF0ZTpjbGllbnRzIHJlYWQ6Y2xpZW50X2tleXMgdXBkYXRlOmNsaWVudF9rZXlzIGRlbGV0ZTpjbGllbnRfa2V5cyBjcmVhdGU6Y2xpZW50X2tleXMgcmVhZDpjb25uZWN0aW9ucyB1cGRhdGU6Y29ubmVjdGlvbnMgZGVsZXRlOmNvbm5lY3Rpb25zIGNyZWF0ZTpjb25uZWN0aW9ucyByZWFkOnJlc291cmNlX3NlcnZlcnMgdXBkYXRlOnJlc291cmNlX3NlcnZlcnMgZGVsZXRlOnJlc291cmNlX3NlcnZlcnMgY3JlYXRlOnJlc291cmNlX3NlcnZlcnMgcmVhZDpkZXZpY2VfY3JlZGVudGlhbHMgdXBkYXRlOmRldmljZV9jcmVkZW50aWFscyBkZWxldGU6ZGV2aWNlX2NyZWRlbnRpYWxzIGNyZWF0ZTpkZXZpY2VfY3JlZGVudGlhbHMgcmVhZDpydWxlcyB1cGRhdGU6cnVsZXMgZGVsZXRlOnJ1bGVzIGNyZWF0ZTpydWxlcyByZWFkOnJ1bGVzX2NvbmZpZ3MgdXBkYXRlOnJ1bGVzX2NvbmZpZ3MgZGVsZXRlOnJ1bGVzX2NvbmZpZ3MgcmVhZDpob29rcyB1cGRhdGU6aG9va3MgZGVsZXRlOmhvb2tzIGNyZWF0ZTpob29rcyByZWFkOmFjdGlvbnMgdXBkYXRlOmFjdGlvbnMgZGVsZXRlOmFjdGlvbnMgY3JlYXRlOmFjdGlvbnMgcmVhZDplbWFpbF9wcm92aWRlciB1cGRhdGU6ZW1haWxfcHJvdmlkZXIgZGVsZXRlOmVtYWlsX3Byb3ZpZGVyIGNyZWF0ZTplbWFpbF9wcm92aWRlciBibGFja2xpc3Q6dG9rZW5zIHJlYWQ6c3RhdHMgcmVhZDppbnNpZ2h0cyByZWFkOnRlbmFudF9zZXR0aW5ncyB1cGRhdGU6dGVuYW50X3NldHRpbmdzIHJlYWQ6bG9ncyByZWFkOmxvZ3NfdXNlcnMgcmVhZDpzaGllbGRzIGNyZWF0ZTpzaGllbGRzIHVwZGF0ZTpzaGllbGRzIGRlbGV0ZTpzaGllbGRzIHJlYWQ6YW5vbWFseV9ibG9ja3MgZGVsZXRlOmFub21hbHlfYmxvY2tzIHVwZGF0ZTp0cmlnZ2VycyByZWFkOnRyaWdnZXJzIHJlYWQ6Z3JhbnRzIGRlbGV0ZTpncmFudHMgcmVhZDpndWFyZGlhbl9mYWN0b3JzIHVwZGF0ZTpndWFyZGlhbl9mYWN0b3JzIHJlYWQ6Z3VhcmRpYW5fZW5yb2xsbWVudHMgZGVsZXRlOmd1YXJkaWFuX2Vucm9sbG1lbnRzIGNyZWF0ZTpndWFyZGlhbl9lbnJvbGxtZW50X3RpY2tldHMgcmVhZDp1c2VyX2lkcF90b2tlbnMgY3JlYXRlOnBhc3N3b3Jkc19jaGVja2luZ19qb2IgZGVsZXRlOnBhc3N3b3Jkc19jaGVja2luZ19qb2IgcmVhZDpjdXN0b21fZG9tYWlucyBkZWxldGU6Y3VzdG9tX2RvbWFpbnMgY3JlYXRlOmN1c3RvbV9kb21haW5zIHVwZGF0ZTpjdXN0b21fZG9tYWlucyByZWFkOmVtYWlsX3RlbXBsYXRlcyBjcmVhdGU6ZW1haWxfdGVtcGxhdGVzIHVwZGF0ZTplbWFpbF90ZW1wbGF0ZXMgcmVhZDptZmFfcG9saWNpZXMgdXBkYXRlOm1mYV9wb2xpY2llcyByZWFkOnJvbGVzIGNyZWF0ZTpyb2xlcyBkZWxldGU6cm9sZXMgdXBkYXRlOnJvbGVzIHJlYWQ6cHJvbXB0cyB1cGRhdGU6cHJvbXB0cyByZWFkOmJyYW5kaW5nIHVwZGF0ZTpicmFuZGluZyBkZWxldGU6YnJhbmRpbmcgcmVhZDpsb2dfc3RyZWFtcyBjcmVhdGU6bG9nX3N0cmVhbXMgZGVsZXRlOmxvZ19zdHJlYW1zIHVwZGF0ZTpsb2dfc3RyZWFtcyBjcmVhdGU6c2lnbmluZ19rZXlzIHJlYWQ6c2lnbmluZ19rZXlzIHVwZGF0ZTpzaWduaW5nX2tleXMgcmVhZDpsaW1pdHMgdXBkYXRlOmxpbWl0cyBjcmVhdGU6cm9sZV9tZW1iZXJzIHJlYWQ6cm9sZV9tZW1iZXJzIGRlbGV0ZTpyb2xlX21lbWJlcnMgcmVhZDplbnRpdGxlbWVudHMgcmVhZDphdHRhY2tfcHJvdGVjdGlvbiB1cGRhdGU6YXR0YWNrX3Byb3RlY3Rpb24gcmVhZDpvcmdhbml6YXRpb25zX3N1bW1hcnkgY3JlYXRlOmF1dGhlbnRpY2F0aW9uX21ldGhvZHMgcmVhZDphdXRoZW50aWNhdGlvbl9tZXRob2RzIHVwZGF0ZTphdXRoZW50aWNhdGlvbl9tZXRob2RzIGRlbGV0ZTphdXRoZW50aWNhdGlvbl9tZXRob2RzIHJlYWQ6b3JnYW5pemF0aW9ucyB1cGRhdGU6b3JnYW5pemF0aW9ucyBjcmVhdGU6b3JnYW5pemF0aW9ucyBkZWxldGU6b3JnYW5pemF0aW9ucyBjcmVhdGU6b3JnYW5pemF0aW9uX21lbWJlcnMgcmVhZDpvcmdhbml6YXRpb25fbWVtYmVycyBkZWxldGU6b3JnYW5pemF0aW9uX21lbWJlcnMgY3JlYXRlOm9yZ2FuaXphdGlvbl9jb25uZWN0aW9ucyByZWFkOm9yZ2FuaXphdGlvbl9jb25uZWN0aW9ucyB1cGRhdGU6b3JnYW5pemF0aW9uX2Nvbm5lY3Rpb25zIGRlbGV0ZTpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgY3JlYXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJfcm9sZXMgcmVhZDpvcmdhbml6YXRpb25fbWVtYmVyX3JvbGVzIGRlbGV0ZTpvcmdhbml6YXRpb25fbWVtYmVyX3JvbGVzIGNyZWF0ZTpvcmdhbml6YXRpb25faW52aXRhdGlvbnMgcmVhZDpvcmdhbml6YXRpb25faW52aXRhdGlvbnMgZGVsZXRlOm9yZ2FuaXphdGlvbl9pbnZpdGF0aW9ucyBkZWxldGU6cGhvbmVfcHJvdmlkZXJzIGNyZWF0ZTpwaG9uZV9wcm92aWRlcnMgcmVhZDpwaG9uZV9wcm92aWRlcnMgdXBkYXRlOnBob25lX3Byb3ZpZGVycyBkZWxldGU6cGhvbmVfdGVtcGxhdGVzIGNyZWF0ZTpwaG9uZV90ZW1wbGF0ZXMgcmVhZDpwaG9uZV90ZW1wbGF0ZXMgdXBkYXRlOnBob25lX3RlbXBsYXRlcyBjcmVhdGU6ZW5jcnlwdGlvbl9rZXlzIHJlYWQ6ZW5jcnlwdGlvbl9rZXlzIHVwZGF0ZTplbmNyeXB0aW9uX2tleXMgZGVsZXRlOmVuY3J5cHRpb25fa2V5cyByZWFkOmNsaWVudF9jcmVkZW50aWFscyBjcmVhdGU6Y2xpZW50X2NyZWRlbnRpYWxzIHVwZGF0ZTpjbGllbnRfY3JlZGVudGlhbHMgZGVsZXRlOmNsaWVudF9jcmVkZW50aWFscyIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyJ9.ZINqUGqev_8zygNwrP5mmSf23XT7MuV-Oux1el-8xzgmlxbYRtGAHSUcmeiiaYy6aTOzPmBv2jGmnD9xfGApa71kwTwHCRDjtaZqfmGA3LV9OnDtB7VDHdWLa1Il5iz7aT_jRdr0rSyAtEaUfkhzthorD5khQGJbMFISptqWrqC3JuhoOlMoFlqdF_kuEVx2bBt4AKZi8l2aCIqItLdBMFnxmtyOjb-wgLkeGK7alrRoatUQD8Vz3Xw_2Pb-v3oTFSXyv7ZlbViEeB_78Z3Bju00pLT5tNe2gi6HEeqTbKtN2kSWIZvikp4_5d0Sy31YKBF7n8Cql7fZe-DCk3IFNQ"
        },
      })
        .then(convertToJson => convertToJson.json())
        .then(getUserInfo => {
          console.log("User info: ");
          console.log(getUserInfo);
          var isBlocked = getUserInfo.blocked == true ? "Geblokkeerd" : "Toegang"
          console.log("Geautoriseerd: " + isBlocked);
        })
        .catch(error => {
          console.error("error" + error);
        })
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
        console.log("De token kan niet uit de database worden opgehaald: ", error);
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
            console.log(data);
            console.log(data[0].name);
            sessionStorage.setItem('role', data[0].name);
            this.role = data[0].name;
          })
      }
      catch (error) {
        console.log("Alle rollen van de gebruikers kunnen niet in OAuth worden opgehaald: ", error);
      }
    },
    loginAuth() {
      loginWithRedirect();

      // Leeg, want hij wordt toch overschreven in de mounted()
    },
    logoutAuth() {
      this.$auth0.logout({ logoutParams: { returnTo: 'https://wonderful-stone-0a33b7110.4.azurestaticapps.net' } })
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
            console.log(uitlogmoment);

          } else {
            response.json().then(data => {
              console.error('Er is een fout opgetreden bij het bijwerken van het uitlogmoment:', data);
            });
          }
        })
        .catch(error => {
          console.error('Er is een fout opgetreden bij het maken van het uitlogverzoek:', error);
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
 
  /* Voeg hier eventueel andere stijlen toe */
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