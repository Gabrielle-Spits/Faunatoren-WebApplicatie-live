// Voegt het moment van inloggen in het document LoginGebruikers
export const addUserInLoginUsers = async (isIngelogd, isGelukt) => {
    const addUser = {
        emailadres: sessionStorage.getItem("username"),
        moment: new Date().toLocaleString("nl-NL").replace('T', ' ').replace('Z', ''),
        boolIngelogd: isIngelogd,
        boolOk: isGelukt
    };

    fetch("https://84.235.165.56:1880/post/LoginGebruikers", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(addUser)
    })
        .then(response => {
            if (response.status != 200) {
                console.error("Het loggen van de inloggen is mislukt functie addUserInLoginUsers");
            }
            else {
                console.log("Komt in de functie addUserInLoginUsers");
            }
        })
        .catch(error => {
            console.error("Er is een fout opgetreden bij het loggen van de ingelogde gebruiker: ", error);
        });
}

// Voegt een gebruikersactie in het document Gebruikersacties
export const addUserAction = async (activiteitType, schermnaam, origineleWaarde = null, nieuweWaarde = null, foutmelding = null) => {
    // Wordt alleen gelogd als een persoon is ingelogd
    if (sessionStorage.length > 0) {
        const addUserAction = {
            emailadres: sessionStorage.getItem("username"),
            inlogmoment: sessionStorage.getItem("inlogmoment"),
            moment: new Date().toLocaleString("nl-NL").replace('T', ' ').replace('Z', ''),
            activiteitType: activiteitType,
            origineleWaarde: origineleWaarde,
            nieuweWaarde: nieuweWaarde,
            foutmelding: foutmelding,
            schermnaam: schermnaam + ".vue"
        };

        fetch("https://84.235.165.56:1880/post/logGebruikersacties", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(addUserAction)
        })
        .then(response => {
            if (response.status != 200) {
                console.error("Het loggen van de gebruikersactie in de functie addUserAction is mislukt.");
            }
        })
        .catch(error => {
            console.error("Er is een fout opgetreden bij het loggen van de gebruikersactie addUserAction: ", error);
        });
    }
}

// Haalt alle gebruikersacties uit het document Gebruikersacties op
export const getUserLogEntries = async () => {
    try {
        const response = await fetch(`https://84.235.165.56:1880/get/gebruikersacties`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error('Fout bij ophalen gebruikersacties');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Haalt uit het document LoginGebuikers alle momenten wanneer in de applicatie is ingelogd op
export const getMomentInloggen = async () => {
    try {
        const response = await fetch(`https://84.235.165.56:1880/get/LoginGebruikers`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error('Fout bij ophalen inlogmomenten van de gebruikers');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
}