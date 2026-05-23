const campoEmail = document.getElementById('login-email');
const campoSenha = document.getElementById('login-password');
const campoConfirmaSenha = document.getElementById('login-password-repeat');
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
if (campoSenha.value !== campoConfirmaSenha.value) {
toast("AS SENHAS SÃO DIFERENTES");
return;
}
if (campoSenha.value.length < 8) {
toast("SENHA: MÍNIMO 8 CARACTERES");
return;
}
const db = firebase.firestore();
firebase.auth().createUserWithEmailAndPassword(campoEmail.value, campoSenha.value)
.then((credencialUsuario) => {
const botaoCadastro = document.getElementById('botaoCadastro');
botaoCadastro.innerHTML = '<img src="img/carregando.svg" width="18" height="18"/>';
botaoCadastro.disabled = true;
botaoCadastro.style.cursor = 'auto';
const usuario = credencialUsuario.user;
const usuarioRef = db.collection('usuarios').doc(usuario.uid);
const dadosUsuario = {
email: campoEmail.value,
assinante: false,
trialInicio: firebase.firestore.FieldValue.serverTimestamp(),
stripeCustomerId: null,
stripeSubscriptionId: null
};
return usuarioRef.set(dadosUsuario).then(() => {
return usuario;
});
})
.then(() => {
setTimeout(function() {
window.location.href = 'app';
}, 1500);
})
.catch((erro) => {
if (erro.code) {
switch (erro.code) {
case "auth/email-already-in-use":
toast("E-MAIL JÁ REGISTRADO");
break;
case "auth/invalid-email":
toast("E-MAIL INVÁLIDO");
break;
default:
toast("Erro de registro: " + erro.message);
}
}
});
});
const botaoToggle = document.getElementById('btnToggle');
botaoToggle.addEventListener('click', alternarSenha);
function alternarSenha() {
if (campoSenha.type === "password") {
campoSenha.type = "text";
campoConfirmaSenha.type = "text";
botaoToggle.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
<circle cx="12" cy="12" r="3"/>
</svg>`;
} else {
campoSenha.type = "password";
campoConfirmaSenha.type = "password";
botaoToggle.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="m15 18-.722-3.25"/>
<path d="M2 8a10.645 10.645 0 0 0 20 0"/>
<path d="m20 15-1.726-2.05"/>
<path d="m4 15 1.726-2.05"/>
<path d="m9 18 .722-3.25"/>
</svg>`;
}
}