const db = firebase.firestore();
const auth = firebase.auth();
document.addEventListener("DOMContentLoaded", () => {
function toast(texto) {
let divToast = document.createElement('div');
divToast.innerHTML = `<div id="noti">${texto}</div>`;
document.body.appendChild(divToast);
var notifica = document.getElementById("noti");
notifica.className = "show";
setTimeout(() => {
document.body.removeChild(divToast);
}, 3500);
}
auth.onAuthStateChanged(async user => {
if (!user) {
window.location.href = "entrar";
}
const userRef = db.collection("usuarios").doc(user.uid);
const userDoc = await userRef.get();
if (!userDoc.exists) {
window.location.href = "entrar";
}
const userData = userDoc.data();
const agora = new Date();
if (!userData.assinante) {
const trialInicio = userData.trialInicio?.toDate();
const diasPassados = Math.floor((agora - trialInicio) / (1000 * 60 * 60 * 24));
const diasRestantes = 15 - diasPassados;
if (diasRestantes <= 0) {
window.location.href = "assinatura";
}
mostrarBarraTrial(diasRestantes);
}
document.getElementById("wall").remove();
document.getElementById("email").innerText = user.email;
const pages = document.querySelectorAll(".page");
function showPage(id) {
pages.forEach(p => p.classList.remove("active"));
document.getElementById(id).classList.add("active");
}
function mostrarBarraTrial(dias) {
const barra = document.createElement("div");
barra.id = "trial-bar";
barra.style.cssText = `
width: 100%;
text-align: center;
padding: 8px;
font-size: 13px;
font-weight: 500;
background: ${dias <= 3 ? '#ef4444' : dias <= 7 ? '#f59e0b' : '#27d369'};
color: #fff;
`;
barra.innerHTML = `Seu trial termina em <strong>${dias} dia${dias !== 1 ? 's' : ''}</strong>. <a href="assinatura" style="color: #fff; text-decoration: underline; font-size: 15px;">Assinar agora</a>`;
document.body.prepend(barra);
}
const listaSitesEl = document.getElementById("listaSites");
const voltarHome = document.getElementById("voltarHome");
const siteDetalhes = document.getElementById("siteDetalhes");
const popup = document.getElementById("popupAdicionarSite");
const formSite = document.getElementById("formAdicionarSite");
const cancelarSite = document.getElementById("cancelarAdicionarSite");
const sitesBtn = document.getElementById("sitesBtn");
const ajudaBtn = document.getElementById("ajudaBtn");
const contaBtn = document.getElementById("contaBtn");
const sairBtn = document.getElementById("sair");
const userMenu = document.querySelector(".user-menu");
const dropdown = document.getElementById("userDropdown");
const formTrocaEmail = document.getElementById('formTrocaEmail');
const inputTrocaEmail = document.getElementById('inputTrocaEmail');
const solicitarTrocaEmail = document.getElementById('solicitarTrocaEmail');
const solicitarTrocaSenha = document.getElementById('solicitarTrocaSenha');
const gerenciarAssinatura = document.getElementById('gerenciarAssinatura');
if (sitesBtn) sitesBtn.addEventListener("click", () => showPage("home"));
if (ajudaBtn) ajudaBtn.addEventListener("click", () => showPage("ajuda"));
if (contaBtn) contaBtn.addEventListener("click", () => showPage("conta"));
if (voltarHome) voltarHome.addEventListener("click", () => showPage("home"));
userMenu.addEventListener("click", (event) => {
event.stopPropagation();
dropdown.classList.toggle("show");
});
document.addEventListener("click", (event) => {
const isClickInside = userMenu.contains(event.target);
if (!isClickInside) dropdown.classList.remove("show");
});
const mostraAssinatura = document.getElementById("mostraAssinatura");
userDoc.data().assinante ? mostraAssinatura.style.display = 'flex' : mostraAssinatura.style.display = 'none';
formTrocaEmail.addEventListener('submit', (e) => {
e.preventDefault();
const newEmail = inputTrocaEmail.value.trim();
user.verifyBeforeUpdateEmail(newEmail)
.then(() => {
inputTrocaEmail.value = '';
toast("E-MAIL DE VERIFICAÇÃO ENVIADO");
})
.catch((error) => {
if (error.code === 'auth/requires-recent-login') {
toast("SEGURANÇA: FAÇA LOGOUT E LOGIN NOVAMENTE");
} else if (error.code === 'auth/email-already-in-use') {
toast("ESTE E-MAIL JÁ ESTÁ SENDO USADO");
} else {
toast("ERRO NA SOLICITAÇÃO");
}
});
});
solicitarTrocaSenha.addEventListener('click', () => {
firebase.auth().sendPasswordResetEmail(user.email)
.then(() => {
toast("E-MAIL DE REDEFINIÇÃO DE SENHA ENVIADO");
})
.catch((error) => {
toast("Erro ao enviar:", error);
});
});
gerenciarAssinatura.addEventListener('click', () => {
const stripeUrl = `https://billing.stripe.com/p/login/test_4gwcPwafj78x9QA144?prefilled_email=${encodeURIComponent(user.email)}`;
window.open(stripeUrl, "_blank");
});
sairBtn.addEventListener("click", async () => {
await auth.signOut();
window.location.href = "entrar";
});
////////// SITES //////////
userRef.collection("sites").onSnapshot(snapshot => {
const sites = [];
snapshot.forEach(doc => {
const d = doc.data();
sites.push({ id: doc.id, ...d });
});
sites.sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt', { sensitivity: 'base' }));
renderSites(sites);
});
function renderSites(sites) {
listaSitesEl.innerHTML = "";
if (!sites || sites.length === 0) {
listaSitesEl.innerHTML = `
<div style="text-align: center; padding: 50px;">
<span style="color:#777; font-size: 20px; user-select: none;">Nada aqui ainda. Adicione seu primeiro site. <span style="font-size: 26px;">☝</span>
</div>`;
return;
}
sites.forEach(site => {
const card = document.createElement("div");
card.classList.add("websites-card");
card.innerHTML = `
<h3>${site.nome}</h3>
<div class="icone-container">
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/></svg> ${site.url || "- - -"}
</div>
<div class="icone-container">
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
${site.qtdAtendentes || 0} ${site.qtdAtendentes === 1 ? 'atendente' : 'atendentes'}
</div>
`;
card.addEventListener("click", () => abrirSite(site));
listaSitesEl.appendChild(card);
});
}
////////// ABRIR PÁGINA DO SITE //////////
let unsubAtts = null;
let unsubSiteDoc = null;
function abrirSite(site) {
const siteRef = userRef.collection("sites").doc(site.id);
showPage("siteView");
if (unsubAtts) { try { unsubAtts(); } catch(e){} unsubAtts = null; }
if (unsubSiteDoc) { try { unsubSiteDoc(); } catch(e){} unsubSiteDoc = null; }
const tooltipSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#636261" d="M21 12.22C21 6.73 16.74 3 12 3c-4.69 0-9 3.65-9 9.28c-.6.34-1 .98-1 1.72v2c0 1.1.9 2 2 2h1v-6.1c0-3.87 3.13-7 7-7s7 3.13 7 7V19h-8v2h8c1.1 0 2-.9 2-2v-1.22c.59-.31 1-.92 1-1.64v-2.3c0-.7-.41-1.31-1-1.62"/><circle cx="9" cy="13" r="1" fill="#636261"/><circle cx="15" cy="13" r="1" fill="#636261"/><path fill="#636261" d="M18 11.03A6.04 6.04 0 0 0 12.05 6c-3.03 0-6.29 2.51-6.03 6.45a8.07 8.07 0 0 0 4.86-5.89c1.31 2.63 4 4.44 7.12 4.47"/></svg>`;
const tooltipAtivo = site.tooltipAtivo ?? false;
const tooltipTexto = site.tooltipMensagem?.trim() || "Atendimento por WhatsApp";
const tooltipHTML = tooltipAtivo
? `<div id="tooltipDemo" class="atendezap-tooltip">${tooltipSvg}${tooltipTexto}</div>`
: `<div id="tooltipDemo" class="atendezap-tooltip" style="display: none!important"></div>`;
siteDetalhes.innerHTML = `
<div class="site-header">
<div class="icone-container">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 4v4"/><path d="M2 8h20"/><path d="M6 4v4"/></svg>
<h3>Site</h3>
</div>
</div>
<div class="site-name-card" id="site-header">
<div class="nome-numero">
<h2 id="siteTitulo">${site.nome}</h2>
<div class="url-container">
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/></svg>
<span id="siteURL" style="color: #777; line-height: 1;">${site.url || '- - -'}</span>
</div>
<div class="url-container cliques-totais">
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4.1 12 6"/><path d="m5.1 8-2.9-.8"/><path d="m6 12-1.9 2"/><path d="M7.2 2.2 8 5.1"/><path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"/></svg>
<span style="color: #777; line-height: 1;"><span id="statTotalCliques">0</span> cliques totais</span>
</div>
</div>
<div style="display:flex; gap:8px; margin-top:6px;">
<button id="btnEditarSite" class="botao-azul" title="Editar site">
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
</button>
<button id="btnExcluirSite" class="botao-vermelho" title="Excluir site">
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
</button>
</div>
</div>
<section style="margin-top: 60px;">
<div class="site-header">
<div class="icone-container">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16c.5-2 1.5-7 4-7 2 0 2 3 4 3 2.5 0 4.5-5 5-7"/></svg>
<h3>Métricas</h3>
</div>
</div>
<div class="botao-card">
<div class="codigo-card">
<div style="display: flex; align-items: center; justify-content: space-between; padding: 0 20px;">
<select id="filtroGrafico"">
<option value="hoje">Hoje</option>
<option value="7">Últimos 7 dias</option>
<option value="30">Últimos 30 dias</option>
</select>
<div style="display: flex; align-items: center; gap: 6px;color: #777; user-select: none;"><span id="totalPeriodo" style="font-weight: bold; font-size: 24px; color: #1daa61"></span> cliques no período</div>
</div>
<div style="height: 250px;">
<canvas id="meuGrafico"></canvas>
</div>
</div>
</div>
</section>
<section style="margin-top: 60px;">
<div class="site-header">
<div class=nome-numero">
<div class="icone-container">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/></svg><h3>Atendentes</h3>
</div>
<span class="subtexto">O botão irá redirecionar automaticamente para o atendente que estiver na vez.<span>
</div>
<div>
<button id="btnAdicionarAtendente" class="botao-verde" title="Cadastrar atendente">
Adicionar
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
</button>
</div>
</div>
<div id="listaAtendentesSite" class="sites-grid"></div>
</section>
<section style="margin-top: 60px;">
<div class="site-header">
<div class="nome-numero">
<div class="icone-container">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/></svg>
<h3>Mensagem no balão</h3>
</div>
<span class="subtexto">Liga ou desliga a mensagem personalizada. * Caso deixe vazia, será enviada uma mensagem padrão "Atendimento por WhatsApp".<span>
</div>
</div>
<div class="botao-card">
<div class="codigo-card">
<label class="toggle-switch">
<input type="checkbox" id="toggleTooltip" />
<span class="toggle-track"></span>
</label>
<input type="text" id="inputTooltip" placeholder="Mensagem customizada no balão" style="max-width: 400px" />
</div>
</div>
</section>
<section style="margin-top: 60px;">
<div class="site-header">
<div class=nome-numero">
<div class="icone-container">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/><path d="M7 11h10"/><path d="M7 15h6"/><path d="M7 7h8"/></svg>
<h3>Mensagem pré-preenchida</h3>
</div>
<span class="subtexto">Liga ou desliga a mensagem pré-preenchida a ser enviada ao atendente. * Caso deixe vazia, NÃO será enviada nenhuma mensagem.<span>
</div>
</div>
<div class="botao-card">
<div class="codigo-card">
<label class="toggle-switch">
<input type="checkbox" id="togglePrePreenchida" />
<span class="toggle-track"></span>
</label>
<textarea id="inputPrePreenchida" placeholder="Digite a mensagem que irá automaticamente ao abrir o WhatsApp do atendente" rows="10" style="max-width: 400px; resize: none;"></textarea>
</div>
</div>
</section>
<section style="margin-top: 60px;">
<div class="site-header">
<div class=nome-numero">
<div class="icone-container">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/></svg>
<h3>Cores</h3>
</div>
<span class="subtexto">Escolha a cor de fundo, cor quando o mouse passar por cima e a cor do ícone.<span>
</div>
<button id="btnResetCores" class="botao-verde">Resetar Cores</button>
</div>
<div class="botao-card">
<div style="display: flex; justify-content: space-between; align-items: center;">
<div class="suporte-texto">
<label>Cor de Fundo</label>
<input type="color" id="corFundo" style="padding: 5px;">
</div>
<div class="suporte-texto">
<label>Cor do Ícone</label>
<input type="color" id="corIcone" style="padding: 5px;">
</div>
</div>
</div>
</section>
<section style="margin-top: 60px;">
<div class="site-header">
<div class=nome-numero">
<div class="icone-container">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10 9-3 3 3 3"/><path d="m14 15 3-3-3-3"/><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/></svg>
<h3>Alinhamento</h3>
</div>
<span class="subtexto">Define em qual lado o botão aparece na página.<span>
</div>
</div>
<div class="botao-card">
<div id="posicaoWidget">
<label>
<input type="radio" name="widgetPos" value="left">Esquerda
</label>
<label>
<input type="radio" name="widgetPos" value="right" checked>Direita
</label>
</div>
<div class="atendezap-demo">
${tooltipHTML}
<div class="atendezap-button" id="atendezapDemo">
<svg viewBox="0 0 31 30" height="26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30.3139 14.3245C30.174 10.4932 28.5594 6.864 25.8073 4.1948C23.0552 1.52559 19.3784 0.0227244 15.5446 4.10118e-06H15.4722C12.8904 -0.00191309 10.3527 0.668375 8.10857 1.94491C5.86449 3.22145 3.99142 5.06026 2.67367 7.28039C1.35592 9.50053 0.6389 12.0255 0.593155 14.6068C0.547411 17.1882 1.17452 19.737 2.41278 22.0024L1.09794 29.8703C1.0958 29.8865 1.09712 29.9029 1.10182 29.9185C1.10651 29.9341 1.11448 29.9485 1.12518 29.9607C1.13588 29.973 1.14907 29.9828 1.16387 29.9896C1.17867 29.9964 1.19475 29.9999 1.21103 30H1.23365L9.01561 28.269C11.0263 29.2344 13.2282 29.7353 15.4586 29.7346C15.6004 29.7346 15.7421 29.7346 15.8838 29.7346C17.8458 29.6786 19.7773 29.2346 21.5667 28.4282C23.3562 27.6218 24.9682 26.469 26.3098 25.0363C27.6514 23.6036 28.696 21.9194 29.3832 20.0809C30.0704 18.2423 30.3867 16.2859 30.3139 14.3245ZM15.8099 27.1487C15.6923 27.1487 15.5747 27.1487 15.4586 27.1487C13.4874 27.1511 11.5444 26.6795 9.79366 25.7735L9.39559 25.5654L4.11815 26.8124L5.09221 21.4732L4.86604 21.0902C3.78579 19.2484 3.20393 17.157 3.17778 15.0219C3.15163 12.8869 3.68208 10.7819 4.71689 8.91419C5.75171 7.0465 7.25518 5.48059 9.07924 4.37067C10.9033 3.26076 12.985 2.64514 15.1194 2.58444C15.238 2.58444 15.3571 2.58444 15.4767 2.58444C18.6992 2.59399 21.7889 3.86908 24.0802 6.13498C26.3715 8.40087 27.681 11.4762 27.7265 14.6984C27.7719 17.9205 26.5498 21.0316 24.3234 23.3612C22.0969 25.6909 19.0444 27.0527 15.8235 27.1532L15.8099 27.1487Z" fill="currentColor"></path><path d="M10.2894 7.69007C10.1057 7.69366 9.92456 7.73407 9.75673 7.80892C9.5889 7.88377 9.43779 7.99154 9.31236 8.12584C8.95801 8.48923 7.96736 9.36377 7.91006 11.2003C7.85277 13.0369 9.13594 14.8538 9.31537 15.1086C9.49481 15.3635 11.7686 19.3306 15.5141 20.9395C17.7156 21.8879 18.6806 22.0507 19.3063 22.0507C19.5642 22.0507 19.7587 22.0236 19.9622 22.0115C20.6483 21.9693 22.1969 21.1762 22.5346 20.3137C22.8724 19.4512 22.895 18.6973 22.806 18.5465C22.7171 18.3957 22.4728 18.2872 22.1049 18.0942C21.737 17.9012 19.9321 16.9361 19.5928 16.8004C19.467 16.7419 19.3316 16.7066 19.1932 16.6964C19.1031 16.7011 19.0155 16.7278 18.938 16.774C18.8605 16.8203 18.7954 16.8847 18.7484 16.9618C18.4469 17.3372 17.7548 18.153 17.5225 18.3882C17.4718 18.4466 17.4093 18.4938 17.3392 18.5265C17.2691 18.5592 17.1928 18.5768 17.1154 18.5782C16.9728 18.5719 16.8333 18.5344 16.7068 18.4681C15.6135 18.0038 14.6167 17.339 13.768 16.5079C12.975 15.7263 12.3022 14.8315 11.7716 13.8526C11.5666 13.4726 11.7716 13.2766 11.9586 13.0987C12.1456 12.9208 12.3461 12.675 12.5391 12.4624C12.6975 12.2808 12.8295 12.0777 12.9312 11.8593C12.9838 11.7578 13.0104 11.6449 13.0085 11.5307C13.0067 11.4165 12.9765 11.3045 12.9206 11.2048C12.8317 11.0149 12.1667 9.14664 11.8546 8.39725C11.6013 7.75642 11.2997 7.73531 11.0358 7.7157C10.8187 7.70062 10.5699 7.69309 10.3211 7.68555H10.2894" fill="currentColor"></path></svg>
</div>
</div>
</div>
</section>
<section style="margin-top: 60px;">
<div class="site-header">
<div class="nome-numero">
<div class="icone-container">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="10" height="6" x="7" y="9" rx="2"/><path d="M22 20H2"/><path d="M22 4H2"/></svg>
<h3>Posicionamento</h3>
</div>
<span class="subtexto">Escolha a distância (em pixels) de baixo e da lateral da tela onde o botão deve aparecer.<span>
</div>
</div>
<div class="botao-card">
<div style="display: flex; justify-content: space-between; align-items: center;">
<div class="suporte-texto">
<label>Distância Fundo</label>
<input type="number" id="inputBottom" min="0" style="width: 80px;">
</div>
<div class="suporte-texto">
<label>Distância Lateral</label>
<input type="number" id="inputSide" min="0" style="width: 80px;">
</div>
</div>
</div>
</section>
<section style="margin-top: 60px;">
<div class="site-header">
<div class="nome-numero">
<div class="icone-container">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="1"/><path d="M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0"/></svg>
<h3>Mostrar</h3>
</div>
<span class="subtexto">Escolha em quais dispositivos o botão deve aparecer.<span>
</div>
</div>
<div class="botao-card">
<div class="codigo-card">
<select id="selectDispositivo">
<option value="ambos">Todos</option>
<option value="mobile">Somente celular, tablet, etc</option>
<option value="desktop">Somente computador</option>
</select>
</div>
</div>
</section>
<section style="margin-top: 60px;">
<div class="site-header">
<div class="nome-numero">
<div class="icone-container">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></svg>
<h3>Código</h3>
</div>
<span class="subtexto">Copie e cole este código logo antes de &lt;/body&gt; do seu site.<span>
</div>
</div>
<div class="botao-card">
<div class="codigo-card">
<span id="code"></span>
<div class="editar-excluir">
<button class="botao-copiar" title="Copiar código">
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
</button>
<button class="botao-duvida" title="Dúvida">
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
</button>
</div>
</div>
</div>
</section>
`;
////////// CORES //////////
const corFundoInput = document.getElementById('corFundo');
const corIconeInput = document.getElementById('corIcone');
const btnResetCores = document.getElementById('btnResetCores');
const demoBtn = document.getElementById('atendezapDemo');
const PADRAO = { fundo: "#27d369", icone: "#ffffff" };
const aplicarCoresDemo = (f, i) => {
demoBtn.style.backgroundColor = f;
demoBtn.style.color = i;
demoBtn.style.setProperty('--fundo-widget', f);
};
corFundoInput.value = site.corFundo || PADRAO.fundo;
corIconeInput.value = site.corIcone || PADRAO.icone;
aplicarCoresDemo(corFundoInput.value, corIconeInput.value);
[corFundoInput, corIconeInput].forEach(el => {
el.addEventListener('input', () => {
aplicarCoresDemo(corFundoInput.value, corIconeInput.value);
});
});
[corFundoInput, corIconeInput].forEach(el => {
el.addEventListener('change', () => {
siteRef.update({
corFundo: corFundoInput.value,
corIcone: corIconeInput.value
}).catch(err => console.error("Erro ao salvar cores:", err));
toast("COR SALVA")
});
});
btnResetCores.onclick = () => {
corFundoInput.value = PADRAO.fundo;
corIconeInput.value = PADRAO.icone;
aplicarCoresDemo(PADRAO.fundo, PADRAO.icone);
siteRef.update({ corFundo: PADRAO.fundo, corIcone: PADRAO.icone });
};
////////// GRÁFICO //////////
let chartInstance = null;
async function renderizarGrafico(filtro) {
const ctx = document.getElementById('meuGrafico').getContext('2d');
const spanTotal = document.getElementById('totalPeriodo');
if (chartInstance) chartInstance.destroy();
const agora = new Date();
let dataInicio, labels, contagemPorData;
if (filtro === 'hoje') {
dataInicio = new Date(agora);
dataInicio.setHours(0, 0, 0, 0);
labels = [];
contagemPorData = {};
const horaAtual = agora.getHours();
for (let h = 0; h <= horaAtual; h++) {
const label = h.toString().padStart(2, '0') + ':00';
labels.push(label);
contagemPorData[label] = 0;
}
const snap = await siteRef.collection("cliques")
.where("data", ">=", dataInicio)
.orderBy("data", "asc")
.get();
let total = 0;
snap.forEach(doc => {
const dataDoc = doc.data().data?.toDate();
if (dataDoc) {
const label = dataDoc.getHours().toString().padStart(2, '0') + ':00';
if (contagemPorData[label] !== undefined) {
contagemPorData[label]++;
total++;
}
}
});
spanTotal.textContent = total;
} else {
const dias = parseInt(filtro);
dataInicio = new Date(agora);
dataInicio.setDate(dataInicio.getDate() - (dias - 1));
dataInicio.setHours(0, 0, 0, 0);
labels = [];
contagemPorData = {};
for (let i = 0; i < dias; i++) {
const d = new Date(dataInicio);
d.setDate(d.getDate() + i);
const strData = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
labels.push(strData);
contagemPorData[strData] = 0;
}
const snap = await siteRef.collection("cliques")
.where("data", ">=", dataInicio)
.orderBy("data", "asc")
.get();
let total = 0;
snap.forEach(doc => {
const dataDoc = doc.data().data?.toDate();
if (dataDoc) {
const strData = dataDoc.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
if (contagemPorData[strData] !== undefined) {
contagemPorData[strData]++;
total++;
}
}
});
spanTotal.textContent = total;
}
chartInstance = new Chart(ctx, {
type: 'line',
data: {
labels,
datasets: [{
label: 'Cliques',
data: labels.map(l => contagemPorData[l]),
borderColor: '#1daa61',
backgroundColor: '#10b77f1a',
fill: true,
tension: 0.4
}]
},
options: {
responsive: true,
maintainAspectRatio: false,
plugins: { legend: { display: false } },
scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
}
});
}
document.getElementById('filtroGrafico').addEventListener('change', (e) => {
renderizarGrafico(e.target.value);
});
////////// CÓDIGO DE INCORPORAÇÃO DO WIDGET //////////
const codigoWidget = `
&lt;script src="js/atendezap-botao.js" data-site-id="${site.id}"&gt;&lt;/script&gt;`;
const codeBlock = document.getElementById("code");
codeBlock.innerHTML = codigoWidget;
const botaoCopiar = document.querySelector(".botao-copiar");
botaoCopiar.addEventListener("click", async () => {
try {
await navigator.clipboard.writeText(codeBlock.textContent.trim());
toast("CÓDIGO COPIADO!");
} catch (err) {
console.error("Erro ao copiar código:", err);
toast("Erro ao copiar código.");
}
});
const botaoDuvida = document.querySelector(".botao-duvida");
const fecharDuvida = document.getElementById("fecharDuvida");
botaoDuvida.addEventListener("click", async () => {
document.getElementById("duvida").style.display = "flex"
});
fecharDuvida.addEventListener("click", async () => {
document.getElementById("duvida").style.display = "none"
});
////////// ALINHAMENTO E DISPOSITIVOS //////////
const radios = document.querySelectorAll('input[name="widgetPos"]');
const demo = document.querySelector('.atendezap-demo');
const selectDispositivo = document.getElementById("selectDispositivo");
const inputBottom = document.getElementById("inputBottom");
const inputSide = document.getElementById("inputSide");
siteRef.get().then(doc => {
const dados = doc.data();
const posicao = dados?.direita ?? true;
demo.classList.remove('left', 'right');
demo.classList.add(posicao ? 'right' : 'left');
demo.classList.add('show-anim');
document.querySelector(`input[value="${posicao ? 'right' : 'left'}"]`).checked = true;
inputBottom.value = dados?.bottomOffset ?? 20;
inputSide.value = dados?.sideOffset ?? 20;
selectDispositivo.value = dados?.mostrarEm || "ambos";
renderizarGrafico('hoje');
});
radios.forEach(radio => {
radio.addEventListener('change', async (e) => {
const valor = e.target.value === 'right';
demo.classList.remove('left', 'right');
try {
await siteRef.update({ direita: valor });
demo.classList.add(valor ? 'right' : 'left');
demo.classList.add('show-anim');
toast(`ALTERADO PARA ${valor ? 'DIREITA' : 'ESQUERDA'}`);
} catch (err) {
console.error(err);
toast("ERRO AO SALVAR POSIÇÃO");
}
});
});
inputBottom.addEventListener("blur", async () => {
const valor = parseInt(inputBottom.value) || 0;
try {
await siteRef.update({ bottomOffset: valor });
toast("DISTÂNCIA DO FUNDO SALVA");
} catch (err) {
console.error(err);
toast("ERRO AO SALVAR DISTÂNCIA");
}
});
inputSide.addEventListener("blur", async () => {
const valor = parseInt(inputSide.value) || 0;
try {
await siteRef.update({ sideOffset: valor });
toast("DISTÂNCIA LATERAL SALVA");
} catch (err) {
console.error(err);
toast("ERRO AO SALVAR DISTÂNCIA");
}
});
selectDispositivo.addEventListener("change", async () => {
const novoValor = selectDispositivo.value;
try {
await siteRef.update({
mostrarEm: novoValor
});
toast("PREFERÊNCIA DE EXIBIÇÃO ATUALIZADA");
} catch (err) {
console.error("Erro ao atualizar dispositivo:", err);
toast("ERRO AO SALVAR PREFERÊNCIA");
}
});
////////// TOOLTIP //////////
const toggleTooltip = document.getElementById("toggleTooltip");
const inputTooltip = document.getElementById("inputTooltip");
const tooltipDemo = document.getElementById('tooltipDemo');
siteRef.get().then(doc => {
const dados = doc.data();
toggleTooltip.checked = dados?.tooltipAtivo ?? false;
inputTooltip.value = dados?.tooltipMensagem || "";
inputTooltip.disabled = !toggleTooltip.checked;
});
toggleTooltip.addEventListener("change", async () => {
const ativo = toggleTooltip.checked;
inputTooltip.disabled = !ativo;
try {
await siteRef.update({ tooltipAtivo: ativo });
toast(ativo ? "BALÃO ATIVADO" : "BALÃO DESATIVADO");
tooltipDemo.innerHTML = tooltipSvg + inputTooltip.value;
tooltipDemo.style.display = ativo ? "flex" : "none";
} catch (err) {
toast("ERRO AO SALVAR");
}
});
inputTooltip.addEventListener("blur", async () => {
try {
await siteRef.update({ tooltipMensagem: inputTooltip.value.trim()});
toast("MENSAGEM DO BALÃO SALVA");
tooltipDemo.innerHTML = inputTooltip.value ? tooltipSvg + inputTooltip.value : tooltipSvg + "Atendimento por WhatsApp";
} catch (err) {
toast("ERRO AO SALVAR");
}
});
////////// MENSAGEM PRÉ-PREENCHIDA //////////
const togglePrePreenchida = document.getElementById("togglePrePreenchida");
const inputPrePreenchida = document.getElementById("inputPrePreenchida");
siteRef.get().then(doc => {
const dados = doc.data();
togglePrePreenchida.checked = dados?.prePreenchidaAtiva ?? false;
inputPrePreenchida.value = dados?.prePreenchidaMensagem || "";
inputPrePreenchida.disabled = !togglePrePreenchida.checked;
});
togglePrePreenchida.addEventListener("change", async () => {
const ativo = togglePrePreenchida.checked;
inputPrePreenchida.disabled = !ativo;
try {
await siteRef.update({ prePreenchidaAtiva: ativo });
toast(ativo ? "MENSAGEM PRÉ-PREENCHIDA ATIVADA" : "MENSAGEM PRÉ-PREENCHIDA DESATIVADA");
} catch (err) {
toast("ERRO AO SALVAR");
}
});
inputPrePreenchida.addEventListener("blur", async () => {
try {
await siteRef.update({ prePreenchidaMensagem: inputPrePreenchida.value.trim() });
toast("MENSAGEM PRÉ-PREENCHIDA SALVA");
} catch (err) {
toast("ERRO AO SALVAR");
}
});
////////// CONFIGURAÇÕES DO SITE //////////
const btnAdicionarAtendente = document.getElementById("btnAdicionarAtendente");
const listaAtendentesSite = document.getElementById("listaAtendentesSite");
const btnEditarSite = document.getElementById("btnEditarSite");
const btnExcluirSite = document.getElementById("btnExcluirSite");
const siteTituloEl = document.getElementById("siteTitulo");
const siteURLEl = document.getElementById("siteURL");
const statTotalCliquesEl = document.getElementById("statTotalCliques");
unsubSiteDoc = siteRef.onSnapshot(doc => {
if (!doc.exists) return;
const data = doc.data();
siteTituloEl.innerText = data.nome || "(sem nome)";
siteURLEl.innerText = data.url || "- - -";
statTotalCliquesEl.innerText = data.totalCliques || 0;
});
unsubAtts = siteRef.collection("atendentes").onSnapshot(snapshot => {
const arr = [];
snapshot.forEach(doc => {
const d = doc.data();
arr.push({ id: doc.id, ...d });
});
arr.sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt', { sensitivity: 'base' }));
renderListaAtendentes(arr);
siteRef.update({ qtdAtendentes: arr.length }).catch(()=>{});
});
function renderListaAtendentes(atendentes) {
listaAtendentesSite.innerHTML = "";
if (!atendentes || atendentes.length === 0) {
listaAtendentesSite.innerHTML = `<div class="atendentes-card" style="color: #777;">Nenhum atendente cadastrado para este site.</div>`;
return;
}
atendentes.forEach(a => {
let textoDias = "Não definido";
let textoHorario = "Não definido";
if (a.disponibilidade) {
const d = a.disponibilidade.dias || [];
const nomesDias = { 1: "SEG", 2: "TER", 3: "QUA", 4: "QUI", 5: "SEX", 6: "SÁB", 0: "DOM" };
const diasOrdenados = [...d].sort((x, y) => x - y);
const diasString = diasOrdenados.join(",");
if (d.length === 7) {
textoDias = "SEMANA INTEIRA";
} else if (diasString === "1,2,3,4,5") {
textoDias = "SEGUNDA À SEXTA";
} else if (diasString === "1,2,3,4,5,6") {
textoDias = "SEGUNDA À SÁBADO";
} else {
textoDias = diasOrdenados.map(n => nomesDias[n]).join(", ");
}
if (a.disponibilidade.inicio && a.disponibilidade.fim) {
textoHorario = `Das ${a.disponibilidade.inicio} às ${a.disponibilidade.fim}`;
}
}
const div = document.createElement("div");
div.className = "atendentes-card";
div.innerHTML = `
<div class="nome-numero">
<div class="nome-card">${a.nome}</div>
<div class="texto-card">${formatarTelefone(a.numero)}</div>
</div>
<div class="texto-card">${a.totalCliques || 0} atendimentos</div>
<div class="nome-numero">
<div class="dias-horario-card"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg> ${textoDias}</div>
<div class="dias-horario-card"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> ${textoHorario}</div>
</div>
<div class="editar-excluir">
<button class="botao-azul" data-action="editar" data-id="${a.id}" title="Editar atendente">
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
</button>
<button class="botao-vermelho" data-action="excluir" data-id="${a.id}" title="Excluir atendente">
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
</button>
</div>
`;
listaAtendentesSite.appendChild(div);
});
listaAtendentesSite.querySelectorAll("[data-action]").forEach(btn => {
btn.addEventListener("click", (ev) => {
const action = btn.getAttribute("data-action");
const id = btn.getAttribute("data-id");
if (action === "editar") abrirModalAtendente(siteRef, id);
if (action === "excluir") confirmarExcluirAtendente(siteRef, id);
});
});
}
btnEditarSite.addEventListener("click", () => {
const currentNome = siteTituloEl.innerText;
const currentURL = siteURLEl.innerText === "- - -" ? "" : siteURLEl.innerText;
const inputNome = document.createElement("input");
inputNome.value = currentNome;
inputNome.style.width = "40%";
const inputURL = document.createElement("input");
inputURL.value = currentURL;
inputURL.style.width = "60%";
const header = siteDetalhes.querySelector("#site-header");
const urlContainer = siteDetalhes.querySelector(".url-container");
const cliquesTotais = siteDetalhes.querySelector(".cliques-totais");
header.style.display = "none";
urlContainer.style.display = "none";
cliquesTotais.style.display = "none";
const editContainer = document.createElement("div");
editContainer.className = "edit-container";
editContainer.appendChild(inputNome);
editContainer.appendChild(inputURL);
const salvarBtn = document.createElement("button");
salvarBtn.className = "botao-verde";
salvarBtn.textContent = "Salvar";
editContainer.appendChild(salvarBtn);
const cancelarBtn = document.createElement("button");
cancelarBtn.className = "botao-cancelar";
cancelarBtn.textContent = "Cancelar";
editContainer.appendChild(cancelarBtn);
header.parentNode.insertBefore(editContainer, header.nextSibling);
async function restaurarLayout() {
editContainer.remove();
header.style.display = "";
urlContainer.style.display = "";
cliquesTotais.style.display = ""
}
salvarBtn.addEventListener("click", async () => {
const novoNome = inputNome.value.trim();
const novoURL = inputURL.value.trim();
if (!novoNome) { toast("INSIRA O NOME DO SITE"); return; }
try {
await siteRef.update({
nome: novoNome,
url: novoURL,
atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
});
toast("SITE ATUALIZADO");
restaurarLayout();
} catch (err) {
console.error(err);
toast("Erro ao atualizar site.");
}
});
cancelarBtn.addEventListener("click", () => {
restaurarLayout();
});
});
btnExcluirSite.addEventListener("click", async () => {
const confirma = confirm("Excluir o site removerá também os atendentes vinculados. Deseja prosseguir?");
if (!confirma) return;
try {
const atSnap = await siteRef.collection("atendentes").get();
const batch = db.batch();
atSnap.forEach(doc => batch.delete(doc.ref));
batch.delete(siteRef);
await batch.commit();
await db.collection("publicSites").doc(siteRef.id).delete().catch(() => {});
toast("SITE EXCLUÍDO");
showPage("home");
} catch (err) {
console.error("Erro ao excluir site:", err);
toast("Erro ao excluir site.");
}
});
btnAdicionarAtendente.addEventListener("click", () => abrirModalAtendente(siteRef, null));
async function confirmarExcluirAtendente(siteRefLocal, atendenteId) {
const confirma = confirm("Remover atendente deste site?");
if (!confirma) return;
try {
await siteRefLocal.collection("atendentes").doc(atendenteId).delete();
toast("ATENDENTE REMOVIDO");
} catch (err) {
console.error(err);
toast("Erro ao remover atendente.");
}
}
function abrirModalAtendente(siteRefLocal, atendenteId = null) {
const modal = document.createElement("div");
modal.className = "popup";
modal.style.display = "flex";
modal.innerHTML = `
<div class="popup-conteudo">
<h2>${atendenteId ? "Editar atendente" : "Novo atendente"}</h2>
<form id="formModalAtendente">
<label>Nome</label>
<input type="text" id="modalNome" required style="margin-bottom: 15px;" placeholder="Nome do atendente" />
<label>Número (com DDD)</label>
<input type="text" id="modalNumero" required style="margin-bottom: 15px;" placeholder="Exemplo: 41991234567" />
<label>Dias de Atendimento</label>
<div class="checkboxes-container">
<label class="checkboxes-dias"><input type="checkbox" class="checkbox" name="dia" value="1" checked> Seg</label>
<label class="checkboxes-dias"><input type="checkbox" class="checkbox" name="dia" value="2" checked> Ter</label>
<label class="checkboxes-dias"><input type="checkbox" class="checkbox" name="dia" value="3" checked> Qua</label>
<label class="checkboxes-dias"><input type="checkbox" class="checkbox" name="dia" value="4" checked> Qui</label>
<label class="checkboxes-dias"><input type="checkbox" class="checkbox" name="dia" value="5" checked> Sex</label>
<label class="checkboxes-dias"><input type="checkbox" class="checkbox" name="dia" value="6"> Sáb</label>
<label class="checkboxes-dias"><input type="checkbox" class="checkbox" name="dia" value="0"> Dom</label>
</div>
<label>Horário de Atendimento</label>
<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 25px;">
<div style="flex: 1;">
<span style="font-size: 12px; color: #777;">Das</span>
<input type="time" id="modalInicio" value="08:00" style="width: 100%;" required />
</div>
<div style="flex: 1;">
<span style="font-size: 12px; color: #777;">Até às</span>
<input type="time" id="modalFim" value="18:00" style="width: 100%;" required />
</div>
</div>
<div class="popup-botoes">
<button type="submit" class="botao-verde">${atendenteId ? "Salvar" : "Cadastrar"}</button>
<button type="button" id="modalCancelar" class="botao-cancelar">Cancelar</button>
</div>
</form>
</div>
`;
document.body.appendChild(modal);
const form = modal.querySelector("#formModalAtendente");
const inputNome = modal.querySelector("#modalNome");
const inputNum = modal.querySelector("#modalNumero");
const dias = modal.querySelectorAll('input[name="dia"]')
const modalInicio = modal.querySelector("#modalInicio");
const modalFim = modal.querySelector("#modalFim");
const btnCancelar = modal.querySelector("#modalCancelar");
if (atendenteId) {
dias.forEach(cb => cb.checked = false);
modalInicio.value = "";
modalFim.value = "";
siteRefLocal.collection("atendentes").doc(atendenteId).get().then(doc => {
if (doc.exists) {
const d = doc.data();
inputNome.value = d.nome || "";
inputNum.value = d.numero || "";
if (d.disponibilidade) {
modalInicio.value = d.disponibilidade.inicio || "08:00";
modalFim.value = d.disponibilidade.fim || "18:00";
const diasSalvos = d.disponibilidade.dias || [];
dias.forEach(cb => {
cb.checked = diasSalvos.includes(parseInt(cb.value));
});
}
}
}).catch(()=>{});
} else {
const diasPadrao = [1, 2, 3, 4, 5];
dias.forEach(cb => {
cb.checked = diasPadrao.includes(parseInt(cb.value));
});
modalInicio.value = "08:00";
modalFim.value = "18:00";
}
setTimeout(function() {
inputNum.addEventListener('input', handleInput, false)
function handleInput (e) {
e.target.value = phoneMask(e.target.value)
}
function phoneMask (phone) {
return phone.replace(/\D/g, '')
.replace(/^(\d)/, '($1')
.replace(/^(\(\d{2})(\d)/, '$1) $2')
.replace(/(\d{5})(\d{1,5})/, '$1-$2')
.replace(/(-\d{4})\d+?$/, '$1');
}
}, 500)
if (atendenteId) {
siteRefLocal.collection("atendentes").doc(atendenteId).get().then(doc => {
if (doc.exists) {
const d = doc.data();
inputNome.value = d.nome || "";
inputNum.value = d.numero || "";
if (d.disponibilidade) {
modalInicio.value = d.disponibilidade.inicio || "08:00";
modalFim.value = d.disponibilidade.fim || "18:00";
const diasSalvos = d.disponibilidade.dias || [];
dias.forEach(cb => {
cb.checked = diasSalvos.includes(parseInt(cb.value));
});
}
}
}).catch(()=>{});
}
btnCancelar.addEventListener("click", () => {
modal.remove();
});
form.addEventListener("submit", async (e) => {
e.preventDefault();
const nome = inputNome.value.trim();
const numero = inputNum.value.trim();
const horaInicio = document.getElementById("modalInicio").value;
const horaFim = document.getElementById("modalFim").value;
const diasSelecionados = Array.from(modal.querySelectorAll('input[name="dia"]:checked')).map(cb => parseInt(cb.value));
if (!nome || !numero) { toast("PREENCHA O NOME E O NÚMERO"); return; }
if (diasSelecionados.length === 0) { toast("SELECIONE AO MENOS UM DIA"); return; }
const numeroLimpo = numero.replace(/\D/g, '');
if (numeroLimpo.length !== 11) {
toast("SÃO NECESSÁRIOS 11 DÍGITOS");
return;
}
const disponibilidade = {
dias: diasSelecionados,
inicio: horaInicio,
fim: horaFim
};
try {
if (atendenteId) {
await siteRefLocal.collection("atendentes").doc(atendenteId).update({
nome,
numero: numeroLimpo,
disponibilidade,
atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
});
toast("ATENDENTE ATUALIZADO");
} else {
await siteRefLocal.collection("atendentes").add({
nome,
numero: numeroLimpo,
disponibilidade,
totalCliques: 0,
});
toast("ATENDENTE CADASTRADO");
}
modal.remove();
} catch (err) {
console.error(err);
toast("Erro ao salvar atendente.");
}
});
}
}
////////// POPUP ADICIONAR SITE //////////
const addSiteBtns = [document.getElementById("addSiteBtn")];
addSiteBtns.forEach(btn => { if (btn) btn.addEventListener("click", () => abrirPopup()); });
function abrirPopup() {
popup.style.display = "flex";
document.getElementById("siteNomeInput").focus();
}
cancelarSite.addEventListener("click", () => {
popup.style.display = "none";
formSite.reset();
});
formSite.addEventListener("submit", async e => {
e.preventDefault();
const nome = document.getElementById("siteNomeInput").value.trim();
const url = document.getElementById("siteURLInput").value.trim();
if (!nome) {
toast("DIGITE O NOME DO SITE");
return;
}
try {
const novoSiteRef = await userRef.collection("sites").add({
nome,
url,
indiceAtual: 0,
totalCliques: 0,
qtdAtendentes: 0,
direita: true,
tooltipAtivo: true,
tooltipMensagem: 'Atendimento por WhatsApp',
prePreenchidaAtiva: false,
prePreenchidaMensagem: '',
mostrarEm: 'ambos',
corFundo: '#27d369',
corIcone: '#ffffff',
bottomOffset: 20,
sideOffset: 20,
});
await db.collection("publicSites").doc(novoSiteRef.id).set({
usuarioId: user.uid
});
toast("SITE ADICIONADO");
formSite.reset();
popup.style.display = "none";
} catch (err) {
console.error("Erro ao salvar site:", err);
toast("Erro ao salvar site");
}
});
function formatarTelefone(numero) {
if (!numero) return "";
const soNumeros = numero.replace(/\D/g, '');
if (soNumeros.length < 10) return numero;
return soNumeros.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
}
});
});