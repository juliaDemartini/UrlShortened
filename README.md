# 🔗 URLShortener - Encurtador de Links Full Stack

Este projeto é um encurtador de links moderno desenvolvido com **ASP.NET Core 9** e **SQLite**. Ele permite que usuários se cadastrem, façam login e gerenciem seus próprios links encurtados com um dashboard intuitivo e funcional.

## 🚀 Funcionalidades

* **Autenticação Completa:** Cadastro e Login de usuários utilizando ASP.NET Core Identity.
* **Encurtamento de URLs:** Geração de códigos curtos únicos para URLs longas.
* **Dashboard do Usuário:** Listagem de links criados com data e link original.
* **Cópia Rápida:** Botão "Copiar" integrado para facilitar o compartilhamento.
* **Redirecionamento:** Sistema de rotas que encaminha o link curto para o destino final.
* **Interface Moderna:** Desenvolvido com Bootstrap 5 e CSS personalizado.

## 🛠️ Tecnologias Utilizadas

### Backend
* **C# / .NET 9** (Minimal APIs)
* **Entity Framework Core** (ORM)
* **SQLite** (Banco de dados local)
* **ASP.NET Core Identity** (Segurança)

### Frontend
* **HTML5 & CSS3**
* **JavaScript (ES6+)**
* **Bootstrap 5** (Estilização)

## 🏗️ Estrutura do Projeto

* `/wwwroot`: Arquivos estáticos (HTML, CSS, JavaScript).
* `/Data`: Contexto do banco de dados e migrações do EF Core.
* `/Models`: Classes de modelo (User, ShortenedUrl).
* `Program.cs`: Configuração central de rotas, middlewares e serviços.

## 🔧 Como Executar

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/UrlShortener.git](https://github.com/seu-usuario/UrlShortener.git)
    ```
2.  **Restaure as dependências e execute:**
    ```bash
    dotnet watch run
    ```
3.  **Acesse no navegador:**
    `https://localhost:7056` (ou a porta exibida no console).

## 👩‍💻 Autora

**Julia**
* 🎓 Graduada em Análise e Desenvolvimento de Sistemas.
* 🚀 Estudante de Engenharia de Software.
* 📜 AWS Certified Cloud Practitioner.

---
*Este projeto foi desenvolvido para fins de estudo sobre roteamento, persistência de dados e autenticação em ambiente .NET.*
