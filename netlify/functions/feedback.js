const mongoose = require("mongoose");
const Feedback = require("./models/Feedback");


const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    // Já conectado
    return;
  }

  try {
    await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@feedbacks-db.rlflddv.mongodb.net/?retryWrites=true&w=majority`);
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    throw error;
  }
};

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método não permitido, use POST" }),
    };
  }

  try {
    await connectToDatabase();

    const { rating, comment, empresa } = JSON.parse(event.body);

    const ipAddress = event.headers["x-forwarded-for"] || event.headers["client-ip"] || "unknown";
    const now = new Date();
    const brNow = new Date(now.getTime() - 3 * 60 * 60 * 1000); // Ajuste horário Brasil

    const feedback = await Feedback.create({
      rating,
      comment,
      ip_address: ipAddress,
      created_at: brNow,
      empresa: empresa || null,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Feedback enviado com sucesso", data: feedback }),
    };
  } catch (error) {
    console.error("Erro na função feedback:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro interno no servidor" }),
    };
  }
};
