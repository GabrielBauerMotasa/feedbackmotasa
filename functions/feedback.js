// functions/feedback.js
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI; // sua string de conexão MongoDB no Netlify env vars

// Definindo o schema (só na primeira execução, evitar recompilar)
const FeedbackSchema = new mongoose.Schema({
  rating: { type: Number, required: true },
  comment: { type: String, default: "" },
  ip_address: { type: String, default: "" },
  created_at: { type: Date, default: Date.now },
  empresa: { type: String, default: null }
});

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);

// Garantindo conexão singleton com MongoDB para evitar reconexões
let conn = null;
async function connectToDB() {
  if (conn && mongoose.connection.readyState === 1) {
    return conn;
  }
  conn = await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return conn;
}

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido, use POST' }),
    };
  }

  await connectToDB();

  try {
    const data = JSON.parse(event.body);
    const { rating, comment, empresa } = data;

    if (!rating) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Campo rating é obrigatório' }),
      };
    }

    const ip_address = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'IP não detectado';

    const feedback = new Feedback({
      rating,
      comment: comment || '',
      empresa: empresa || null,
      ip_address,
      created_at: new Date()
    });

    const savedFeedback = await feedback.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Feedback salvo com sucesso', data: savedFeedback }),
    };

  } catch (error) {
    console.error('Erro na função feedback:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro interno ao salvar feedback' }),
    };
  }
};
