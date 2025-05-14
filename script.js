document.addEventListener('DOMContentLoaded', () => {
    const signaturePad = new SignaturePad(document.getElementById('signature-pad'));
    
    const supabaseUrl = 'https://rnuskrcczjsthtqeeggk.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudXNrcmNjempzdGh0cWVlZ2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1ODEsImV4cCI6MjA2MTQ0NDU4MX0.Owh2y8Jf204FpuUe6S5VTvoMxJn-08wYvWzL6pAp_nw';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
  
    const nomeInput = document.getElementById('nome');
    const cpfInput = document.getElementById('cpf');
    const btnConfirmar = document.getElementById('btnConfirmar');
  
    nomeInput.addEventListener('input', validarFormulario);
    cpfInput.addEventListener('input', validarFormulario);
    signaturePad.onEnd = validarFormulario;
  
    function validarFormulario() {
      const nomeValido = nomeInput.value.trim() !== '';
      const cpfValido = validarCPF(cpfInput.value);
      const assinaturaValida = !signaturePad.isEmpty();
  
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
      
          if (!nome || !cpf || signaturePad.isEmpty()) {
            alert('Por favor, preencha todos os campos e assine.');
            return;
          }
      
          const assinaturaDataUrl = signaturePad.toDataURL('image/png');
          const blob = await (await fetch(assinaturaDataUrl)).blob();
          const fileName = `assinaturas/${cpf.replace(/\D/g, '')}_${Date.now()}.png`;
      
          const { error: uploadError } = await supabaseClient.storage.from('assinaturas').upload(fileName, blob, {
            contentType: 'image/png'
          });
      
          if (uploadError) {
            console.error(uploadError);
            alert('Erro ao salvar assinatura. Verifique sua conexão e tente novamente.');
            return;
          }
      
          const assinaturaUrl = `${supabaseUrl}/storage/v1/object/public/assinaturas/${fileName}`;
      
          // AQUI: inserindo e já retornando o ID do participante
          const { data, error: insertError } = await supabaseClient.from('participantes')
            .insert({ nome, cpf, assinatura_url: assinaturaUrl })
            .select()
            .single();
      
          if (insertError) {
            console.error(insertError);
            alert('Erro ao salvar seus dados. Tente novamente.');
            return;
          }
      
          // Salva o ID no navegador
          localStorage.setItem('id_participante', data.id);
      
          alert('Cadastro realizado com sucesso! Vamos iniciar o quiz.');
          window.location.href = 'quiz.html';
        } catch (error) {
          console.error(error);
          alert('Ocorreu um erro inesperado. Tente novamente.');
        }
      }
  
    function validarCPF(cpf) {
      cpf = cpf.replace(/\D/g, '');
      return cpf.length === 11;
    }
  
    validarFormulario()

    window.confirmarCadastro = confirmarCadastro;
    window.limparAssinatura = limparAssinatura;    
  });  