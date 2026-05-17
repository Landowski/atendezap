(function loadFirebaseSDK() {
  if (window.firebase) return;
  const script = document.createElement("script");
  script.src = "https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js";
  script.onload = () => {
    const script2 = document.createElement("script");
    script2.src = "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js";
    document.head.appendChild(script2);
  };
  document.head.appendChild(script);
})();
async function waitForFirebase() {
  while (typeof firebase === "undefined" || !firebase.firestore) {
    await new Promise(res => setTimeout(res, 50));
  }
}
(async () => {
  await waitForFirebase();
  const firebaseConfig = {
    apiKey: "AIzaSyDlizjnuvEDrh8KgSNFNmmxs1YZwhlhXa0",
    authDomain: "atendezap-4f47a.firebaseapp.com",
    projectId: "atendezap-4f47a",
    storageBucket: "atendezap-4f47a.firebasestorage.app",
    messagingSenderId: "599752043505",
    appId: "1:599752043505:web:c4f2191bf676dcb15d7250"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  function estaDisponivel(atendente) {
    if (!atendente.disponibilidade) return true;
    const agora = new Date();
    const diaAtual = agora.getDay();
    const horaAtual = agora.getHours().toString().padStart(2, '0') + ":" + agora.getMinutes().toString().padStart(2, '0');
    const { dias, inicio, fim } = atendente.disponibilidade;
    return dias.includes(diaAtual) && horaAtual >= inicio && horaAtual <= fim;
  }
  let scriptTag = document.currentScript || null;
  if (!scriptTag) {
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      const s = scripts[i];
      const src = s.getAttribute('src') || '';
      const hasData = s.getAttribute('data-site-id');
      if (hasData && src.indexOf('atendezap-widget.js') !== -1) {
        scriptTag = s;
        break;
      }
    }
  }
  if (!scriptTag) {
    scriptTag = document.querySelector('script[data-site-id]');
  }
  if (!scriptTag) {
    console.error("AtendeZap: não foi possível localizar a tag <script> com data-site-id. Verifique se você incluiu: <script src=\".../atendezap-widget.js\" data-site-id=\"SEU_ID\"></script>");
    return;
  }
  const siteId = scriptTag.getAttribute("data-site-id");
  if (!siteId) {
    console.error("⚠️ AtendeZap: 'data-site-id' não encontrado.");
    return;
  }
  let siteRef = null;
  try {
    const pubDoc = await db.collection("publicSites").doc(siteId).get();
    if (!pubDoc.exists) return;
    const usuarioId = pubDoc.data().usuarioId;
    siteRef = db.collection("usuarios").doc(usuarioId).collection("sites").doc(siteId);
    const siteSnap = await siteRef.get();
    if (!siteSnap.exists) return;
    const siteData = siteSnap.data();
    const cFundo = siteData.corFundo || "#27d369";
    const cIcone = siteData.corIcone || "#ffffff";
    const widget = document.createElement("div");
    widget.className = "atendezap-widget";
    const tooltipSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#636261" d="M21 12.22C21 6.73 16.74 3 12 3c-4.69 0-9 3.65-9 9.28c-.6.34-1 .98-1 1.72v2c0 1.1.9 2 2 2h1v-6.1c0-3.87 3.13-7 7-7s7 3.13 7 7V19h-8v2h8c1.1 0 2-.9 2-2v-1.22c.59-.31 1-.92 1-1.64v-2.3c0-.7-.41-1.31-1-1.62"/><circle cx="9" cy="13" r="1" fill="#636261"/><circle cx="15" cy="13" r="1" fill="#636261"/><path fill="#636261" d="M18 11.03A6.04 6.04 0 0 0 12.05 6c-3.03 0-6.29 2.51-6.03 6.45a8.07 8.07 0 0 0 4.86-5.89c1.31 2.63 4 4.44 7.12 4.47"/></svg>`;
    const tooltipAtivo = siteData.tooltipAtivo ?? false;
    const tooltipTexto = siteData.tooltipMensagem?.trim() || "Atendimento por WhatsApp";
    const tooltipHTML = tooltipAtivo
    ? `<div class="atendezap-tooltip">${tooltipSvg}${tooltipTexto}</div>`
    : `<div class="atendezap-tooltip" style="display: none!important"></div>`;
    widget.innerHTML = `
      ${tooltipHTML}
      <div class="atendezap-button">
        <svg viewBox="0 0 31 30" height="30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30.3139 14.3245C30.174 10.4932 28.5594 6.864 25.8073 4.1948C23.0552 1.52559 19.3784 0.0227244 15.5446 4.10118e-06H15.4722C12.8904 -0.00191309 10.3527 0.668375 8.10857 1.94491C5.86449 3.22145 3.99142 5.06026 2.67367 7.28039C1.35592 9.50053 0.6389 12.0255 0.593155 14.6068C0.547411 17.1882 1.17452 19.737 2.41278 22.0024L1.09794 29.8703C1.0958 29.8865 1.09712 29.9029 1.10182 29.9185C1.10651 29.9341 1.11448 29.9485 1.12518 29.9607C1.13588 29.973 1.14907 29.9828 1.16387 29.9896C1.17867 29.9964 1.19475 29.9999 1.21103 30H1.23365L9.01561 28.269C11.0263 29.2344 13.2282 29.7353 15.4586 29.7346C15.6004 29.7346 15.7421 29.7346 15.8838 29.7346C17.8458 29.6786 19.7773 29.2346 21.5667 28.4282C23.3562 27.6218 24.9682 26.469 26.3098 25.0363C27.6514 23.6036 28.696 21.9194 29.3832 20.0809C30.0704 18.2423 30.3867 16.2859 30.3139 14.3245ZM15.8099 27.1487C15.6923 27.1487 15.5747 27.1487 15.4586 27.1487C13.4874 27.1511 11.5444 26.6795 9.79366 25.7735L9.39559 25.5654L4.11815 26.8124L5.09221 21.4732L4.86604 21.0902C3.78579 19.2484 3.20393 17.157 3.17778 15.0219C3.15163 12.8869 3.68208 10.7819 4.71689 8.91419C5.75171 7.0465 7.25518 5.48059 9.07924 4.37067C10.9033 3.26076 12.985 2.64514 15.1194 2.58444C15.238 2.58444 15.3571 2.58444 15.4767 2.58444C18.6992 2.59399 21.7889 3.86908 24.0802 6.13498C26.3715 8.40087 27.681 11.4762 27.7265 14.6984C27.7719 17.9205 26.5498 21.0316 24.3234 23.3612C22.0969 25.6909 19.0444 27.0527 15.8235 27.1532L15.8099 27.1487Z" fill="currentColor"></path><path d="M10.2894 7.69007C10.1057 7.69366 9.92456 7.73407 9.75673 7.80892C9.5889 7.88377 9.43779 7.99154 9.31236 8.12584C8.95801 8.48923 7.96736 9.36377 7.91006 11.2003C7.85277 13.0369 9.13594 14.8538 9.31537 15.1086C9.49481 15.3635 11.7686 19.3306 15.5141 20.9395C17.7156 21.8879 18.6806 22.0507 19.3063 22.0507C19.5642 22.0507 19.7587 22.0236 19.9622 22.0115C20.6483 21.9693 22.1969 21.1762 22.5346 20.3137C22.8724 19.4512 22.895 18.6973 22.806 18.5465C22.7171 18.3957 22.4728 18.2872 22.1049 18.0942C21.737 17.9012 19.9321 16.9361 19.5928 16.8004C19.467 16.7419 19.3316 16.7066 19.1932 16.6964C19.1031 16.7011 19.0155 16.7278 18.938 16.774C18.8605 16.8203 18.7954 16.8847 18.7484 16.9618C18.4469 17.3372 17.7548 18.153 17.5225 18.3882C17.4718 18.4466 17.4093 18.4938 17.3392 18.5265C17.2691 18.5592 17.1928 18.5768 17.1154 18.5782C16.9728 18.5719 16.8333 18.5344 16.7068 18.4681C15.6135 18.0038 14.6167 17.339 13.768 16.5079C12.975 15.7263 12.3022 14.8315 11.7716 13.8526C11.5666 13.4726 11.7716 13.2766 11.9586 13.0987C12.1456 12.9208 12.3461 12.675 12.5391 12.4624C12.6975 12.2808 12.8295 12.0777 12.9312 11.8593C12.9838 11.7578 13.0104 11.6449 13.0085 11.5307C13.0067 11.4165 12.9765 11.3045 12.9206 11.2048C12.8317 11.0149 12.1667 9.14664 11.8546 8.39725C11.6013 7.75642 11.2997 7.73531 11.0358 7.7157C10.8187 7.70062 10.5699 7.69309 10.3211 7.68555H10.2894" fill="currentColor"></path></svg>
      </div>
    `;
    document.body.appendChild(widget);
    const style = document.createElement("style");
    style.textContent = `
      .atendezap-widget {
        position: fixed;
        bottom: 20px;
        cursor: pointer;
        z-index: 9999999999;
        transition: all 0.6s ease;
        visibility: hidden;
      }
      .atendezap-widget.right { right: 20px; }
      .atendezap-widget.left { left: 20px; }
      @keyframes slideIn {
        from {
          transform: translateY(70px);
        }
        to {
          transform: translateY(0);
        }
      }
      .atendezap-widget.show {
        visibility: visible;
        animation: slideIn 1.5s ease forwards;
      }
      .atendezap-button {
        width: 56px;
        height: 56px;
        background: ${cFundo};
        color: ${cIcone};
        border-radius: 360px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: rgba(0, 0, 0, 0.35) 0px 3px 8px;
        cursor: pointer;
        z-index: 999999999999;
        position: relative;
        transition: all 0.45s ease;
      }
      .atendezap-button:hover {
        transform: translateY(-5px); 
      }
      .atendezap-button::after {
        content: '';
        position: absolute;
        width: 62px;
        height: 62px;
        border-radius: 50%;
        border: 2.5px solid transparent;
        border-top-color: ${cFundo};
        border-right-color: transparent;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(0deg);
        opacity: 0;
        pointer-events: none;
      }
      .atendezap-widget:hover .atendezap-button::after {
        animation: ringAnim 1.4s ease forwards;
      }
      @keyframes ringAnim {
        0%   { transform: translate(-50%, -50%) rotate(0deg);   opacity: 1; }
        80%  { transform: translate(-50%, -50%) rotate(720deg);  opacity: 1; }
        100% { transform: translate(-50%, -50%) rotate(720deg);  opacity: 0; }
      }
      .atendezap-tooltip {
        position: absolute;
        top: -20px;
        display: flex;
        align-items: center;
        gap: 4px;
        background-color: #fff;
        color: #555;
        padding: 6px 8px;
        border: 1px solid #d9d9d9;
        font-size: 12px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        white-space: nowrap;
        box-shadow: 0 1px 11px rgba(0, 0, 0, 0.15);
        opacity: 0;
        visibility: hidden;
        transition: all 0.45s ease;
        pointer-events: none;
      }
      .atendezap-widget.right .atendezap-tooltip {
        right: 55px;
        border-bottom-left-radius: 10px;
        border-top-right-radius: 10px;
        border-top-left-radius: 10px;
        transform: translateX(3px);
      }
      .atendezap-widget.left .atendezap-tooltip {
        left: 55px;
        border-bottom-right-radius: 10px;
        border-top-right-radius: 10px;
        border-top-left-radius: 10px;
        transform: translateX(-3px);
      }
      .atendezap-widget:hover .atendezap-button {
        transform: translateY(-5px);
      }
      .atendezap-button:hover {
        transform: translateY(-5px);
      }
      .atendezap-widget:hover .atendezap-tooltip {
        opacity: 1;
        visibility: visible;
        transform: translateY(-15px);
      }
    `;
    document.head.appendChild(style);
    const mostrarEm = siteData.mostrarEm || "ambos";
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (mostrarEm === "mobile" && !isMobile) return;
    if (mostrarEm === "desktop" && isMobile) return;
    const atendentesSnap = await siteRef.collection("atendentes").get();
    const disponiveis = atendentesSnap.docs.map(d => d.data()).filter(estaDisponivel);
    if (disponiveis.length === 0) return;
    document.body.appendChild(widget);
    const isRight = siteData.direita !== false;
    widget.classList.add(isRight ? "right" : "left");
    requestAnimationFrame(() => {
      widget.classList.add("show");
      widget.querySelector(".atendezap-button").addEventListener("click", async () => {
        try {
          const siteDoc = await siteRef.get();
          const site = siteDoc.data();
          const atendentesSnap = await siteRef.collection("atendentes").get();
          const ativos = atendentesSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(estaDisponivel);
          if (!ativos.length) {
            alert("Nenhum atendente disponível no momento.");
            widget.classList.remove("show");
            return;
          }
          let indice = site.indiceAtual || 0;
          if (indice >= ativos.length) indice = 0;
          const proximo = ativos[indice];
          const novoIndice = (indice + 1) % ativos.length;
          await siteRef.update({
            indiceAtual: novoIndice,
            totalCliques: firebase.firestore.FieldValue.increment(1)
          });
          await siteRef.collection("atendentes").doc(proximo.id).update({
            totalCliques: firebase.firestore.FieldValue.increment(1)
          });
          await siteRef.collection("cliques").add({
            data: firebase.firestore.FieldValue.serverTimestamp()
          });
          const preAtiva = site.prePreenchidaAtiva ?? false;
          const preMensagem = site.prePreenchidaMensagem?.trim() || "";
          const textoFinal = (preAtiva && preMensagem) ? `?text=${encodeURIComponent(preMensagem)}` : "";
          window.open(`https://wa.me/55${proximo.numero.replace(/\D/g, "")}${textoFinal}`, "_blank");
        } catch (err) {
          console.error("Erro no clique:", err);
        }
      });
    });
  } catch (err) {
    console.error("Erro AtendeZap:", err);
    return;
  }
})();