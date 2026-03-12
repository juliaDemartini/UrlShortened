// FUNÇÃO PARA CRIAR CONTA
async function registrar() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('senha').value;

    const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (response.ok) {
        alert("Conta criada com sucesso! Redirecionando para o login...");
        window.location.href = '/login';
    } else {
        const erro = await response.json();
        console.log(erro);
        alert("Erro ao cadastrar. A senha deve ter 6+ caracteres, 1 maiúscula, 1 número e 1 símbolo.");
    }
}

// FUNÇÃO PARA ENTRAR
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('senha').value;

    // useCookies=true faz o C# salvar um Cookie de segurança no seu navegador
    const response = await fetch('/auth/login?useCookies=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (response.ok) {
        // Se o login deu certo, vamos para a ferramenta real!
        window.location.href = "/app"; // <-- USE A ROTA AMIGÁVEL
    } else {
        alert("E-mail ou senha inválidos.");
    }
}