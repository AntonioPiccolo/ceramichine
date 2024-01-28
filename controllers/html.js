const form = (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticket Form</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            display: flex;
            align-items: center;
            height: 100vh;
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
    </style>
</head>
<body>
    <div id="formID" style="display: block">
    <div style="text-align: center"><img src="${process.env.BASE_URL}/asset/logo" width="200" /></div>
    <h2 id="title">Convalida il tuo biglietto</h2>
    <h2 id="successTitle" style="display: none">Biglietto validato!</h2>
    <h1 id="smileTitle" style="display: none; text-align: center">:)</h1>
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

        <label for="ticket">Codice Biglietto:</label>
        <input name="ticket" required></input>

        <button type="button" onclick="submitForm()">Convalida</button>
    </form>
</div>
    <script>
        function submitForm() {
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
                    ticket: formData.get('ticket')
                })
            })
            .then(response => response.json())
            .then(data => {
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
                // Aggiungi qui il codice per gestire la risposta della richiesta POST
            })
            .catch((error) => {
                console.error('Error:', error);
                // Aggiungi qui il codice per gestire eventuali errori
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
};
