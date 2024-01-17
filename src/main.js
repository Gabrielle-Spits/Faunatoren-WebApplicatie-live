import { createApp } from 'vue';
import App from './App.vue';
import { createAuth0 } from '@auth0/auth0-vue';
import router from './router.js'; 

const app = createApp(App);

// Authorisatie OAUTH
app.use(
    createAuth0({
        domain: "dev-58uboumz4ybzna3t.us.auth0.com",
        clientId: "iromqmiW5oF2AvYS4sIabftEYEyFDY2z",
        authorizationParams: {
        redirect_uri: window.location.origin
    }
    })
);

// Zorgen dat de router moeglijk is
app.use(router);

/*
    Meerdere plugins aan het Vue project toevoegen -> via app.use()
    https://stackoverflow.com/questions/57256629/use-multiple-plugins-with-parameters-in-vuejs
*/

app.mount('#app');