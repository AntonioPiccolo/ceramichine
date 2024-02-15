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
                    ticket: formData.get('ticket')
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

module.exports = {
  form,
  giftcard,
};
