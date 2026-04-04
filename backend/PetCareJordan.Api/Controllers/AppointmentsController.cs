using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareJordan.Api.Data;
using PetCareJordan.Api.Dtos;
using PetCareJordan.Api.Models;
using PetCareJordan.Api.Services;

namespace PetCareJordan.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentsController(PetCareJordanContext context) : ControllerBase
{
    [HttpGet("owner/{ownerId:int}")]
    public async Task<ActionResult<IEnumerable<AppointmentSummaryDto>>> GetOwnerAppointments(int ownerId)
    {
        if (!this.CanAccessUser(ownerId))
        {
            return Forbid();
        }

        var appointments = await BuildAppointmentQuery()
            .Where(item => item.OwnerId == ownerId)
            .ToListAsync();

        return Ok(appointments);
    }

    [HttpGet("vet/{vetId:int}")]
    public async Task<ActionResult<IEnumerable<AppointmentSummaryDto>>> GetVetAppointments(int vetId)
    {
        if (!this.CanManageVetCase(vetId))
        {
            return Forbid();
        }

        var appointments = await BuildAppointmentQuery()
            .Where(item => item.VetId == vetId)
            .ToListAsync();

        return Ok(appointments);
    }

    [HttpGet("{appointmentId:int}")]
    public async Task<ActionResult<AppointmentDetailsDto>> GetAppointmentDetails(int appointmentId)
    {
        var appointment = await BuildAppointmentQuery()
            .FirstOrDefaultAsync(item => item.Id == appointmentId);

        if (appointment is null)
        {
            return NotFound();
        }

        if (!this.CanAccessUser(appointment.OwnerId) && !this.CanManageVetCase(appointment.VetId))
        {
            return Forbid();
        }

        var messages = await context.ChatMessages
            .Where(item => item.AppointmentRequestId == appointmentId)
            .Include(item => item.Sender)
            .OrderBy(item => item.SentAtUtc)
            .Select(item => new ChatMessageDto(
                item.Id,
                item.AppointmentRequestId,
                item.SenderId,
                item.Sender!.FullName,
                item.Sender.Role,
                item.Message,
                item.SentAtUtc))
            .ToListAsync();

        return Ok(new AppointmentDetailsDto(appointment, messages));
    }

    [HttpPost]
    public async Task<ActionResult<AppointmentSummaryDto>> CreateAppointment(CreateAppointmentRequest request)
    {
        if (!this.CanAccessUser(request.OwnerId))
        {
            return Forbid();
        }

        var pet = await context.Pets.Include(item => item.Owner).FirstOrDefaultAsync(item => item.Id == request.PetId);
        var owner = await context.Users.FirstOrDefaultAsync(item => item.Id == request.OwnerId);
        var vet = await context.Users.FirstOrDefaultAsync(item => item.Id == request.VetId && item.Role == UserRole.Vet);

        if (pet is null || owner is null || vet is null)
        {
            return BadRequest("Valid pet, owner, and vet are required.");
        }

        if (pet.OwnerId != owner.Id)
        {
            return BadRequest("The selected pet does not belong to this owner.");
        }

        var appointment = new AppointmentRequest
        {
            PetId = request.PetId,
            OwnerId = request.OwnerId,
            VetId = request.VetId,
            PreferredDateUtc = request.PreferredDateUtc,
            Reason = request.Reason.Trim(),
            OwnerNotes = request.OwnerNotes.Trim(),
            VetNotes = string.Empty,
            Status = AppointmentStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow
        };

        context.AppointmentRequests.Add(appointment);
        await context.SaveChangesAsync();

        context.Notifications.Add(new Notification
        {
            UserId = vet.Id,
            Type = NotificationType.AppointmentUpdate,
            Title = $"New appointment request for {pet.Name}",
            Message = $"{owner.FullName} requested an appointment for {request.PreferredDateUtc:dd MMM yyyy}.",
            TriggerDateUtc = DateTime.UtcNow,
            IsRead = false
        });
        await context.SaveChangesAsync();

        var result = await BuildAppointmentQuery().FirstAsync(item => item.Id == appointment.Id);
        return CreatedAtAction(nameof(GetAppointmentDetails), new { appointmentId = appointment.Id }, result);
    }

