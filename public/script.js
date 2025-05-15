document.addEventListener("DOMContentLoaded", function () {
    const stars = document.querySelectorAll(".rating-box label");

    stars.forEach(star => {
        star.addEventListener("click", function () {
            // Você pode manter esse listener para efeitos visuais, se quiser
        });
    });

    document.querySelector(".submit-btn").addEventListener("click", async function () {
        const ratingInput = document.querySelector("input[name='rating']:checked");
        const feedbackText = document.querySelector(".feedback-text").value.trim();
        const empresaInput = document.querySelector(".empresa-nome").value.trim();

        if (!ratingInput) {
            alert("Por favor, selecione uma avaliação.");
            return;
        }

        const feedback = {
            rating: parseInt(ratingInput.value),
            comment: feedbackText,
            empresa: empresaInput
        };

        // Exibe a bolinha de carregamento
        const loadingElement = document.querySelector(".loading-spinner");
        const submitBtn = document.querySelector(".submit-btn");
        loadingElement.style.display = "inline-block";
        submitBtn.style.display = "none"; // Esconde o botão de enviar feedback

        const messageElement = document.querySelector(".feedback-message"); // Elemento para exibir a mensagem
        messageElement.style.display = "none"; // Limpa qualquer mensagem anterior

        try {
            const response = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(feedback)
            });

            const result = await response.json();

            if (response.ok) {
                // Substitui a bolinha de carregamento pela mensagem de sucesso
                loadingElement.style.display = "none"; // Esconde a bolinha de carregamento
                messageElement.textContent = "Feedback enviado com sucesso!";
                messageElement.style.color = "green";
                messageElement.style.display = "block";

                // Limpa os campos e as estrelas
                document.querySelector(".feedback-text").value = ""; // Limpa o campo de texto
                document.querySelector(".empresa-nome").value = ""; // Limpa o campo da empresa

                // Remove a seleção das estrelas
                const ratingRadios = document.querySelectorAll("input[name='rating']");
                ratingRadios.forEach(radio => radio.checked = false);

                // Exibe novamente o botão de enviar feedback após 2 segundos
                setTimeout(function () {
                    submitBtn.style.display = "inline-block"; // Volta a exibir o botão de envio
                    messageElement.style.display = "none"; // Esconde a mensagem de sucesso
                }, 2000);
            } else {
                // Substitui a bolinha de carregamento pela mensagem de erro
                loadingElement.style.display = "none";
                messageElement.textContent = "Erro ao enviar feedback: " + result.error;
                messageElement.style.color = "red";
                messageElement.style.display = "block";

                // Exibe novamente o botão de enviar feedback após 2 segundos
                setTimeout(function () {
                    submitBtn.style.display = "inline-block"; // Volta a exibir o botão de envio
                }, 2000);
            }
        } catch (error) {
            console.error("Erro ao enviar feedback:", error);
            // Substitui a bolinha de carregamento pela mensagem de erro
            loadingElement.style.display = "none";
            messageElement.textContent = "Erro ao enviar feedback.";
            messageElement.style.color = "red";
            messageElement.style.display = "block";

            // Exibe novamente o botão de enviar feedback após 2 segundos
            setTimeout(function () {
                submitBtn.style.display = "inline-block"; // Volta a exibir o botão de envio
            }, 2000);
        }
    });
});
