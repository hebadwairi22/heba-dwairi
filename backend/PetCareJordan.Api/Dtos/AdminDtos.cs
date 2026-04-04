using PetCareJordan.Api.Models;

namespace PetCareJordan.Api.Dtos;

public record AdminUserDto(
    int Id,
    string FullName,
    string Email,
    string PhoneNumber,
    string City,
    UserRole Role,
    int OwnedPetCount,
    int OwnerAppointmentCount,
    int VetAppointmentCount);

public record UpdateUserRoleRequest(UserRole Role);

public record AdminCommunityReportDto(
    int Id,
    string ReportKind,
    string Title,
    string Description,
    string Place,
    DateTime ReportDateUtc,
    string ContactName,
    string ContactPhone,
    ReportStatus Status);

public record UpdateReportStatusRequest(ReportStatus Status);
