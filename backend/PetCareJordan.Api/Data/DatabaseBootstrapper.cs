using Microsoft.EntityFrameworkCore;

namespace PetCareJordan.Api.Data;

public static class DatabaseBootstrapper
{
    public static async Task InitializeAsync(PetCareJordanContext context)
    {
        await context.Database.EnsureCreatedAsync();
        await EnsureAppointmentTablesAsync(context);
    }

    private static async Task EnsureAppointmentTablesAsync(PetCareJordanContext context)
    {
        const string sql = """
            IF OBJECT_ID(N'[AppointmentRequests]', N'U') IS NULL
            BEGIN
                CREATE TABLE [AppointmentRequests] (
                    [Id] int NOT NULL IDENTITY,
                    [PetId] int NOT NULL,
                    [OwnerId] int NOT NULL,
                    [VetId] int NOT NULL,
                    [PreferredDateUtc] datetime2 NOT NULL,
                    [Reason] nvarchar(max) NOT NULL,
                    [OwnerNotes] nvarchar(max) NOT NULL,
                    [VetNotes] nvarchar(max) NOT NULL,
                    [Status] int NOT NULL,
                    [CreatedAtUtc] datetime2 NOT NULL,
                    [UpdatedAtUtc] datetime2 NULL,
                    CONSTRAINT [PK_AppointmentRequests] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_AppointmentRequests_Pets_PetId] FOREIGN KEY ([PetId]) REFERENCES [Pets] ([Id]) ON DELETE NO ACTION,
                    CONSTRAINT [FK_AppointmentRequests_Users_OwnerId] FOREIGN KEY ([OwnerId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION,
                    CONSTRAINT [FK_AppointmentRequests_Users_VetId] FOREIGN KEY ([VetId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
                );

                CREATE INDEX [IX_AppointmentRequests_OwnerId] ON [AppointmentRequests] ([OwnerId]);
                CREATE INDEX [IX_AppointmentRequests_PetId] ON [AppointmentRequests] ([PetId]);
                CREATE INDEX [IX_AppointmentRequests_VetId] ON [AppointmentRequests] ([VetId]);
            END;

            IF OBJECT_ID(N'[ChatMessages]', N'U') IS NULL
            BEGIN
                CREATE TABLE [ChatMessages] (
                    [Id] int NOT NULL IDENTITY,
                    [AppointmentRequestId] int NOT NULL,
                    [SenderId] int NOT NULL,
                    [Message] nvarchar(max) NOT NULL,
                    [SentAtUtc] datetime2 NOT NULL,
                    CONSTRAINT [PK_ChatMessages] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_ChatMessages_AppointmentRequests_AppointmentRequestId] FOREIGN KEY ([AppointmentRequestId]) REFERENCES [AppointmentRequests] ([Id]) ON DELETE CASCADE,
                    CONSTRAINT [FK_ChatMessages_Users_SenderId] FOREIGN KEY ([SenderId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
                );

                CREATE INDEX [IX_ChatMessages_AppointmentRequestId] ON [ChatMessages] ([AppointmentRequestId]);
                CREATE INDEX [IX_ChatMessages_SenderId] ON [ChatMessages] ([SenderId]);
            END;
            """;

        await context.Database.ExecuteSqlRawAsync(sql);
    }
}
