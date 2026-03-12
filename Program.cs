using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using UrlShortener;

var builder = WebApplication.CreateBuilder(args);

// 1. Configura o Banco
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=urls.db"));

// 2. Configura o Identity
builder.Services.AddAuthorization();
builder.Services.AddIdentityApiEndpoints<IdentityUser>()
    .AddEntityFrameworkStores<AppDbContext>();

var app = builder.Build();


// --- 3. Inicializa o Banco com Proteção ---
try
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Console.WriteLine("--> [DEBUG] Verificando conexão com o banco...");

        db.Database.EnsureCreated();

        Console.WriteLine("--> [DEBUG] Banco de dados pronto e tabelas verificadas!");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"\n!!! ERRO FATAL AO INICIAR O BANCO !!!");
    Console.WriteLine($"Mensagem: {ex.Message}");
    Console.WriteLine("---------------------------------------");
    // Isso impede que o console feche sozinho para você conseguir ler o erro
    Console.WriteLine("Pressione qualquer tecla para encerrar...");
    Console.ReadKey();
    return;
}

// --- PRIORIDADE MÁXIMA: ARQUIVOS ESTÁTICOS ---
// Colocamos aqui em cima para o .NET tentar ler o arquivo ANTES de qualquer rota de API
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication(); // <-- Garanta que estas linhas estão aqui!
app.UseAuthorization();

// --- ATALHOS MANUAIS (Para garantir que abra agora) ---
app.MapGet("/cadastro", () => Results.File(Path.Combine(app.Environment.WebRootPath, "cadastro.html"), "text/html"));
app.MapGet("/login", () => Results.File(Path.Combine(app.Environment.WebRootPath, "login.html"), "text/html"));
// Adicione esta linha no seu Program.cs
app.MapGet("/app", (IWebHostEnvironment env) =>
{
    // Path.Combine garante que o caminho funcione independente do Windows ou Linux
    var filePath = Path.Combine(env.ContentRootPath, "wwwroot", "app.html");

    if (!File.Exists(filePath))
    {
        return Results.Text($"Erro técnico: O arquivo não existe em: {filePath}");
    }

    return Results.File(filePath, "text/html");
});

// --- ROTAS DE API ---
app.MapGroup("/auth").MapIdentityApi<IdentityUser>();

app.MapGet("/api/links", async (AppDbContext db, ClaimsPrincipal user) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    return await db.Urls
        .Where(u => u.UserId == userId)
        .OrderByDescending(u => u.CreatedAt)
        .ToListAsync();
}).RequireAuthorization();

app.MapPost("/shorten", async (string url, HttpContext httpContext, AppDbContext db, ClaimsPrincipal user) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    var novoLink = new ShortenedUrl
    {
        Id = Guid.NewGuid(),
        LongUrl = url,
        ShortCode = UrlService.GenerateShortCode(),
        CreatedAt = DateTime.Now,
        UserId = userId
    };
    db.Urls.Add(novoLink);
    await db.SaveChangesAsync();

    var request = httpContext.Request;
    var baseUrl = $"{request.Scheme}://{request.Host}";
    var urlCompleta = $"{baseUrl}/{novoLink.ShortCode}";

    return Results.Ok(new { UrlCurta = urlCompleta });
}).RequireAuthorization();

app.MapDelete("/api/links/{id}", async (Guid id, AppDbContext db, ClaimsPrincipal user) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);

    // Busca o link pelo ID e garante que ele pertence ao usuário logado
    var link = await db.Urls.FirstOrDefaultAsync(u => u.Id == id && u.UserId == userId);

    if (link == null)
    {
        return Results.NotFound("Link não encontrado ou você não tem permissão.");
    }

    db.Urls.Remove(link);
    await db.SaveChangesAsync();

    return Results.NoContent(); // Sucesso (204)
}).RequireAuthorization();

// Rota fixa: sem {id} na URL para não dar conflito
app.MapPost("/api/links/update", async (EditUrlRequest request, AppDbContext db, ClaimsPrincipal user) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);

    // O ID agora vem dentro do corpo do JSON (request.Id)
    var link = await db.Urls.FirstOrDefaultAsync(u => u.Id == request.Id && u.UserId == userId);

    if (link == null) return Results.NotFound("Link não encontrado.");

    link.LongUrl = request.NovaUrl;
    await db.SaveChangesAsync();

    return Results.NoContent();
}).RequireAuthorization();

// Ajuste o record para incluir o Id



// --- ROTA DE REDIRECIONAMENTO (Protegida) ---
app.MapGet("/{code}", async (string code, AppDbContext db) =>
{
    // LOG: Veja se o servidor sequer recebe o pedido
    Console.WriteLine($"==> Rota /{code} acessada!");

    // Filtro para não confundir arquivos ou rotas fixas com encurtadores
    if (code.Contains('.') || code == "cadastro" || code == "login" || code == "app")
    {
        Console.WriteLine("==> Ignorado: É um arquivo ou rota fixa.");
        return Results.NotFound();
    }

    var link = await db.Urls.FirstOrDefaultAsync(x => x.ShortCode == code);

    if (link != null)
    {
        // --- NOVO: Incrementa o contador de cliques ---
        link.ClickCount++; // Adiciona 1 ao valor atual
        await db.SaveChangesAsync(); // Salva a mudança no banco de dados
        // ----------------------------------------------

        Console.WriteLine($"==> SUCESSO! Cliques: {link.ClickCount} | Redirecionando para: {link.LongUrl}");
        return Results.Redirect(link.LongUrl);
    }

    Console.WriteLine($"==> ERRO: Código '{code}' não existe no banco.");
    return Results.NotFound("Link não encontrado!");
});

Console.WriteLine("--> O servidor vai começar a rodar agora!");
app.Run();

// Ajuste o record lá embaixo:
public record EditUrlRequest(Guid Id, string NovaUrl);