// quiz.js

document.addEventListener('DOMContentLoaded', async () => {

    const supabaseUrl = 'https://rnuskrcczjsthtqeeggk.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudXNrcmNjempzdGh0cWVlZ2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1ODEsImV4cCI6MjA2MTQ0NDU4MX0.Owh2y8Jf204FpuUe6S5VTvoMxJn-08wYvWzL6pAp_nw';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
  
    let questions = [];
  
    async function carregarQuestoes() {
      const response = await fetch('questions.json');
      questions = await response.json();
      showQuestion();
    }
  
    let currentQuestionIndex = 0;
    let score = 0;
  
    const questionEl = document.getElementById('question');
    const answersEl = document.getElementById('answers');
    const nextButton = document.getElementById('next-button');
    const resultEl = document.getElementById('result');
    const restartButton = document.getElementById('restart-button');

    // Novo: elemento do card de feedback
    const feedbackCard = document.createElement('div');
    feedbackCard.id = 'feedback-card';
    feedbackCard.className = 'mt-4 p-4 rounded-xl shadow-md text-white hidden';
    answersEl.after(feedbackCard);

    function showQuestion() {
      const currentQuestion = questions[currentQuestionIndex];

      questionEl.textContent = currentQuestion.question;
      answersEl.innerHTML = '';
      feedbackCard.classList.add('hidden');
      feedbackCard.innerHTML = '';

      currentQuestion.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.textContent = answer;
        button.className = 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg w-full';
        button.onclick = () => selectAnswer(index);
        answersEl.appendChild(button);
      });

      nextButton.classList.add('hidden');
    }

    function selectAnswer(selectedIndex) {
      const currentQuestion = questions[currentQuestionIndex];

      const isCorrect = selectedIndex === currentQuestion.correct;
      if (isCorrect) score++;

      feedbackCard.classList.remove('hidden');
      feedbackCard.className = `mt-4 p-4 rounded-xl shadow-md text-white ${
        isCorrect ? 'bg-green-500' : 'bg-red-500'
      }`;
      feedbackCard.innerHTML = `
        <p class="font-bold text-lg">${isCorrect ? '✅ Resposta Correta!' : '❌ Resposta Incorreta.'}</p>
        <p class="mt-2">${currentQuestion.explanation}</p>
      `;

      nextButton.classList.remove('hidden');

      // Desabilita os botões após a resposta
      Array.from(answersEl.children).forEach(button => {
        button.disabled = true;
        button.classList.add('opacity-50');
      });
    }
  
    nextButton.addEventListener('click', () => {
      currentQuestionIndex++;
  
      if (currentQuestionIndex < questions.length) {
        showQuestion();
      } else {
        showResult();
      }
    });
  
    async function showResult() {
      questionEl.classList.add('hidden');
      answersEl.classList.add('hidden');
      nextButton.classList.add('hidden');
      feedbackCard.classList.add('hidden');

      resultEl.classList.remove('hidden');
      resultEl.textContent = `🎉 Você acertou ${score} de ${questions.length} perguntas!`;

      restartButton.classList.remove('hidden');

      await salvarResultado();
    }
  
    async function salvarResultado() {
      const idParticipante = localStorage.getItem('id_participante');
      const nomeParticipante = localStorage.getItem('nome_participante');
  
      if (!idParticipante) {
        console.error('ID do participante não encontrado.');
        return;
      }
  
      const { error } = await supabaseClient.from('respostas_quiz').insert({
        id_participante: idParticipante,
        nome_participante: nomeParticipante,
        pontuacao: score
      });
  
      if (error) {
        console.error('Erro ao salvar pontuação do quiz:', error);
      } else {
        console.log('Pontuação salva com sucesso!');
        localStorage.removeItem('id_participante');
        localStorage.removeItem('nome_participante');
      }
    }
  
    restartButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
  
    // 🚀 Começar carregando as perguntas
    await carregarQuestoes();
  
  });  