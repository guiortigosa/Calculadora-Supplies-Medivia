document.addEventListener('DOMContentLoaded', function() {
    // Variáveis globais
    let selectedItem = null;
    let suppliesList = [];
    
    // Elementos DOM
    const quickItems = document.querySelectorAll('.quick-item');
    const qtdInicialInput = document.getElementById('qtdInicial');
    const qtdRestanteInput = document.getElementById('qtdRestante');
    const btnAdicionar = document.getElementById('btn-adicionar');
    const btnCalcular = document.getElementById('btn-calcular');
    const btnReset = document.getElementById('btn-reset');
    const btnVoltar = document.getElementById('btn-voltar');
    const listaElement = document.getElementById('lista');
    const resultadoElement = document.getElementById('resultado');
    const totalElement = document.getElementById('total');
    const resultsBody = document.getElementById('results-body');
    const suppliesAddedPanel = document.getElementById('supplies-added-panel');

    // Sistema de abas para instruções
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Função para alternar abas
    function switchTab(tabId) {
        // Remove a classe active de todos os botões e conteúdos
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Adiciona a classe active ao botão clicado
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
        
        // Mostra o conteúdo correspondente
        document.getElementById(`${tabId}-content`).classList.add('active');
    }
    
    // Adiciona event listeners para os botões de aba
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Seleção de itens rápidos
    quickItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove a seleção anterior
            quickItems.forEach(i => i.classList.remove('selected'));
            
            // Adiciona seleção ao item atual
            this.classList.add('selected');
            
            // Armazena o item selecionado
            selectedItem = {
                name: this.getAttribute('data-name'),
                price: parseInt(this.getAttribute('data-price'))
            };
            
            // Foca no campo de quantidade inicial
            qtdInicialInput.focus();
        });
    });

    // Adicionar item ao pressionar Enter
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            btnAdicionar.click();
        }
        
        if (e.key === 'Escape') {
            quickItems.forEach(i => i.classList.remove('selected'));
            selectedItem = null;
        }
    });

    // Adicionar item à lista
    btnAdicionar.addEventListener('click', function() {
        if (!selectedItem) {
            showFeedback('Por favor, selecione um item primeiro.', 'error');
            return;
        }
        
        const qtdInicial = parseInt(qtdInicialInput.value);
        const qtdRestante = parseInt(qtdRestanteInput.value);
        
        if (isNaN(qtdInicial) || isNaN(qtdRestante)) {
            showFeedback('Por favor, preencha ambas as quantidades.', 'error');
            return;
        }
        
        if (qtdInicial < qtdRestante) {
            showFeedback('A quantidade restante não pode ser maior que a quantidade levada.', 'error');
            return;
        }
        
        // Calcula a quantidade usada e o custo total
        const qtdUsada = qtdInicial - qtdRestante;
        const custoTotal = qtdUsada * selectedItem.price;
        
        // Adiciona à lista de supplies
        const supply = {
            id: Date.now(), // ID único para edição/remoção
            name: selectedItem.name,
            price: selectedItem.price,
            qtdInicial: qtdInicial,
            qtdRestante: qtdRestante,
            qtdUsada: qtdUsada,
            custoTotal: custoTotal
        };
        
        suppliesList.push(supply);
        updateSuppliesList();
        
        // Limpa os campos
        qtdInicialInput.value = '';
        qtdRestanteInput.value = '';
        quickItems.forEach(i => i.classList.remove('selected'));
        selectedItem = null;
        
        showFeedback('Item adicionado com sucesso!', 'success');
    });

    // Calcular totais
    btnCalcular.addEventListener('click', function() {
        if (suppliesList.length === 0) {
            showFeedback('Adicione pelo menos um item antes de calcular.', 'error');
            return;
        }
        
        // Calcula o total geral
        const totalGeral = suppliesList.reduce((total, supply) => total + supply.custoTotal, 0);
        totalElement.textContent = `${totalGeral.toLocaleString()} gp`;
        
        // Preenche a tabela de resultados
        resultsBody.innerHTML = '';
        suppliesList.forEach(supply => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="item-name">${supply.name}</td>
                <td>${supply.qtdInicial}</td>
                <td>${supply.qtdRestante}</td>
                <td>${supply.qtdUsada}</td>
                <td>${supply.price.toLocaleString()} gp</td>
                <td class="item-cost">${supply.custoTotal.toLocaleString()} gp</td>
            `;
            resultsBody.appendChild(row);
        });
        
        // Mostra o painel de resultados e esconde a lista
        suppliesAddedPanel.style.display = 'none';
        resultadoElement.style.display = 'block';
    });

    // Voltar para a lista
    btnVoltar.addEventListener('click', function() {
        resultadoElement.style.display = 'none';
        suppliesAddedPanel.style.display = 'block';
    });

    // Resetar tudo
    btnReset.addEventListener('click', function() {
        if (confirm('Tem certeza que deseja limpar todos os supplies adicionados?')) {
            suppliesList = [];
            updateSuppliesList();
            showFeedback('Todos os supplies foram removidos.', 'success');
        }
    });

    // Atualizar a lista de supplies na interface
    function updateSuppliesList() {
        if (suppliesList.length === 0) {
            listaElement.innerHTML = '<li class="empty-state">Nenhum supply adicionado ainda</li>';
            return;
        }
        
        listaElement.innerHTML = '';
        suppliesList.forEach(supply => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="item-info">
                    <div class="item-details">
                        <span class="item-name">${supply.name}</span>
                        <span>Levados: ${supply.qtdInicial}</span>
                        <span>Restantes: ${supply.qtdRestante}</span>
                       极速赛车开奖直播 <span class="item-total">${supply.custoTotal.toLocaleString()} gp</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn-edit" data-id="${supply.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" data-id="${supply.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            listaElement.appendChild(li);
        });
        
        // Adiciona event listeners para os botões de editar e excluir
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                editSupply(id);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteSupply(id);
            });
        });
    }

    // Editar supply
    function editSupply(id) {
        const supply = suppliesList.find(item => item.id === id);
        if (!supply) return;
        
        // Preenche o formulário com os dados do supply
        quickItems.forEach(item => {
            if (item.getAttribute('data-name') === supply.name) {
                item.classList.add('selected');
                selectedItem = {
                    name: supply.name,
                    price: supply.price
                };
            }
        });
        
        qtd极速赛车开奖直播InicialInput.value = supply.qtdInicial;
        qtdRestanteInput.value = supply.qtdRestante;
        
        // Remove o supply da lista
        suppliesList = suppliesList.filter(item => item.id !== id);
        updateSuppliesList();
        
        showFeedback('Item pronto para edição. Faça as alterações e clique em Adicionar Item.', 'info');
    }

    // Excluir supply
    function deleteSupply(id) {
        suppliesList = suppliesList.filter(item => item.id !== id);
        updateSuppliesList();
        showFeedback('Item removido com sucesso.', 'success');
    }

    // Mostrar feedback para o usuário
    function showFeedback(message, type) {
        // Remove feedback anterior se existir
        const existingFeedback = document.getElementById('feedback-message');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        // Cria novo elemento de feedback
        const feedback = document.createElement('div');
        feedback.id = 'feedback-message';
        feedback.textContent = message;
        
        // Aplica estilos com base no tipo
        switch(type) {
            case 'error':
                feedback.style.backgroundColor = '#e74c3c';
                break;
            case 'success':
                feedback.style.backgroundColor = '#27ae60';
                break;
            case 'info':
                feedback.style.backgroundColor = '#3498db';
                break;
            default:
                feedback.style.backgroundColor = '#7f8c8d';
        }
        
        // Adiciona ao documento
        document.body.appendChild(feedback);
        
        // Remove após 3 segundos
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 3000);
    }
});
