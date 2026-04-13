namespace PetCareJordan.Api.Models;

public class OwnerMessage
{
    public int Id { get; set; }
    public int AdoptionListingId { get; set; }
    public AdoptionListing? AdoptionListing { get; set; }
    public int SenderId { get; set; }
    public AppUser? Sender { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime SentAtUtc { get; set; }
}
