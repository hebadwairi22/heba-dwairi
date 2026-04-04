using PetCareJordan.Api.Models;

namespace PetCareJordan.Api.Dtos;

public record AppointmentSummaryDto(
    int Id,
    int PetId,
    string PetName,
    string PetType,
    string PetPhotoUrl,
    int OwnerId,
    string OwnerName,
    string OwnerPhone,
    int VetId,
    string VetName,
    DateTime PreferredDateUtc,
    AppointmentStatus Status,
    string Reason,
    string OwnerNotes,
    string VetNotes,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    int MessageCount);

public record ChatMessageDto(
    int Id,
    int AppointmentRequestId,
    int SenderId,
    string SenderName,
    UserRole SenderRole,
    string Message,
    DateTime SentAtUtc);

public record AppointmentDetailsDto(
    AppointmentSummaryDto Appointment,
    IEnumerable<ChatMessageDto> Messages);

public record CreateAppointmentRequest(
    int PetId,
    int OwnerId,
    int VetId,
    DateTime PreferredDateUtc,
    string Reason,
    string OwnerNotes);

public record UpdateAppointmentStatusRequest(
    AppointmentStatus Status,
    string VetNotes);

public record SendChatMessageRequest(
    int SenderId,
    string Message);

public record AdminWorkflowSummaryDto(
    int TotalAppointments,
    int PendingAppointments,
    int ActiveVetCases,
    int CompletedAppointments,
    int TotalMessages,
    IEnumerable<AppointmentSummaryDto> RecentAppointments);
