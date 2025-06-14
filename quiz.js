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

    const feedbackCard = document.createElement('div');
    feedbackCard.id = 'feedback-card';
    feedbackCard.className = 'mt-4 p-4 rounded-xl shadow-md text-white hidden';
    answersEl.after(feedbackCard);

    function showQuestion() {
      document.getElementById('progresso').textContent = `Pergunta ${currentQuestionIndex + 1} de ${questions.length}`;
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
      document.getElementById('progresso').classList.add('hidden');
      document.querySelector('h1')?.classList.add('hidden');

      resultEl.classList.remove('hidden');

      const total = questions.length;
      const percentual = (score / total) * 100;
      let mensagem = '';

      if (percentual === 100) {
        mensagem = 'Incrível! Você acertou todas as perguntas! Obrigado por responder o quiz!';
      } else if (percentual >= 70) {
        mensagem = 'Muito bom! Você foi muito bem! Obrigado por responder o quiz!';
      } else if (percentual >= 40) {
        mensagem = 'Bom esforço! Obrigado por responder o quiz!';
      } else {
        mensagem = 'Obrigado por responder o quiz!';
      }

      resultEl.innerHTML = `
        <p class="text-2xl text-blue-600 font-bold mb-4">🎉 Você acertou ${score} de ${total} perguntas!</p>
        <p class="text-lg text-gray-700">${mensagem}</p>
      `;

      // Mostrar explicações extras
      const explicacoesEl = document.getElementById('explicacoes');
      explicacoesEl.classList.remove('hidden');
      explicacoesEl.innerHTML = `
        <h2 class="text-xl font-semibold mb-4 text-gray-800">📚 Revisão das Perguntas</h2>
        <div class="space-y-4">
          ${questions.map((q, index) => `
            <div class="p-4 bg-gray-100 rounded-xl shadow">
              <p class="font-semibold text-gray-700 mb-1">Pergunta ${index + 1}: ${q.question}</p>
              <p class="text-green-600"><strong>✔ Resposta Correta:</strong> ${q.answers[q.correct]}</p>
              <p class="text-gray-600 mt-1">${q.explanation}</p>
            </div>
          `).join('')}
        </div>
      `;

      // Recursos extras
      const linksExtras = `
        <div class="mt-8">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">🌐 Quer aprender mais?</h2>
          <ul class="space-y-2">
            <li>
              <a href="https://www.youtube.com/playlist?list=PLHz_AreHm4dkZ9-atkcmcBaMZdmLHft8n" target="_blank"
                class="text-blue-600 hover:underline font-medium transition-colors">
                ▶ Curso de Lógica de Programação (Gustavo Guanabara)
              </a>
            </li>
            <li>
              <a href="https://scratch.mit.edu/" target="_blank"
                class="text-blue-600 hover:underline font-medium transition-colors">
                🐱 Programação Visual com Scratch
              </a>
            </li>
          </ul>
        </div>
      `;
      explicacoesEl.innerHTML += linksExtras;

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
        window.location.href = 'cadastro.html';
    });
  
    await carregarQuestoes();
  
  });  