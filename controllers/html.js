const form = (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Convalida Biglietto</title>
    <style>
    body {
        font-family: 'Arial', sans-serif;
        background-color: #f5f5f5;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        text-align: center;
        padding: 5px;
    }

    h2 {
        color: #333;
        text-align: center;
        margin-bottom: 30px;
    }

    form {
        max-width: 400px;
        width: 100%;
        background-color: #fff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    label {
        display: block;
        margin-bottom: 8px;
        color: #555;
        font-size: 14px;
    }

    input,
    textarea {
        width: 100%;
        padding: 12px;
        margin-bottom: 16px;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
    }

    button {
        background-color: #4caf50;
        color: #fff;
        padding: 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.3s ease;
    }

    button:hover {
        background-color: #45a049;
    }

    /* Aggiunto per rendere il layout responsive */
    @media (max-width: 600px) {
        form {
            padding: 20px;
        }
    }
    </style>
</head>
<body>
    <div id="formID" style="display: block">
    <div style="text-align: center"><img src="${process.env.BASE_URL}/asset/logo" width="200" /></div>
    <h2 id="title">Convalida Biglietto</h2>
    <h2 id="successTitle" style="display: none">Biglietto validato, buon divertimento!</h2>
    <h1 id="smileTitle" style="display: none; text-align: center">:)</h1>
    <div style="display: flex; justify-content: center;">
        <form id="ticketForm">
            <label for="email">Email:</label>
            <input type="email" name="email" required>

            <label for="firstname">Nome:</label>
            <input type="text" name="firstname" required>

            <label for="lastname">Cognome:</label>
            <input type="text" name="lastname" required>

            <label for="city">Città:</label>
            <input type="text" name="city" required>

            <label for="phone">Cellulare:</label>
            <input type="phone" name="phone" required>

            <label for="instagram">Instagram:</label>
            <input type="instagram" name="instagram" required>

            <label for="foundUs">Come ci hai conosciuto:</label>
            <select name="foundUs" id="foundUs" style="margin-bottom: 10px;" required>
                <option value=" "> </option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Google">Google</option>
                <option value="Amici">Amici</option>
                <option value="Altro">Altro</option>
            </select>
            <input type="text" name="foundUsAltro" id="foundUsAltro" placeholder="Specifica Altro" style="display: none; margin-top: 10px;">

            <label for="ticket">Codice Biglietto:</label>
            <input name="ticket" required></input>

            <p style="font-size: 12px; color: #555; margin-bottom: 10px;">
                *Convalidando il biglietto acconsenti alla condivisione delle informazioni con Ceramichine.
            </p>
            <button id="validateBtn" type="button" onclick="submitForm()">Convalida</button>
        </form>
    </div>
</div>
    <script>
        document.getElementById('foundUs').addEventListener('change', function() {
            var altroField = document.getElementById('foundUsAltro');
            if (this.value === 'Altro') {
                altroField.style.display = 'block';
            } else {
                altroField.style.display = 'none';
            }
        });

        function submitForm() {
            document.getElementById('validateBtn').disabled = true;
            var form = document.getElementById('ticketForm');
            var formData = new FormData(form);

            var foundUsValue = formData.get('foundUs');
            if (foundUsValue === 'Altro') {
                foundUsValue = formData.get('foundUsAltro');
            }

            fetch('${process.env.BASE_URL}/api/ticket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.get('email'),
                    firstname: formData.get('firstname'),
                    lastname: formData.get('lastname'),
                    city: formData.get('city'),
                    phone: formData.get('phone'),
                    instagram: formData.get('instagram'),
                    ticket: formData.get('ticket'),
                    foundUs: foundUsValue
                })
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('validateBtn').disabled = false;
                console.log('Success:', data);
                if (data.status === 200) {
                    document.getElementById('ticketForm').style.display = 'none';
                    document.getElementById('title').style.display = 'none';
                    document.getElementById('successTitle').style.display = 'block';
                    document.getElementById('smileTitle').style.display = 'block';
                    document.body.style.justifyContent = 'center';
                } else {
                    alert(data.message);
                }
            })
            .catch((error) => {
                document.getElementById('validateBtn').disabled = false;
                console.error('Error:', error);
            });
        }
    </script>

