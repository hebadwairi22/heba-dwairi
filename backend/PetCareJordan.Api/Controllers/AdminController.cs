using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareJordan.Api.Data;
using PetCareJordan.Api.Dtos;
using PetCareJordan.Api.Models;

namespace PetCareJordan.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController(PetCareJordanContext context) : ControllerBase
{
    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<AdminUserDto>>> GetUsers()
    {
        var users = await context.Users
            .OrderBy(item => item.FullName)
            .Select(item => new AdminUserDto(
                item.Id,
                item.FullName,
                item.Email,
                item.PhoneNumber,
                item.City,
                item.Role,
                item.OwnedPets.Count,
                item.OwnedAppointments.Count,
                item.VetAppointments.Count))
            .ToListAsync();

        return Ok(users);
    }

    [HttpPut("users/{userId:int}/role")]
    public async Task<ActionResult<AdminUserDto>> UpdateUserRole(int userId, UpdateUserRoleRequest request)
    {
        var user = await context.Users
            .Include(item => item.OwnedPets)
            .Include(item => item.OwnedAppointments)
            .Include(item => item.VetAppointments)
            .FirstOrDefaultAsync(item => item.Id == userId);

        if (user is null)
        {
            return NotFound();
        }

        user.Role = request.Role;
        await context.SaveChangesAsync();

        return Ok(new AdminUserDto(
            user.Id,
            user.FullName,
            user.Email,
            user.PhoneNumber,
            user.City,
            user.Role,
            user.OwnedPets.Count,
            user.OwnedAppointments.Count,
            user.VetAppointments.Count));
    }

    [HttpGet("reports")]
    public async Task<ActionResult<IEnumerable<AdminCommunityReportDto>>> GetReports()
    {
        var lostReports = await context.LostPetReports
            .Select(item => new AdminCommunityReportDto(
                item.Id,
                "Lost",
                item.PetName,
                item.Description,
                item.LastSeenPlace,
                item.LastSeenDateUtc,
                item.ContactName,
                item.ContactPhone,
                item.Status))
            .ToListAsync();

        var foundReports = await context.FoundPetReports
            .Select(item => new AdminCommunityReportDto(
                item.Id,
                "Found",
                item.PetType.ToString(),
                item.Description,
                item.FoundPlace,
                item.FoundDateUtc,
                item.ContactName,
                item.ContactPhone,
                item.Status))
            .ToListAsync();

        return Ok(lostReports.Concat(foundReports).OrderByDescending(item => item.ReportDateUtc));
    }

    [HttpPut("reports/{reportKind}/{reportId:int}")]
    public async Task<ActionResult<AdminCommunityReportDto>> UpdateReportStatus(string reportKind, int reportId, UpdateReportStatusRequest request)
    {
        if (reportKind.Equals("lost", StringComparison.OrdinalIgnoreCase))
        {
            var report = await context.LostPetReports.FirstOrDefaultAsync(item => item.Id == reportId);
            if (report is null)
            {
                return NotFound();
            }

            report.Status = request.Status;
            await context.SaveChangesAsync();

            return Ok(new AdminCommunityReportDto(report.Id, "Lost", report.PetName, report.Description, report.LastSeenPlace, report.LastSeenDateUtc, report.ContactName, report.ContactPhone, report.Status));
        }

        if (reportKind.Equals("found", StringComparison.OrdinalIgnoreCase))
        {
            var report = await context.FoundPetReports.FirstOrDefaultAsync(item => item.Id == reportId);
            if (report is null)
            {
                return NotFound();
            }

            report.Status = request.Status;
            await context.SaveChangesAsync();

            return Ok(new AdminCommunityReportDto(report.Id, "Found", report.PetType.ToString(), report.Description, report.FoundPlace, report.FoundDateUtc, report.ContactName, report.ContactPhone, report.Status));
        }

        return BadRequest("Report kind must be 'lost' or 'found'.");
    }
}
