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
    
    // Botões
    document.getElementById("btn-adicionar").addEventListener('click', adicionarSupply);
    document.getElementById("btn-calcular").addEventListener('click', calcularGastos);
    document.getElementById("btn-reset").addEventListener('click', resetarTudo);
    document.getElementById("btn-voltar").addEventListener('click', voltarParaLista);
}

// Selecionar item
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
    
    // Focar no campo de quantidade
    document.getElementById("qtdInicial").focus();
}

function adicionarSupply() {
    if (!selectedItem) {
        alert("Por favor, selecione um item primeiro.");
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
        alert("Adicione pelo menos um item antes de calcular.");
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
    }
}