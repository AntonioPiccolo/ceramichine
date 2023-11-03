const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Definisci l'endpoint POST /api/payment
app.post('/api/payment', (req, res) => {
    console.log(req.body)
  //const { amount, description } = req.body;

  // Qui puoi gestire la logica di pagamento
  // Ad esempio, puoi integrare Stripe o un gateway di pagamento.

  // Invia una risposta di esempio
  res.json({ message: 'Pagamento completato con successo' });
});

app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
