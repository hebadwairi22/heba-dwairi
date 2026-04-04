using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using PetCareJordan.Api.Models;

namespace PetCareJordan.Api.Services;

public static class ControllerSecurityExtensions
{
    public static int GetCurrentUserId(this ControllerBase controller)
    {
        var raw = controller.User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(raw, out var userId) ? userId : 0;
    }

    public static bool IsInRole(this ControllerBase controller, UserRole role) =>
        string.Equals(controller.User.FindFirstValue(ClaimTypes.Role), role.ToString(), StringComparison.OrdinalIgnoreCase);

    public static bool CanAccessUser(this ControllerBase controller, int userId) =>
        controller.GetCurrentUserId() == userId || controller.IsInRole(UserRole.Admin);

    public static bool CanManageVetCase(this ControllerBase controller, int vetId) =>
        controller.GetCurrentUserId() == vetId || controller.IsInRole(UserRole.Admin);
}
