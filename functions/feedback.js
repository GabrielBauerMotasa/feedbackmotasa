const mongoose = require('mongoose');

let conn = null;

// Define o schema do feedback
const FeedbackSchema = new mongoose.Schema({
  rating: { type: Number, required: true },
  comment: { type: String, default: '' },
  ip_address: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
  empresa: { type: String, default: null }
});

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);

const connectToDatabase = async () => {
  if (conn == null) {
    conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  return conn;
};

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    await connectToDatabase();

    const data = JSON.parse(event.body);

    const ip_address = event.headers['client-ip'] || event.headers['x-forwarded-for'] || '';

    const feedback = new Feedback({
      rating: data.rating,
      comment: data.comment || '',
      empresa: data.empresa || null,
      ip_address,
      created_at: new Date(),
    });

    const savedFeedback = await feedback.save();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Feedback enviado com sucesso',
        data: savedFeedback,
      }),
    };

  } catch (error) {
    console.error('Erro ao salvar feedback:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao salvar feedback' }),
    };
  }
};
