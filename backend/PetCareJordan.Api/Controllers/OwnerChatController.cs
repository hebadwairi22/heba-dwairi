using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareJordan.Api.Data;
using PetCareJordan.Api.Models;

namespace PetCareJordan.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OwnerChatController(PetCareJordanContext context) : ControllerBase
{
    public record OwnerMessageDto(int Id, int AdoptionListingId, int SenderId, string SenderName, string Message, DateTime SentAtUtc);
    public record SendOwnerMessageRequest(int AdoptionListingId, string Message);

    [HttpGet("{adoptionListingId}")]
    public async Task<ActionResult<IEnumerable<OwnerMessageDto>>> GetMessages(int adoptionListingId)
    {
        var messages = await context.OwnerMessages
            .Where(m => m.AdoptionListingId == adoptionListingId)
            .Include(m => m.Sender)
            .OrderBy(m => m.SentAtUtc)
            .Select(m => new OwnerMessageDto(m.Id, m.AdoptionListingId, m.SenderId, m.Sender!.FullName, m.Message, m.SentAtUtc))
            .ToListAsync();

        return Ok(messages);
    }

    [HttpPost]
    public async Task<ActionResult<OwnerMessageDto>> SendMessage(SendOwnerMessageRequest request)
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        if (userIdClaim is null) return Unauthorized();

        var userId = int.Parse(userIdClaim);
        var user = await context.Users.FindAsync(userId);
        if (user is null) return Unauthorized();

        var listing = await context.AdoptionListings.FindAsync(request.AdoptionListingId);
        if (listing is null) return BadRequest("Adoption listing not found.");

        var message = new OwnerMessage
        {
            AdoptionListingId = request.AdoptionListingId,
            SenderId = userId,
            Message = request.Message,
            SentAtUtc = DateTime.UtcNow
        };

        context.OwnerMessages.Add(message);
        await context.SaveChangesAsync();

        return Ok(new OwnerMessageDto(message.Id, message.AdoptionListingId, message.SenderId, user.FullName, message.Message, message.SentAtUtc));
    }
}
