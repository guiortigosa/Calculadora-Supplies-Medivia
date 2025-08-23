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
    // Selecionar item ao clicar - CORREÇÃO AQUI
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

// Selecionar item - CORREÇÃO AQUI (função separada)
function selecionarItem(elemento) {
    // Remover seleção anterior
    document.querySelectorAll('.quick-item').forEach(i => {
        i.classList.remove('selected');
    });
    
    // Selecionar novo item
    elemento.classList.add('selected');
    
    // Definir item selecionado
    selectedItem = {
        price: parseInt(elemento.getAttribute('data-price')),
        name: elemento.getAttribute('data-name')
    };
    
    // Feedback visual
    elemento.style.transform = 'scale(1.05)';
    setTimeout(() => {
        elemento.style.transform = 'scale(1)';
    }, 200);
    
    // Focar no campo de quantidade
    document.getElementById("qtdInicial").focus();
}

function adicionarSupply() {
    if (!selectedItem) {
        mostrarFeedback('Por favor, selecione um item primeiro.', 'error');
        document.getElementById("qtdInicial").focus();
        return;
    }
    
    const price = selectedItem.price;
    const name = selectedItem.name;
    
    const inicial = parseInt(document.getElementById("qtdInicial").value) || 0;
    let restante = parseInt(document.getElementById("qtdRestante").value) || 0;
    
    if (inicial === 0) {
        mostrarFeedback('Por favor, informe a quantidade levada.', 'error');
        document.getElementById("qtdInicial").focus();
        return;
    }
    
    if (restante > inicial) {
        mostrarFeedback('A quantidade restante não pode ser maior que a quantidade levada.', 'error');
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
        mostrarFeedback('Quantidade gasta é zero. Não é necessário adicionar este item.', 'info');
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

function editarSupply(index) {
    const supply = supplies[index];
    editingIndex = index;
    
    // Selecionar o item correto
    document.querySelectorAll('.quick-item').forEach(item => {
        if (item.getAttribute('data-name') === supply.name) {
            selecionarItem(item);
        }
    });
    
    // Preencher os campos
    document.getElementById("qtdInicial").value = supply.inicial;
    document.getElementById("qtdRestante").value = supply.restante;
    
    // Scroll para o formulário
    document.querySelector('.supplies-panel').scrollIntoView({ behavior: 'smooth' });
}

function removerSupply(index) {
    supplies.splice(index, 1);
    atualizarListaSupplies();
    mostrarFeedback('Item removido com sucesso!');
}

function atualizarListaSupplies() {
    const lista = document.getElementById("lista");
    
    // Limpar lista se estiver vazia
    if (supplies.length === 0) {
        lista.innerHTML = '<li class="empty-state">Nenhum supply adicionado ainda</li>';
        return;
    }
    
    // Atualizar lista de supplies
    lista.innerHTML = '';
    supplies.forEach((supply, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="item-info">
                <div class="item-name">${supply.name}</div>
                <div class="item-details">
                    <span>Levado: ${supply.inicial} | Restante: ${supply.restante} | Gasto: ${supply.gasta}</span>
                </div>
            </div>
            <div class="item-total">${formatarValor(supply.custo)}</div>
            <div class="item-actions">
                <button class="btn-edit"><i class="fas fa-edit"></i></button>
                <button class="btn-delete"><i class="fas fa-times"></i></button>
            </div>
        `;
        
        // Adicionar eventos aos botões
        li.querySelector('.btn-edit').addEventListener('click', () => editarSupply(index));
        li.querySelector('.btn-delete').addEventListener('click', () => removerSupply(index));
        
        lista.appendChild(li);
    });
}

function limparCampos() {
    document.getElementById("qtdInicial").value = "";
    document.getElementById("qtdRestante").value = "";
    document.getElementById("qtdInicial").focus();
    
    // Manter o item selecionado
}

function calcularGastos() {
    if (supplies.length === 0) {
        mostrarFeedback('Adicione pelo menos um item antes de calcular.', 'error');
        return;
    }
    
    // Calcular total
    const total = supplies.reduce((sum, supply) => sum + supply.custo, 0);
    
    // Formatar total (usando k e kk)
    const formattedTotal = formatarValor(total);
    
    // Mostrar resultados
    document.getElementById('total').textContent = `${formattedTotal}`;
    
    // Preencher tabela de resultados
    const resultsBody = document.getElementById("results-body");
    resultsBody.innerHTML = '';
    
    supplies.forEach(supply => {
        const inicialBP = (supply.inicial / 20).toFixed(1);
        const restanteBP = (supply.restante / 20).toFixed(1);
        const gastoBP = (supply.gasta / 20).toFixed(1);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="item-name">${supply.name}</td>
            <td>${supply.inicial}<br><small>(${inicialBP})</small></td>
            <td>${supply.restante}<br><small>(${restanteBP})</small></td>
            <td>${supply.gasta}<br><small>(${gastoBP})</small></td>
            <td>${supply.price} gp</td>
            <td class="item-cost">${formatarValor(supply.custo)}</td>
        `;
        resultsBody.appendChild(tr);
    });
    
    // Ocultar painel de supplies adicionados
    document.getElementById('supplies-added-panel').style.display = 'none';
    
    // Mostrar a seção de resultados
    document.getElementById('resultado').style.display = 'block';
    
    // Rolagem suave para os resultados
    document.getElementById('resultado').scrollIntoView({ behavior: 'smooth' });
}

function voltarParaLista() {
    // Mostrar painel de supplies adicionados
    document.getElementById('supplies-added-panel').style.display = 'block';
    
    // Ocultar resultados
    document.getElementById('resultado').style.display = 'none';
    
    // Scroll para a lista
    document.getElementById('supplies-added-panel').scrollIntoView({ behavior: 'smooth' });
}

function formatarValor(valor) {
    if (valor >= 1000000) {
        return (valor / 1000000).toFixed(1).replace('.0', '') + 'kk';
    } else if (valor >= 1000) {
        return (valor / 1000).toFixed(1).replace('.0', '') + 'k';
    }
    return valor.toLocaleString('pt-BR') + ' gp';
}

function resetarTudo() {
    if (confirm("Tem certeza que deseja limpar tudo?")) {
        supplies = [];
        selectedItem = null;
        editingIndex = -1;
        
        // Limpar seleção de itens
        document.querySelectorAll('.quick-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Limpar campos
        document.getElementById("qtdInicial").value = "";
        document.getElementById("qtdRestante").value = "";
        
        // Mostrar painel de supplies adicionados
        document.getElementById('supplies-added-panel').style.display = 'block';
        
        // Ocultar resultados
        document.getElementById('resultado').style.display = 'none';
        
        // Atualizar lista de supplies
        atualizarListaSupplies();
        
        mostrarFeedback('Todos os dados foram limpos!');
    }
}

// Função para mostrar feedback visual
function mostrarFeedback(mensagem, tipo = 'success') {
    // Criar elemento de feedback se não existir
    let feedback = document.getElementById('feedback-message');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.id = 'feedback-message';
        feedback.style.position = 'fixed';
        feedback.style.top = '20px';
        feedback.style.left = '50%';
        feedback.style.transform = 'translateX(-50%)';
        feedback.style.padding = '12px 24px';
        feedback.style.color = 'white';
        feedback.style.borderRadius = '5px';
        feedback.style.zIndex = '1000';
        feedback.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        feedback.style.transition = 'all 0.3s ease';
        feedback.style.fontWeight = '500';
        feedback.style.textAlign = 'center';
        document.body.appendChild(feedback);
    }
    
    // Configurar cor baseada no tipo
    if (tipo === 'error') {
        feedback.style.background = 'var(--red)';
    } else if (tipo === 'info') {
        feedback.style.background = 'var(--blue)';
    } else {
        feedback.style.background = 'var(--green)';
    }
    
    // Mostrar mensagem
    feedback.textContent = mensagem;
    feedback.style.opacity = '1';
    
    // Esconder após 3 segundos
    setTimeout(() => {
        feedback.style.opacity = '0';
    }, 3000);
}
