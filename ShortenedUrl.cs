public class ShortenedUrl
{
    public Guid Id { get; set; }
    public string LongUrl { get; set; } = string.Empty;
    public string ShortCode { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? UserId { get; set; }
    public int ClickCount { get; set; } = 0;
}