namespace PetCareJordan.Api.Models;

public class AppointmentRequest
{
    public int Id { get; set; }
    public int PetId { get; set; }
    public Pet? Pet { get; set; }
    public int OwnerId { get; set; }
    public AppUser? Owner { get; set; }
    public int VetId { get; set; }
    public AppUser? Vet { get; set; }
    public DateTime PreferredDateUtc { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string OwnerNotes { get; set; } = string.Empty;
    public string VetNotes { get; set; } = string.Empty;
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}
