const carrossel = document.querySelector(".carrossel");
const btnEsq = document.querySelector(".carrossel-btn.esquerda");
const btnDir = document.querySelector(".carrossel-btn.direita");
const indicadoresContainer = document.querySelector(".carrossel-indicadores");

const itens = Array.from(carrossel.querySelectorAll(".item"));
const totalItens = itens.length;
let indexAtual = totalItens; // Começa no meio dos clones

// Clona os itens 3 vezes (antes e depois) para loop infinito suave
const itensClonados = [];

// Clones no início (para voltar)
itens.forEach(item => {
    const clone = item.cloneNode(true);
    carrossel.insertBefore(clone, carrossel.firstChild);
    itensClonados.push(clone);
});

// Clones no final (para avançar)
itens.forEach(item => {
    const clone = item.cloneNode(true);
    carrossel.appendChild(clone);
    itensClonados.push(clone);
});

// Determina quantos itens mostrar por vez baseado na tela
function itensPorTela() {
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
}

// Cria indicadores
function criarIndicadores() {
    indicadoresContainer.innerHTML = '';
    for (let i = 0; i < totalItens; i++) {
        const indicador = document.createElement('button');
        indicador.classList.add('indicador');
        if (i === indexAtual) indicador.classList.add('ativo');
        indicador.addEventListener('click', () => irPara(i));
        indicadoresContainer.appendChild(indicador);
    }
}

// Atualiza a posição do carrossel
function atualizar(semTransicao = false) {
    const porTela = itensPorTela();
    const todosItens = carrossel.querySelectorAll(".item");
    const larguraItem = itens[0].offsetWidth;
    const gap = 30; // gap padrão

    if (semTransicao) {
        carrossel.style.transition = 'none';
    } else {
        carrossel.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    let deslocamento;
    const containerWidth = carrossel.parentElement.offsetWidth;

    if (porTela === 1) {
        // Mobile: centraliza perfeitamente o item
        const gapMobile = 22;
        deslocamento = (indexAtual * (larguraItem + gapMobile)) - ((containerWidth - larguraItem) / 2);
    } else if (porTela === 2) {
        // Tablet: mostra 2 itens
        deslocamento = indexAtual * (larguraItem + gap);
    } else {
        // Desktop: centraliza com 3 itens, item do meio em destaque
        deslocamento = (indexAtual * (larguraItem + gap)) - (containerWidth / 2) + (larguraItem / 2);
    }

    carrossel.style.transform = `translateX(-${deslocamento}px)`;

    // Remove classe center de todos
    todosItens.forEach(item => item.classList.remove('center'));

    // Adiciona classe center apenas no desktop
    if (porTela === 3 && todosItens[indexAtual]) {
        todosItens[indexAtual].classList.add('center');
    }

    // Atualiza indicadores (baseado no índice real, não nos clones)
    const indiceReal = (indexAtual - totalItens + totalItens) % totalItens;
    document.querySelectorAll('.indicador').forEach((ind, i) => {
        ind.classList.toggle('ativo', i === indiceReal);
    });

    // Reativa transição suavemente se estava desativada
    if (semTransicao) {
        requestAnimationFrame(() => {
            carrossel.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    }
}

// Navegar para um item específico
function irPara(index) {
    indexAtual = index;
    atualizar();
}

// Avançar
function avancar() {
    indexAtual++;
    atualizar();

    // Quando chegar no final dos clones, reseta instantaneamente (sem animação)
    if (indexAtual >= totalItens * 2) {
        setTimeout(() => {
            carrossel.style.transition = 'none';
            indexAtual = totalItens;
            atualizar(true);
            // Força o reflow do navegador
            carrossel.offsetHeight;
        }, 550);
    }
}

// Voltar
function voltar() {
    indexAtual--;
    atualizar();

    // Quando chegar no início dos clones, reseta instantaneamente (sem animação)
    if (indexAtual < totalItens) {
        setTimeout(() => {
            carrossel.style.transition = 'none';
            indexAtual = totalItens * 2 - 1;
            atualizar(true);
            // Força o reflow do navegador
            carrossel.offsetHeight;
        }, 550);
    }
}

// Event listeners
btnDir.addEventListener("click", avancar);
btnEsq.addEventListener("click", voltar);

// Suporte para swipe em mobile
let touchStartX = 0;
let touchEndX = 0;

carrossel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

carrossel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) avancar();
    if (touchEndX - touchStartX > 50) voltar();
});

// Navegação por teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') voltar();
    if (e.key === 'ArrowRight') avancar();
});

// Recalcular ao redimensionar
let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        atualizar();
    }, 250);
});

// Inicializar
criarIndicadores();
// Posiciona no meio dos clones para permitir navegação infinita
setTimeout(() => {
    atualizar(true);
}, 20);

// Auto-play opcional (remova se não quiser)
let autoPlayInterval = setInterval(avancar, 5000);

// Pausa auto-play ao passar o mouse
carrossel.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
carrossel.addEventListener('mouseleave', () => {
    autoPlayInterval = setInterval(avancar, 5000);
});