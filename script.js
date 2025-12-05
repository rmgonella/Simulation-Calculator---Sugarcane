// Tabela de preços dos corretivos (PROCV/VLOOKUP) - agora interna
const tabelaPrecos = {
    'Calcário calcítico': 195.00,
    'Calcário dolomítico': 220.00,
    'Calcário magnesiano': 210.00,
    'Gesso agrícola': 170.00,
    'Calcário calcinado': 400.00
};

// Parâmetros fixos para OXIFLUX - agora internos
const parametrosOxiflux = {
    preco: 1020.00,
    produtividade: 117.00,
    conversaoATR: 0.147,
    ganhosCBIOs: 2.60,
    intervalo: 1
};

// Função para formatar números como moeda brasileira
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Função para formatar números com separadores
function formatarNumero(valor, decimais = 2) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: decimais,
        maximumFractionDigits: decimais
    }).format(valor);
}

// Função PROCV (VLOOKUP) equivalente
function procv(valorProcurado, tabela) {
    return tabela[valorProcurado] || 0;
}

// Função para validar se todos os campos estão preenchidos
function validarCampos() {
    const campos = [
        'preco-cana', 'produtividade-esperada', 'preco-cbio', 
        'area-total', 'corretivo-tratamento', 'dose-por-area', 
        'intervalo-aplicacoes'
    ];

    let todosPreenchidos = true;
    let mensagensErro = [];

    campos.forEach(id => {
        const elemento = document.getElementById(id);
        const valor = elemento.value.trim();
        
        // Remover classes de erro anteriores
        elemento.classList.remove('campo-erro');
        
        if (!valor || valor === '') {
            todosPreenchidos = false;
            elemento.classList.add('campo-erro');
            
            // Obter o label do campo para a mensagem de erro
            const label = document.querySelector(`label[for="${id}"]`);
            const nomeCampo = label ? label.textContent.replace(':', '') : id;
            mensagensErro.push(nomeCampo);
        } else if (id !== 'corretivo-tratamento') {
            // Validar se é um número válido para campos numéricos
            const numero = parseFloat(valor);
            if (isNaN(numero) || numero <= 0) {
                todosPreenchidos = false;
                elemento.classList.add('campo-erro');
                
                const label = document.querySelector(`label[for="${id}"]`);
                const nomeCampo = label ? label.textContent.replace(':', '') : id;
                mensagensErro.push(`${nomeCampo} (deve ser um número maior que zero)`);
            }
        }
    });

    return {
        valido: todosPreenchidos,
        erros: mensagensErro
    };
}

