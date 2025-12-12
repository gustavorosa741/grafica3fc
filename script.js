const carrossel = document.querySelector(".carrossel");
const btnEsq = document.querySelector(".carrossel-btn.esquerda");
const btnDir = document.querySelector(".carrossel-btn.direita");
const indicadoresContainer = document.querySelector(".carrossel-indicadores");

const itens = Array.from(carrossel.querySelectorAll(".item"));
const totalItens = itens.length;
const copiasBuffer = 5; // Número de cópias completas antes e depois
let indexAtual = 0;
let estaResetando = false;

// Cria múltiplas cópias dos itens para buffer maior
function criarBuffer() {
    // Clones no início (múltiplas cópias)
    for (let copia = 0; copia < copiasBuffer; copia++) {
        for (let i = itens.length - 1; i >= 0; i--) {
            const clone = itens[i].cloneNode(true);
            carrossel.insertBefore(clone, carrossel.firstChild);
        }
    }

    // Clones no final (múltiplas cópias)
    for (let copia = 0; copia < copiasBuffer; copia++) {
        itens.forEach(item => {
            const clone = item.cloneNode(true);
            carrossel.appendChild(clone);
        });
    }
}

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
        indicador.addEventListener('click', () => irPara(i));
        indicadoresContainer.appendChild(indicador);
    }
}

// Atualiza a posição do carrossel
function atualizar(semTransicao = false) {
    const porTela = itensPorTela();
    const todosItens = carrossel.querySelectorAll(".item");
    const larguraItem = itens[0].offsetWidth;
    const gap = 30;

    if (semTransicao) {
        carrossel.style.transition = 'none';
    } else {
        carrossel.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    let deslocamento;
    const containerWidth = carrossel.parentElement.offsetWidth;
    
    // Posição real no array completo (com buffer de cópias)
    const indexReal = (copiasBuffer * totalItens) + indexAtual;

    if (porTela === 1) {
        const gapMobile = 22;
        deslocamento = (indexReal * (larguraItem + gapMobile)) - ((containerWidth - larguraItem) / 2);
    } else if (porTela === 2) {
        deslocamento = indexReal * (larguraItem + gap);
    } else {
        deslocamento = (indexReal * (larguraItem + gap)) - (containerWidth / 2) + (larguraItem / 2);
    }

    carrossel.style.transform = `translateX(-${deslocamento}px)`;

    // Remove classe center de todos
    todosItens.forEach(item => item.classList.remove('center'));

    // Adiciona classe center apenas no desktop
    if (porTela === 3 && todosItens[indexReal]) {
        todosItens[indexReal].classList.add('center');
    }

    // Atualiza indicadores
    const indiceIndicador = ((indexAtual % totalItens) + totalItens) % totalItens;
    document.querySelectorAll('.indicador').forEach((ind, i) => {
        ind.classList.toggle('ativo', i === indiceIndicador);
    });

    if (semTransicao) {
        requestAnimationFrame(() => {
            carrossel.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    }
}

// Verifica se precisa resetar a posição (quando está longe do centro)
function verificarReset() {
    if (estaResetando) return;
    
    const limiteInferior = totalItens; // 1 cópia completa de margem
    const limiteSuperior = totalItens * (copiasBuffer - 1); // deixa 1 cópia de margem
    
    // Se saiu muito longe do centro, reseta suavemente
    if (indexAtual >= limiteSuperior) {
        estaResetando = true;
        carrossel.style.transition = 'none';
        indexAtual = indexAtual - (totalItens * 2); // volta 2 cópias completas
        atualizar(true);
        carrossel.offsetHeight; // força reflow
        setTimeout(() => {
            estaResetando = false;
        }, 50);
    } else if (indexAtual < -limiteInferior) {
        estaResetando = true;
        carrossel.style.transition = 'none';
        indexAtual = indexAtual + (totalItens * 2); // avança 2 cópias completas
        atualizar(true);
        carrossel.offsetHeight; // força reflow
        setTimeout(() => {
            estaResetando = false;
        }, 50);
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
    verificarReset();
}

// Voltar
function voltar() {
    indexAtual--;
    atualizar();
    verificarReset();
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
criarBuffer();
criarIndicadores();
setTimeout(() => {
    atualizar(true);
}, 20);

// Auto-play
let autoPlayInterval = setInterval(avancar, 5000);

carrossel.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
carrossel.addEventListener('mouseleave', () => {
    autoPlayInterval = setInterval(avancar, 5000);
});