    [HttpPut("{appointmentId:int}/status")]
    public async Task<ActionResult<AppointmentSummaryDto>> UpdateAppointmentStatus(int appointmentId, UpdateAppointmentStatusRequest request)
    {
        var appointment = await context.AppointmentRequests
            .Include(item => item.Pet)
            .Include(item => item.Owner)
            .FirstOrDefaultAsync(item => item.Id == appointmentId);

        if (appointment is null || appointment.Owner is null || appointment.Pet is null)
        {
            return NotFound();
        }

        if (!this.CanManageVetCase(appointment.VetId))
        {
            return Forbid();
        }

        appointment.Status = request.Status;
        appointment.VetNotes = request.VetNotes.Trim();
        appointment.UpdatedAtUtc = DateTime.UtcNow;
        await context.SaveChangesAsync();

        context.Notifications.Add(new Notification
        {
            UserId = appointment.OwnerId,
            Type = NotificationType.AppointmentUpdate,
            Title = $"Appointment update for {appointment.Pet.Name}",
            Message = $"Status changed to {appointment.Status}.",
            TriggerDateUtc = DateTime.UtcNow,
            IsRead = false
        });
        await context.SaveChangesAsync();

        var result = await BuildAppointmentQuery().FirstAsync(item => item.Id == appointment.Id);
        return Ok(result);
    }

    [HttpPost("{appointmentId:int}/messages")]
    public async Task<ActionResult<ChatMessageDto>> SendMessage(int appointmentId, SendChatMessageRequest request)
    {
        if (!this.CanAccessUser(request.SenderId))
        {
            return Forbid();
        }

        var appointment = await context.AppointmentRequests.FirstOrDefaultAsync(item => item.Id == appointmentId);
        var sender = await context.Users.FirstOrDefaultAsync(item => item.Id == request.SenderId);

        if (appointment is null || sender is null)
        {
            return BadRequest("Appointment and sender are required.");
        }

        var isParticipant = appointment.OwnerId == sender.Id || appointment.VetId == sender.Id;
        if (!isParticipant)
        {
            return BadRequest("Only the owner or assigned vet can send messages in this chat.");
        }

        var message = new ChatMessage
        {
            AppointmentRequestId = appointmentId,
            SenderId = request.SenderId,
            Message = request.Message.Trim(),
            SentAtUtc = DateTime.UtcNow
        };

        context.ChatMessages.Add(message);
        appointment.UpdatedAtUtc = DateTime.UtcNow;
        if (appointment.Status == AppointmentStatus.Confirmed)
        {
            appointment.Status = AppointmentStatus.InProgress;
        }

        await context.SaveChangesAsync();

        return Ok(new ChatMessageDto(
            message.Id,
            message.AppointmentRequestId,
            message.SenderId,
            sender.FullName,
            sender.Role,
            message.Message,
            message.SentAtUtc));
    }

    [HttpGet("admin/summary")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AdminWorkflowSummaryDto>> GetAdminSummary()
    {
        var recentAppointments = await BuildAppointmentQuery()
            .Take(8)
            .ToListAsync();

        var summary = new AdminWorkflowSummaryDto(
            await context.AppointmentRequests.CountAsync(),
            await context.AppointmentRequests.CountAsync(item => item.Status == AppointmentStatus.Pending),
            await context.AppointmentRequests.CountAsync(item => item.Status == AppointmentStatus.Confirmed || item.Status == AppointmentStatus.InProgress),
            await context.AppointmentRequests.CountAsync(item => item.Status == AppointmentStatus.Completed),
            await context.ChatMessages.CountAsync(),
            recentAppointments);

        return Ok(summary);
    }

    private IQueryable<AppointmentSummaryDto> BuildAppointmentQuery()
    {
        return context.AppointmentRequests
            .Include(item => item.Pet)
            .Include(item => item.Owner)
            .Include(item => item.Vet)
            .Include(item => item.Messages)
            .OrderByDescending(item => item.CreatedAtUtc)
            .Select(item => new AppointmentSummaryDto(
                item.Id,
                item.PetId,
                item.Pet!.Name,
                item.Pet.Type.ToString(),
                item.Pet.PhotoUrl,
                item.OwnerId,
                item.Owner!.FullName,
                item.Owner.PhoneNumber,
                item.VetId,
                item.Vet!.FullName,
                item.PreferredDateUtc,
                item.Status,
                item.Reason,
                item.OwnerNotes,
                item.VetNotes,
                item.CreatedAtUtc,
                item.UpdatedAtUtc,
                item.Messages.Count));
    }
}