</body>
</html>
`;
  res.set("Content-Type", "text/html");
  return res.status(200).send(html);
};

const giftcard = (req, res) => {
  const { event, where, when, informations } = req.query;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prenotazione Gift Card</title>
    <style>
    body {
        font-family: 'Arial', sans-serif;
        background-color: #f5f5f5;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        text-align: center;
        padding: 5px;
    }

    h2 {
        color: #333;
        text-align: center;
        margin-bottom: 30px;
    }

    form {
        max-width: 400px;
        width: 100%;
        background-color: #fff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    label {
        display: block;
        margin-bottom: 8px;
        color: #555;
        font-size: 14px;
    }

    input,
    textarea {
        width: 100%;
        padding: 12px;
        margin-bottom: 16px;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
    }

    button {
        background-color: #4caf50;
        color: #fff;
        padding: 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.3s ease;
    }

    button:hover {
        background-color: #45a049;
    }

    /* Aggiunto per rendere il layout responsive */
    @media (max-width: 600px) {
        form {
            padding: 20px;
        }
    }
    </style>
</head>
<body>
    <div id="formID" style="display: block">
    <div style="text-align: center"><img src="${process.env.BASE_URL}/asset/logo" width="200" /></div>
    <h2 id="title">Prenota Evento</h2>
    <h2 id="successTitle" style="display: none">Ti sei prenotato, a presto!</h2>
    <h1 id="smileTitle" style="display: none; text-align: center">:)</h1>
    <div id="info">Inserisci il codice biglietto ricevuto dopo l'acquisto della Gift Card per prenotarti all'evento.</div>
    <h4>${event}</h4>
    <div style="display: flex; justify-content: center;">
        <form id="ticketForm">
            <label for="email">Email:</label>
            <input name="email" required></input>

            <label for="ticket">Codice Biglietto:</label>
            <input name="ticket" required></input>
            <button id="validateBtn" type="button" onclick="submitForm()">Convalida</button>
        </form>
    </div>
</div>
    <script>
        function submitForm() {
            document.getElementById('validateBtn').disabled = true;
            var form = document.getElementById('ticketForm');
            var formData = new FormData(form);
            fetch('${process.env.BASE_URL}/api/giftcard', {
                method: 'POST',
                        headers: {
            'Content-Type': 'application/json'
        },
                body: JSON.stringify({
                    ticket: formData.get('ticket'),
                    email: formData.get('email'),
                    event: '${event}',
                    where: '${where}',
                    when: '${when}',
                    informations: '${informations}'
                })
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('validateBtn').disabled = false;
                console.log('Success:', data);
                if (data.status === 200) {
                    document.getElementById('ticketForm').style.display = 'none';
                    document.getElementById('title').style.display = 'none';
                    document.getElementById('info').style.display = 'none';
                    document.getElementById('successTitle').style.display = 'block';
                    document.getElementById('smileTitle').style.display = 'block';
                    document.body.style.justifyContent = 'center';
                } else {
                    alert(data.message);
                }
            })
            .catch((error) => {
                document.getElementById('validateBtn').disabled = false;
                console.error('Error:', error);
            });
        }
    </script>

</body>
</html>
`;
  res.set("Content-Type", "text/html");
  return res.status(200).send(html);
};

const generateEvent = (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generazione Evento</title>
    <style>
    body {
        font-family: 'Arial', sans-serif;
        background-color: #f5f5f5;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        text-align: center;
        padding: 5px;
    }

    h2 {
        color: #333;
        text-align: center;
        margin-bottom: 30px;
    }

    form {
        max-width: 400px;
        width: 100%;
        background-color: #fff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    label {
        display: block;
        margin-bottom: 8px;
        color: #555;
        font-size: 14px;
    }

    input,
    textarea {
        width: 100%;
        padding: 12px;
        margin-bottom: 16px;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
    }

    button {
        background-color: #4caf50;
        color: #fff;
        padding: 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.3s ease;
    }

    button:hover {
        background-color: #45a049;
    }

    .copied-message {
      color: green;
      font-weight: bold;
      display: none;
      margin-top: 10px;
    }

    /* Aggiunto per rendere il layout responsive */
    @media (max-width: 600px) {
        form {
            padding: 20px;
        }
    }
    </style>
</head>
<body>
    <div id="formID" style="display: block">
    <div style="text-align: center"><img src="${process.env.BASE_URL}/asset/logo" width="200" /></div>
    <h2 id="title">Generazione Link Giftcard</h2>
    <div id="formFields" style="display: flex; justify-content: center;">
        <form id="ticketForm">
            <label for="event">Nome Evento:</label>
            <input name="event" required></input>

            <label for="when">Quando:</label>
            <input name="when" required></input>

            <label for="where">Dove:</label>
            <input name="where" required></input>

            <button id="validateBtn" type="button" onclick="submitForm()">Conferma</button>
        </form>
    </div>
    <div id="success" style="word-break: break-word;"></div>
    <div id="finalDiv" style="display: none; margin-top: 10px;">
        <button onclick="copyLink()" id="copyBtn" style="margin-top: 10px">Copia il link</button>
        <p id="copied-message" class="copied-message">Link copiato!</p>
        <button onclick="reloadPage()" id="reloadPage" style="margin-top: 10px; background-color: #b85e32;">Gerera un'altro link</button>
    </div>
</div>
    <script>
        function reloadPage() {
            window.location.reload();
        }
        function copyLink() {
        // Il link che vuoi copiare
        const link = document.getElementById('success').innerText;

        // Crea un elemento di input temporaneo per copiare il testo
        const tempInput = document.createElement('input');
        tempInput.value = link;
        document.body.appendChild(tempInput);

        // Seleziona il testo e copia negli appunti
        tempInput.select();
        document.execCommand('copy');

        // Rimuove l'elemento temporaneo
        document.body.removeChild(tempInput);

        // Mostra un messaggio di conferma (opzionale)
        document.getElementById('copied-message').style.display = 'block';

        // Nascondi il messaggio dopo 2 secondi
        setTimeout(() => {
            document.getElementById('copied-message').style.display = 'none';
        }, 2000);
        }
        function submitForm() {
            document.getElementById('validateBtn').disabled = true;
            var form = document.getElementById('ticketForm');
            var formData = new FormData(form);
            fetch('${process.env.BASE_URL}/api/generateEvent', {
                method: 'POST',
                        headers: {
            'Content-Type': 'application/json'
        },
                body: JSON.stringify({
                    event: formData.get('event'),
                    where: formData.get('where'),
                    when: formData.get('when'),
                })
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('validateBtn').disabled = false;
                console.log('Success:', data);
                if (data.status === 200) {
                    document.getElementById('formFields').style.display = 'none';
                    document.getElementById('success').innerText = data.message;
                    document.getElementById('finalDiv').style.display = 'inline-grid';
                } else {
                    alert(data.message);
                }
            })
            .catch((error) => {
                document.getElementById('validateBtn').disabled = false;
                console.error('Error:', error);
            });
        }
    </script>

</body>
</html>
`;
  res.set("Content-Type", "text/html");
  return res.status(200).send(html);
};

module.exports = {
  form,
  giftcard,
  generateEvent,
};
