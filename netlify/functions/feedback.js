const connectToDatabase = require('../../db');
const Feedback = require('./models/Feedback');
require('dotenv').config();

let dbConnected = false;

const allowedOrigins = [
  'https://feedbackmotasa.netlify.app',
  'https://feedbackmotasa1.netlify.app',
];

exports.handler = async function(event, context) {
  // Conectar ao banco só uma vez
  if (!dbConnected) {
    await connectToDatabase();
    dbConnected = true;
  }

  const origin = event.headers.origin || '';

  // Define os headers CORS, permitindo apenas origens autorizadas
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Responder preflight OPTIONS para CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { rating, comment, empresa } = JSON.parse(event.body);
    const ipAddress = event.headers['x-forwarded-for'] || event.headers['client-ip'] || '';

    const now = new Date();
    const brNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    const feedback = await Feedback.create({
      rating,
      comment,
      ip_address: ipAddress,
      created_at: brNow,
      empresa: empresa || null,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Feedback enviado com sucesso', data: feedback }),
    };
  } catch (error) {
    console.error('Erro ao salvar feedback:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao salvar feedback' }),
    };
  }
};
