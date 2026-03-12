document.addEventListener('DOMContentLoaded', carregarLinks);
body: JSON.stringify({ Id: id, NovaUrl: novaUrl })

async function carregarLinks() {
    try {
        const response = await fetch('/api/links');

        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }

        const links = await response.json();
        const corpo = document.getElementById('tabelaCorpo');

        if (!corpo) return;
        corpo.innerHTML = '';

        links.forEach(link => {
            const data = new Date(link.createdAt).toLocaleDateString('pt-BR');
            const linkCompleto = `${window.location.origin}/${link.shortCode}`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
    <td>
        <span class="text-truncate d-inline-block" style="max-width: 200px;" title="${link.longUrl}">
            ${link.longUrl}
        </span>
    </td>
    <td>
        <div class="d-flex align-items-center gap-2">
            <span class="fw-bold text-primary">/${link.shortCode}</span>
            <button type="button" class="btn btn-outline-primary btn-sm" onclick="copyToClipboard('${linkCompleto}', this)">Copiar</button>
            <a href="${linkCompleto}" target="_blank" class="btn btn-outline-secondary btn-sm">Acessar</a>
            <button type="button" class="btn btn-outline-dark btn-sm" onclick="gerarQRCode('${linkCompleto}')">
    <i class="bi bi-qr-code"></i> QR
</button>
        </div>
    </td>
    <td class="text-center">
        <span class="badge rounded-pill bg-success">${link.clickCount || 0}</span>
    </td>
    <td class="text-muted small">${data}</td>
    <td>
    <button type="button" class="btn btn-outline-warning btn-sm" onclick="editarRapido('${link.id}', '${link.longUrl}')">
    Editar
</button>
        <button type="button" class="btn btn-outline-danger btn-sm" onclick="deletarLink('${link.id}', this)">
            Excluir
        </button>
    </td>
`;
            corpo.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro ao carregar links:", error);
    }
}

// ESTA FUNÇÃO TEM QUE ESTAR FORA DE TUDO NO FINAL DO ARQUIVO
function copyToClipboard(texto, elemento) {
    navigator.clipboard.writeText(texto).then(() => {
        // Feedback visual no botão
        const textoOriginal = elemento.innerHTML;
        elemento.innerText = "Copiado!";
        elemento.classList.replace('btn-outline-primary', 'btn-success');

        setTimeout(() => {
            elemento.innerHTML = textoOriginal;
            elemento.classList.replace('btn-success', 'btn-outline-primary');
        }, 2000);
    }).catch(err => {
        console.error("Erro ao copiar:", err);
        alert("Não foi possível copiar o link.");
    });
}

async function encurtar() {
    const urlOriginal = document.getElementById('urlInput').value;
    if (!urlOriginal) return alert("Por favor, cole uma URL!");

    const response = await fetch(`/shorten?url=${encodeURIComponent(urlOriginal)}`, {
        method: 'POST'
    });

    if (response.ok) {
        document.getElementById('urlInput').value = '';
        carregarLinks();
    } else {
        alert("Erro ao encurtar.");
    }
}

async function deletarLink(id, elemento) {
    if (!confirm("Deseja realmente excluir este link?")) return;

    try {
        const response = await fetch(`/api/links/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            elemento.closest('tr').remove(); // Remove a linha da tabela
        } else {
            alert("Erro ao excluir o link no servidor.");
        }
    } catch (error) {
        console.error("Erro:", error);
    }
}

function gerarQRCode(url) {
    // Usamos a API do goqr.me que é gratuita
    // Parâmetros: size (tamanho) e data (a URL)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

    // Abre o QR Code em uma janelinha pequena (pop-up)
    const largura = 250;
    const altura = 300;
    const esquerda = (screen.width / 2) - (largura / 2);
    const topo = (screen.height / 2) - (altura / 2);

    window.open(qrUrl, 'QRCode', `width=${largura},height=${altura},top=${topo},left=${esquerda}`);
}

function filtrarTabela() {
    const input = document.getElementById('buscaInput');
    const filtro = input.value.toLowerCase();
    const tabela = document.getElementById('tabelaCorpo');
    const linhas = tabela.getElementsByTagName('tr');

    for (let i = 0; i < linhas.length; i++) {
        // Pegamos o texto da URL Original e do Link Curto
        const colUrl = linhas[i].getElementsByTagName('td')[0];
        const colCodigo = linhas[i].getElementsByTagName('td')[1];

        if (colUrl || colCodigo) {
            const textoUrl = colUrl.textContent || colUrl.innerText;
            const textoCodigo = colCodigo.textContent || colCodigo.innerText;

            // Se o filtro bater com qualquer uma das colunas, mostra a linha, senão esconde
            if (textoUrl.toLowerCase().indexOf(filtro) > -1 ||
                textoCodigo.toLowerCase().indexOf(filtro) > -1) {
                linhas[i].style.display = "";
            } else {
                linhas[i].style.display = "none";
            }
        }
    }
}


async function editarRapido(idLink, urlAtual) {
    // 1. Usamos idLink para não confundir com a palavra reservada 'id'
    const novaUrl = prompt("Digite a nova URL:", urlAtual);

    if (!novaUrl || novaUrl === urlAtual) return;

    try {
        const response = await fetch('/api/links/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Enviamos um objeto completo com Id e NovaUrl
            body: JSON.stringify({
                Id: idLink,
                NovaUrl: novaUrl
            })
        });

        if (response.ok) {
            alert("URL atualizada com sucesso!");
            carregarLinks();
        } else {
            alert("Erro ao salvar: " + response.status);
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
}

function logout() {
    document.cookie.split(";").forEach(function (c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = '/';
}