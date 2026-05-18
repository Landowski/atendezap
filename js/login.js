const email = document.getElementById('login-email');
const password = document.getElementById('login-password');

function toast(texto) {
    let divToast = document.createElement('div');
    divToast.innerHTML = `<div id="noti">${texto}</div>`;
    document.getElementsByTagName('body')[0].appendChild(divToast);
    var notifica = document.getElementById("noti");
    notifica.className = "show"; 
    setTimeout(function() {
        document.getElementsByTagName('body')[0].removeChild(divToast);
    }, 3500);
}

document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    firebase.auth().signInWithEmailAndPassword(email.value, password.value)
        .then(() => {
            const botaoLogin = document.getElementById('botaoLogin');
            botaoLogin.disabled = 'true';
            botaoLogin.innerHTML = '<img src="img/carregando.svg" width="18" height="18"/>'
            botaoLogin.style.cursor = 'auto';
            setTimeout(function() {
                window.location.href = 'app';
            }, 1500);
        })
        .catch((error) => {
        switch (error.code) {
            case "auth/internal-error":
                toast("E-MAIL OU SENHA INVÁLIDOS");
            break;
        }
    });
});

document.getElementById('textoEsqueci').addEventListener('click', () => {
    if (email.value === '') {
        toast("PREENCHA O EMAIL");
        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value)) {
        toast("INSIRA UM E-MAIL VÁLIDO");
        return;
    }

    firebase.auth().sendPasswordResetEmail(email.value)
    .then(() => {
        toast("RESET DE SENHA ENVIADO: " + email.value);
    })
    .catch((error) => {
        toast("ERRO NO ENVIO, TENTE NOVAMENTE");
    });
});

const toggle = document.getElementById('btnToggle')
toggle.addEventListener('click', mostraSenha);
function mostraSenha() {
    if (password.type === "password") {
        password.type = "text";
        toggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`
    } else {
        password.type = "password";
        toggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-.722-3.25"/><path d="M2 8a10.645 10.645 0 0 0 20 0"/><path d="m20 15-1.726-2.05"/><path d="m4 15 1.726-2.05"/><path d="m9 18 .722-3.25"/></svg>`
    }
}