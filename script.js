const carrossel = document.querySelector(".carrossel");
const btnEsq = document.querySelector(".carrossel-btn.esquerda");
const btnDir = document.querySelector(".carrossel-btn.direita");
const carrosselContainer = document.querySelector(".carrossel-container");


// Clonar itens para loop infinito
const itensOriginais = Array.from(carrossel.children);
itensOriginais.forEach(item => carrossel.appendChild(item.cloneNode(true)));

let index = 0;
let total = itensOriginais.length;

// Função para verificar quantos itens aparecem por vez
function itensPorTela() {
    if (window.innerWidth <= 500) return 1;
    if (window.innerWidth <= 768) return 2;
    return 3; // PC sempre 3
}

function larguraItem() {
    return carrossel.querySelector(".item").offsetWidth + 20;
}

// Ajusta posição com item centralizado
function atualizar() {
    const porTela = itensPorTela();

    const deslocamento =larguraItem() * index - (carrosselContainer.offsetWidth - larguraItem()) / 2;

    carrossel.style.transition = "transform 0.4s ease";
    carrossel.style.transform = `translateX(${-deslocamento}px)`;
}

// Avançar
btnDir.addEventListener("click", () => {
    index++;
    atualizar();

    // Loop → reset silencioso
    if (index >= total + Math.floor(itensPorTela() / 2)) {
        setTimeout(() => {
            carrossel.style.transition = "none";
            index = Math.floor(itensPorTela() / 2);
            atualizar();
        }, 400);
    }
});

// Voltar
btnEsq.addEventListener("click", () => {
    index--;
    atualizar();

    // Loop reverso
    if (index < Math.floor(itensPorTela() / 2)) {
        setTimeout(() => {
            carrossel.style.transition = "none";
            index = total + Math.floor(itensPorTela() / 2) - 1;
            atualizar();
        }, 400);
    }
});

// Recalcular ao redimensionar
window.addEventListener("resize", atualizar);

// Posiciona corretamente ao iniciar
window.addEventListener("load", () => {
    index = Math.floor(itensPorTela() / 2);
    atualizar();
});