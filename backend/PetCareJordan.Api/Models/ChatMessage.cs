namespace PetCareJordan.Api.Models;

public class ChatMessage
{
    public int Id { get; set; }
    public int AppointmentRequestId { get; set; }
    public AppointmentRequest? AppointmentRequest { get; set; }
    public int SenderId { get; set; }
    public AppUser? Sender { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? ImageDataUrl { get; set; }
    public DateTime SentAtUtc { get; set; }
}
