<template>
   <main>
    <h1>hoi</h1>
     <Navbar/>
   </main>
 </template>
 
 <script>
 import Navbar from './components/Navbar.vue';
 import Home from './components/Home.vue';
 export default {
   name: 'App',
   components: {
     Navbar,
     Home,
   },
   data() {
    return {
      email: sessionStorage.getItem('email'),
      role: sessionStorage.getItem('role'),
    };
  }
 };
 </script>
 
 <style>
 /* Voeg je aangepaste CSS-stijlen hier toe */
 body {
   padding: 16px;
   margin-top: 30px;
   background-color: #DFECBC;
 }
 </style>
 