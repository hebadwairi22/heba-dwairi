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
public class AuthController(PetCareJordanContext context, PasswordService passwordService, JwtTokenService jwtTokenService) : ControllerBase
{
    [Authorize]
    [HttpGet("vets")]
    public async Task<ActionResult<IEnumerable<UserLookupDto>>> GetVets()
    {
        var vets = await context.Users
            .Where(item => item.Role == UserRole.Vet)
            .OrderBy(item => item.FullName)
            .Select(item => new UserLookupDto(item.Id, item.FullName, item.Email, item.PhoneNumber, item.City, item.Role))
            .ToListAsync();

        return Ok(vets);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await context.Users
            .FirstOrDefaultAsync(item => item.Email == request.Email);

        if (user is null || !passwordService.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid email or password.");
        }

        return Ok(CreateAuthResponse(user));
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        if (request.Role == UserRole.Admin)
        {
            return BadRequest("Admin accounts cannot be created from public registration.");
        }

        var emailExists = await context.Users.AnyAsync(item => item.Email == request.Email);
        if (emailExists)
        {
            return Conflict("A user with this email already exists.");
        }

        var user = new AppUser
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = passwordService.HashPassword(request.Password),
            PhoneNumber = request.PhoneNumber,
            City = request.City,
            Role = request.Role
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(Login), CreateAuthResponse(user));
    }

    private AuthResponse CreateAuthResponse(AppUser user) =>
        new(user.Id, user.FullName, user.Email, user.City, user.PhoneNumber, user.Role, jwtTokenService.CreateToken(user));
}