// Função para exibir mensagem de erro
function exibirMensagemErro(mensagens) {
    // Remover mensagem de erro anterior se existir
    const mensagemAnterior = document.querySelector('.mensagem-erro');
    if (mensagemAnterior) {
        mensagemAnterior.remove();
    }

    if (mensagens.length > 0) {
        const divMensagem = document.createElement('div');
        divMensagem.className = 'mensagem-erro';
        divMensagem.innerHTML = `
            <h4>Por favor, corrija os seguintes campos:</h4>
            <ul>
                ${mensagens.map(msg => `<li>${msg}</li>`).join('')}
            </ul>
        `;

        // Inserir a mensagem antes da seção de entrada
        const inputSection = document.querySelector('.input-section');
        inputSection.parentNode.insertBefore(divMensagem, inputSection);

        // Rolar para a mensagem de erro
        divMensagem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Função para calcular todos os valores
function calcular() {
    // Validar campos primeiro
    const validacao = validarCampos();
    
    if (!validacao.valido) {
        exibirMensagemErro(validacao.erros);
        return;
    }

    // Remover mensagem de erro se existir
    const mensagemErro = document.querySelector('.mensagem-erro');
    if (mensagemErro) {
        mensagemErro.remove();
    }

    // Obter valores de entrada
    const precoCana = parseFloat(document.getElementById('preco-cana').value);
    const produtividadeEsperada = parseFloat(document.getElementById('produtividade-esperada').value);
    const precoCBIO = parseFloat(document.getElementById('preco-cbio').value);
    const areaTotal = parseFloat(document.getElementById('area-total').value);
    const corretivo = document.getElementById('corretivo-tratamento').value;
    const dosePorArea = parseFloat(document.getElementById('dose-por-area').value);
    const intervaloAplicacoes = parseFloat(document.getElementById('intervalo-aplicacoes').value);

    // === CÁLCULOS TRATAMENTO PADRÃO ===
    
    // Produto utilizado (igual ao corretivo selecionado)
    document.getElementById('produto-utilizado-padrao').textContent = corretivo;
    
    // Dose por área (igual ao valor inserido)
    document.getElementById('dose-area-padrao').textContent = formatarNumero(dosePorArea);
    
    // Intervalo (igual ao valor inserido)
    document.getElementById('intervalo-padrao').textContent = formatarNumero(intervaloAplicacoes, 0);
    
    // Preço estimado referência CIF (PROCV)
    const precoEstimadoPadrao = procv(corretivo, tabelaPrecos);
    document.getElementById('preco-estimado-padrao').textContent = formatarNumero(precoEstimadoPadrao);
    
    // Custo (R$/ha) = dose por área * preço estimado / intervalo
    const custoPorHaPadrao = (dosePorArea * precoEstimadoPadrao) / intervaloAplicacoes;
    document.getElementById('custo-ha-padrao').textContent = formatarNumero(custoPorHaPadrao);
    
    // Custo total (R$) = custo por ha * área total
    const custoTotalPadrao = custoPorHaPadrao * areaTotal;
    document.getElementById('custo-total-padrao').textContent = formatarNumero(custoTotalPadrao);
    
    // Produtividade esperada ATR (t/ha) = produtividade esperada * conversão ATR
    const produtividadeATRPadrao = produtividadeEsperada * parametrosOxiflux.conversaoATR;
    document.getElementById('produtividade-atr-padrao').textContent = formatarNumero(produtividadeATRPadrao, 1);
    
    // Receita por área (R$/ha) = preço da cana * produtividade esperada
    const receitaPorAreaPadrao = precoCana * produtividadeEsperada;
    document.getElementById('receita-area-padrao').textContent = formatarNumero(receitaPorAreaPadrao);
    
    // Receita total (R$) = receita por área * área total
    const receitaTotalPadrao = receitaPorAreaPadrao * areaTotal;
    document.getElementById('receita-total-padrao').textContent = formatarNumero(receitaTotalPadrao);
    
    // Ganhos CBIOs (não há para tratamento padrão)
    document.getElementById('ganhos-cbios-ha-padrao').textContent = '-';
    document.getElementById('ganhos-cbios-total-padrao').textContent = '-';
    
    // Receita líquida total = receita total - custo total
    const receitaLiquidaPadrao = receitaTotalPadrao - custoTotalPadrao;
    document.getElementById('receita-liquida-padrao').textContent = formatarNumero(receitaLiquidaPadrao);

    // === CÁLCULOS PROGRAMA CALTEC OXIFLUX ===
    
    // Produto utilizado
    document.getElementById('produto-utilizado-oxiflux').textContent = 'OXIFLUX';
    
    // Dose por área (não especificada na planilha)
    document.getElementById('dose-area-oxiflux').textContent = '-';
    
    // Intervalo
    document.getElementById('intervalo-oxiflux').textContent = parametrosOxiflux.intervalo.toString();
    
    // Preço estimado referência CIF
    document.getElementById('preco-estimado-oxiflux').textContent = formatarNumero(parametrosOxiflux.preco);
    
    // Custo (não especificado na planilha)
    document.getElementById('custo-ha-oxiflux').textContent = '-';
    document.getElementById('custo-total-oxiflux').textContent = '-';
    
    // Produtividade esperada ATR (t/ha) = produtividade OXIFLUX * conversão ATR
    const produtividadeATROxiflux = parametrosOxiflux.produtividade * parametrosOxiflux.conversaoATR;
    document.getElementById('produtividade-atr-oxiflux').textContent = formatarNumero(produtividadeATROxiflux, 1);
    
    // Receita por área (R$/ha) = preço da cana * produtividade OXIFLUX
    const receitaPorAreaOxiflux = precoCana * parametrosOxiflux.produtividade;
    document.getElementById('receita-area-oxiflux').textContent = formatarNumero(receitaPorAreaOxiflux);
    
    // Receita total (R$) = receita por área * área total
    const receitaTotalOxiflux = receitaPorAreaOxiflux * areaTotal;
    document.getElementById('receita-total-oxiflux').textContent = formatarNumero(receitaTotalOxiflux);
    
    // Ganhos CBIOs (ha)
    document.getElementById('ganhos-cbios-ha-oxiflux').textContent = formatarNumero(parametrosOxiflux.ganhosCBIOs);
    
    // Ganhos CBIOs total (R$) = ganhos CBIOs por ha * preço CBIO * área total
    const ganhosCBIOsTotal = parametrosOxiflux.ganhosCBIOs * precoCBIO * areaTotal;
    document.getElementById('ganhos-cbios-total-oxiflux').textContent = formatarNumero(ganhosCBIOsTotal);
    
    // Receita líquida total = receita total + ganhos CBIOs total
    const receitaLiquidaOxiflux = receitaTotalOxiflux + ganhosCBIOsTotal;
    document.getElementById('receita-liquida-oxiflux').textContent = formatarNumero(receitaLiquidaOxiflux);

    // === LUCRO LÍQUIDO TOTAL ===
    const lucroLiquidoTotal = receitaLiquidaOxiflux - receitaLiquidaPadrao;
    document.getElementById('lucro-liquido-total').textContent = formatarNumero(lucroLiquidoTotal);

    // Adicionar classes visuais para campos calculados
    adicionarClassesCalculadas();

    // Exibir seção de resultados com animação
    exibirResultados();
}

// Função para adicionar classes visuais aos campos calculados
function adicionarClassesCalculadas() {
    const camposCalculados = [
        'custo-ha-padrao', 'custo-total-padrao', 'produtividade-atr-padrao',
        'receita-area-padrao', 'receita-total-padrao', 'receita-liquida-padrao',
        'produtividade-atr-oxiflux', 'receita-area-oxiflux', 'receita-total-oxiflux',
        'ganhos-cbios-total-oxiflux', 'receita-liquida-oxiflux'
    ];

    camposCalculados.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento && elemento.parentElement) {
            elemento.parentElement.classList.add('calculated');
        }
    });
}

