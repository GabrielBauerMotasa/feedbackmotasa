document.addEventListener("DOMContentLoaded", function () {
    const stars = document.querySelectorAll(".rating-box label");

    stars.forEach(star => {
        star.addEventListener("click", function () {
            // Você pode manter esse listener para efeitos visuais, se quiser
        });
    });

    const submitBtn = document.querySelector(".submit-btn");
    const loadingElement = document.querySelector(".loading-spinner");
    const messageElement = document.querySelector(".feedback-message"); // <-- Definido fora do escopo da função

    submitBtn.addEventListener("click", async function () {
        const ratingInput = document.querySelector("input[name='rating']:checked");
        const feedbackText = document.querySelector(".feedback-text").value.trim();
        const empresaInput = document.querySelector(".empresa-nome").value.trim();

        if (!ratingInput) {
            messageElement.textContent = "Por favor, selecione pelo menos uma estrela!";
            messageElement.style.color = "red";
            messageElement.style.display = "block";

            setTimeout(() => {
                messageElement.style.display = "none";
            }, 3000);

            return;

        }

        const feedback = {
            rating: parseInt(ratingInput.value),
            comment: feedbackText,
            empresa: empresaInput
        };

        messageElement.style.display = "none"; // Limpa mensagens anteriores
        loadingElement.style.display = "inline-block";
        submitBtn.style.display = "none";

        try {
            const response = await fetch("https://feedbackmotasa.netlify.app/.netlify/functions/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(feedback)
            });

            const result = await response.json();

            if (response.ok) {
                loadingElement.style.display = "none";
                messageElement.textContent = "Feedback enviado com sucesso!";
                messageElement.style.color = "green";
                messageElement.style.display = "block";

                document.querySelector(".feedback-text").value = "";
                document.querySelector(".empresa-nome").value = "";
                document.querySelectorAll("input[name='rating']").forEach(radio => radio.checked = false);

                setTimeout(() => {
                    submitBtn.style.display = "inline-block";
                    messageElement.style.display = "none";
                }, 3000);
            } else {
                loadingElement.style.display = "none";
                messageElement.textContent = "Erro ao enviar feedback: " + result.error;
                messageElement.style.color = "red";
                messageElement.style.display = "block";

                setTimeout(() => {
                    submitBtn.style.display = "inline-block";
                }, 3000);
            }
        } catch (error) {
            console.error("Erro ao enviar feedback:", error);
            loadingElement.style.display = "none";
            messageElement.textContent = "Erro ao enviar feedback.";
            messageElement.style.color = "red";
            messageElement.style.display = "block";

            setTimeout(() => {
                submitBtn.style.display = "inline-block";
                messageElement.style.display = "none";
            }, 3000);
        }
    });
});
