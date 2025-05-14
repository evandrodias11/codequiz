document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('signature-pad');
  const signaturePad = new SignaturePad(canvas);

  function redimensionarCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);
    signaturePad.clear();
  }

  window.addEventListener('resize', redimensionarCanvas);
  redimensionarCanvas();
    
    const supabaseUrl = 'https://rnuskrcczjsthtqeeggk.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudXNrcmNjempzdGh0cWVlZ2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1ODEsImV4cCI6MjA2MTQ0NDU4MX0.Owh2y8Jf204FpuUe6S5VTvoMxJn-08wYvWzL6pAp_nw';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
  
    const nomeInput = document.getElementById('nome');
    const cpfInput = document.getElementById('cpf');
    const btnConfirmar = document.getElementById('btnConfirmar');
  
    nomeInput.addEventListener('input', () => {
      nomeInput.value = nomeInput.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
      validarFormulario();
    });
    cpfInput.addEventListener('input', () => {
      const raw = cpfInput.value.replace(/\D/g, '');

      let masked = '';
      if (raw.length <= 3) {
        masked = raw;
      } else if (raw.length <= 6) {
        masked = `${raw.slice(0, 3)}.${raw.slice(3)}`;
      } else if (raw.length <= 9) {
        masked = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}`;
      } else {
        masked = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9, 11)}`;
      }

      cpfInput.value = masked;
      validarFormulario();
    });
    signaturePad.onEnd = validarFormulario;
  
    function validarFormulario() {
      const nomeValido = nomeInput.value.trim().length >= 3;
      const cpfValido = validarCPF(cpfInput.value);
      const assinaturaValida = !signaturePad.isEmpty();

      const erroCpf = document.getElementById('cpf-erro');
      if (!cpfValido && cpfInput.value.replace(/\D/g, '').length >= 11) {
        erroCpf.classList.remove('hidden');
      } else {
        erroCpf.classList.add('hidden');
      }

      btnConfirmar.disabled = !(nomeValido && cpfValido && assinaturaValida);
    }
  
    function limparAssinatura() {
      signaturePad.clear();
      validarFormulario();
    }
  
    async function confirmarCadastro() {
        try {
          const nome = nomeInput.value.trim();
          const cpf = cpfInput.value.trim();
      
          const assinaturaDataUrl = signaturePad.toDataURL('image/png');
          const blob = await (await fetch(assinaturaDataUrl)).blob();
          const fileName = `assinaturas/${cpf.replace(/\D/g, '')}_${Date.now()}.png`;
      
          const { error: uploadError } = await supabaseClient.storage.from('assinaturas').upload(fileName, blob, {
            contentType: 'image/png'
          });
      
          if (uploadError) {
            console.error(uploadError);
            exibirMensagem('Erro ao salvar assinatura. Verifique sua conexão e tente novamente.');
            return;
          }
      
          const assinaturaUrl = `${supabaseUrl}/storage/v1/object/public/assinaturas/${fileName}`;
      
          const { data, error: insertError } = await supabaseClient.from('participantes')
            .insert({ nome, cpf, assinatura_url: assinaturaUrl })
            .select()
            .single();
      
          if (insertError) {
            console.error(insertError);
            exibirMensagem('Erro ao salvar seus dados. Tente novamente.');
            return;
          }
      
          localStorage.setItem('id_participante', data.id);
          localStorage.setItem('nome_participante', nome);
      
          exibirMensagem('Cadastro realizado com sucesso! Vamos iniciar o quiz.', 'sucesso');
            setTimeout(() => {
              window.location.href = 'quiz.html';
            }, 1000);
        } catch (error) {
          console.error(error);
          alert('Ocorreu um erro inesperado. Tente novamente.');
        }
      }
  
    function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }

  let resto = 11 - (soma % 11);
  let digito1 = resto >= 10 ? 0 : resto;

  if (digito1 !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }

  resto = 11 - (soma % 11);
  let digito2 = resto >= 10 ? 0 : resto;

  return digito2 === parseInt(cpf.charAt(10));
}
  
    validarFormulario()

    function exibirMensagem(texto, tipo = 'erro') {
    const div = document.getElementById('mensagem');
    div.textContent = texto;
    div.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg font-medium max-w-md w-full text-center ${
      tipo === 'erro' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    }`;

    div.classList.remove('hidden');

    setTimeout(() => {
      div.classList.add('hidden');
    }, 4000);
}

    window.confirmarCadastro = confirmarCadastro;
    window.limparAssinatura = limparAssinatura;    
  });  