// Função para exibir a seção de resultados
function exibirResultados() {
    const resultsSection = document.getElementById('results-section');
    resultsSection.classList.remove('hidden');
    
    // Rolar suavemente para os resultados
    setTimeout(() => {
        resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 100);
}

// Função para validar entrada numérica em tempo real
function validarEntradaNumerica(input) {
    const valor = parseFloat(input.value);
    
    // Remover classes anteriores
    input.classList.remove('campo-erro', 'campo-valido');
    
    if (input.value.trim() === '') {
        // Campo vazio - sem estilo especial
        return;
    }
    
    if (isNaN(valor) || valor <= 0) {
        input.classList.add('campo-erro');
    } else {
        input.classList.add('campo-valido');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Event listener para o botão calcular
    const btnCalcular = document.getElementById('btn-calcular');
    if (btnCalcular) {
        btnCalcular.addEventListener('click', calcular);
    }

    // Event listeners para validação em tempo real dos campos numéricos
    const camposNumericos = document.querySelectorAll('input[type="number"]');
    camposNumericos.forEach(campo => {
        campo.addEventListener('blur', function() {
            validarEntradaNumerica(this);
        });
        
        campo.addEventListener('input', function() {
            // Remover classe de erro quando o usuário começar a digitar
            this.classList.remove('campo-erro');
        });
    });

    // Event listener para o select
    const selectCorretivo = document.getElementById('corretivo-tratamento');
    if (selectCorretivo) {
        selectCorretivo.addEventListener('change', function() {
            this.classList.remove('campo-erro');
            if (this.value) {
                this.classList.add('campo-valido');
            }
        });
    }

    // Adicionar estilos CSS dinamicamente para os estados de validação
    const style = document.createElement('style');
    style.textContent = `
        .campo-erro {
            border-color: #e74c3c !important;
            background-color: #fdf2f2 !important;
            box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1) !important;
        }
        
        .campo-valido {
            border-color: #27ae60 !important;
            background-color: #f2fdf2 !important;
        }
        
        .mensagem-erro {
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
        }
        
        .mensagem-erro h4 {
            margin-bottom: 10px;
            font-size: 1.1rem;
        }
        
        .mensagem-erro ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .mensagem-erro li {
            margin-bottom: 5px;
        }
    `;
    document.head.appendChild(style);
});

