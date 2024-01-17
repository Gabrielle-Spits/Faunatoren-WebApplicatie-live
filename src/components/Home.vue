<!-- hier heeft iedereen toegang tot pas op met loggen eerst rol ophalen -->
<script>
import dashBoard from './Dashboard/dashBoard.vue';
import Voorspelling from './Voorspelling/Voorspelling.vue';
import { addUserAction } from './LoggingFunctions/LoggingDatabaseFunctions.js';

export default {
    name: 'Home',
    components: {
        dashBoard,
        Voorspelling
    },
    data() {
        return {
        role: sessionStorage.getItem('role'),
        };
    },
    methods: {
        actionOpenPageInLoggingDatabase(){
            if (sessionStorage.getItem('role') == 'admin'){
                addUserAction("Opent het scherm", this.$options.name, String.empty, String.empty, "Met het oude inlogsysteem ingelogd");
            }
            else{
                addUserAction("Opent het scherm", this.$options.name);
            }
        },
    },
    mounted(){
        this.actionOpenPageInLoggingDatabase();
    }
}

</script>
<template>
    <div v-if="role == 'admin'">
    <p>u bent op dit moment ingelogd met het oude systeem mocht u meer willen doen dan verzoeken wij u om in de navbar via oauth in te loggen</p>
    </div>
    <dashBoard></dashBoard>
    <Voorspelling></Voorspelling>
</template>
<style> .chart-algemeen {
     width: 500px;
 }

 h1 {
     color: #0d4128;
     text-align: center;
 }

 h2 {
     color: #0d4128;
 }
</style>