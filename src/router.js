import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/Home.vue';
import Login from './components/Login/Login.vue';
import Register from './components/Login/Register.vue';
import PasswordRecovery from './components/Login/PasswordRecovery.vue'
import dashBoard from './components/Dashboard/dashBoard.vue'
import Location from './components/Location/Location.vue'
import GebruikerLijst from './components/Admin/GebruikerLijst.vue'
import ArduinoLocation from './components/ArduinoUno/ArduinoLocation.vue'
// import Unauthorized from './components/Unauthorized/Unauthorized.vue'
import Loggen from './components/Loggen/ReadLoggen.vue'
import logGebruikerActies from './components/Loggen/logGebruikerActies.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/Login', component: Login },
    { path: '/Register', component: Register },
    { path: '/PasswordRecovery', component: PasswordRecovery },
    { path: '/dashBoard', component: dashBoard },
    { path: '/Location', component: Location },
    { path: '/GebruikerLijst', component: GebruikerLijst },
    { path: '/ArduinoLocation', component: ArduinoLocation },
    // { path: '/Unauthorized', component: Unauthorized },
    { path: '/Loggen', component: Loggen },
    { path: '/Loggen', component: logGebruikerActies }

  ]
});

export default router;
