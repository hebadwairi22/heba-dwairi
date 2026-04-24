using Microsoft.EntityFrameworkCore;

namespace PetCareJordan.Api.Data;

public static class DatabaseBootstrapper
{
    public static async Task InitializeAsync(PetCareJordanContext context)
    {
        // For development: Fresh start to pick up new schema and seed data
        await context.Database.EnsureDeletedAsync();
        await context.Database.EnsureCreatedAsync();
    }
}
