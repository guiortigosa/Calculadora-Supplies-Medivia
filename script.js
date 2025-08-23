// Variáveis globais
let supplies = [];
let selectedItem = null;
let editingIndex = -1;

// Inicialização quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    inicializarEventos();
    document.getElementById("qtdInicial").focus();
});

// Configurar todos os eventos
function inicializarEventos() {
    // Selecionar item ao clicar
    document.querySelectorAll('.quick-item').forEach(item => {
        item.addEventListener('click', function() {
            selecionarItem(this);
        });
    });
    
    // Limpar campos quando focados
    document.getElementById("qtdInicial").addEventListener('focus', function() {
        if (this.value === "0") this.value = "";
    });
    
    document.getElementById("qtdRestante").addEventListener('focus', function() {
        if (this.value === "0") this.value = "";
    });
    
    // Adicionar evento de Enter nos campos de input
    document.getElementById("qtdInicial").addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById("qtdRestante").focus();
        }
    });
    
    document.getElementById("qtdRestante").addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            adicionarSupply();
        }
    });
    
    // Botões
    document.getElementById("btn-adicionar").addEventListener('click', adicionarSupply);
    document.getElementById("btn-calcular").addEventListener('click', calcularGastos);
    document.getElementById("btn-reset").addEventListener('click', resetarTudo);
    document.getElementById("btn-voltar").addEventListener('click', voltarParaLista);
}

// ... o resto do código permanece igual até a função adicionarSupply ...

function adicionarSupply() {
    if (!selectedItem) {
        alert("Por favor, selecione um item primeiro.");
        document.getElementById("qtdInicial").focus();
        return;
    }
    
    const price = selectedItem.price;
    const name = selectedItem.name;
    
    const inicial = parseInt(document.getElementById("qtdInicial").value) || 0;
    let restante = parseInt(document.getElementById("qtdRestante").value) || 0;
    
    if (inicial === 0) {
        alert("Por favor, informe a quantidade levada.");
        document.getElementById("qtdInicial").focus();
        return;
    }
    
    if (restante > inicial) {
        alert("A quantidade restante não pode ser maior que a quantidade levada.");
        document.getElementById("qtdRestante").focus();
        return;
    }
    
    // Se não informou quantidade restante, assume que gastou tudo
    if (document.getElementById("qtdRestante").value === "") {
        restante = 0;
    }
    
    // Calcular quantidade gasta
    const gasta = inicial - restante;
    
    if (gasta === 0) {
        alert("Quantidade gasta é zero. Não é necessário adicionar este item.");
        return;
    }
    
    // Se estiver editando, atualizar o item
    if (editingIndex !== -1) {
        supplies[editingIndex] = { 
            name, 
            price,
            inicial, 
            restante, 
            gasta: inicial - restante,
            custo: (inicial - restante) * price 
        };
        editingIndex = -1;
        
        // Feedback visual para edição
        mostrarFeedback('Item atualizado com sucesso!');
    } else {
        // Verificar se o item já foi adicionado
        const existingIndex = supplies.findIndex(s => s.name === name);
        if (existingIndex !== -1) {
            supplies[existingIndex].inicial += inicial;
            supplies[existingIndex].restante += restante;
            supplies[existingIndex].gasta = supplies[existingIndex].inicial - supplies[existingIndex].restante;
            supplies[existingIndex].custo = supplies[existingIndex].gasta * price;
            atualizarListaSupplies();
            limparCampos();
            
            // Feedback visual para atualização
            mostrarFeedback('Quantidade do item atualizada!');
            return;
        }
        
        // Adicionar supply à lista
        supplies.push({ 
            name, 
            price,
            inicial, 
            restante, 
            gasta: inicial - restante,
            custo: (inicial - restante) * price 
        });
        
        // Feedback visual para adição
        mostrarFeedback('Item adicionado com sucesso!');
    }
    
    atualizarListaSupplies();
    limparCampos();
}

// ... o resto do código permanece igual ...

// Função para mostrar feedback visual
function mostrarFeedback(mensagem) {
    // Criar elemento de feedback se não existir
    let feedback = document.getElementById('feedback-message');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.id = 'feedback-message';
        feedback.style.position = 'fixed';
        feedback.style.top = '20px';
        feedback.style.left = '50%';
        feedback.style.transform = 'translateX(-50%)';
        feedback.style.padding = '10px 20px';
        feedback.style.background = 'var(--green)';
        feedback.style.color = 'white';
        feedback.style.borderRadius = '5px';
        feedback.style.zIndex = '1000';
        feedback.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        feedback.style.transition = 'opacity 0.3s';
        document.body.appendChild(feedback);
    }
    
    // Mostrar mensagem
    feedback.textContent = mensagem;
    feedback.style.opacity = '1';
    
    // Esconder após 2 segundos
    setTimeout(() => {
        feedback.style.opacity = '0';
    }, 2000);
}
