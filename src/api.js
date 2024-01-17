
import axios from 'axios';

export async function fetchData(apiUrl) {
  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error('Fout bij het ophalen van gegevens:', error);
    throw error; // Gooi de fout door zodat deze buiten de functie kan worden afgehandeld
  }
}

export async function fetchLocationOptions() {
  return fetchData('http://84.235.165.56:1880/get/uno');
}
