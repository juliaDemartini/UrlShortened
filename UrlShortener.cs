namespace UrlShortener; // O nome do seu projeto

public static class UrlService
{
    public static string GenerateShortCode()
    {
        // Pega os primeiros 7 caracteres de um Guid para o código
        return Guid.NewGuid().ToString().Substring(0, 7);
    }
}