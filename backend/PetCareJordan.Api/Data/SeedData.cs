using Microsoft.EntityFrameworkCore;
using PetCareJordan.Api.Models;
using PetCareJordan.Api.Services;

namespace PetCareJordan.Api.Data;

public static class SeedData
{
    public static async Task InitializeAsync(PetCareJordanContext context)
    {
        if (context.Users.Any())
        {
            await RepairPetPhotoDuplicatesAsync(context);
            await SeedAppointmentWorkflowAsync(context);
            return;
        }

        var passwordService = new PasswordService();

        var users = new List<AppUser>
        {
            new() { FullName = "Alaa Haddad", Email = "alaa@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001001", City = "Amman", Role = UserRole.Admin },
            new() { FullName = "Lina Khalil", Email = "lina@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001002", City = "Amman", Role = UserRole.User },
            new() { FullName = "Yousef Naser", Email = "yousef@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001003", City = "Irbid", Role = UserRole.User },
            new() { FullName = "Sara Odeh", Email = "sara@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001004", City = "Zarqa", Role = UserRole.User },
            new() { FullName = "Dr. Noor Hamdan", Email = "noor.vet@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001005", City = "Amman", Role = UserRole.Vet },
            new() { FullName = "Dr. Omar Qudah", Email = "omar.vet@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001006", City = "Irbid", Role = UserRole.Vet },
            new() { FullName = "Dina Majali", Email = "dina@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001007", City = "Salt", Role = UserRole.User },
            new() { FullName = "Ahmad Shannaq", Email = "ahmad@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001008", City = "Aqaba", Role = UserRole.User },
            new() { FullName = "Rama Azar", Email = "rama@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001009", City = "Madaba", Role = UserRole.User },
            new() { FullName = "Tareq Fares", Email = "tareq@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001010", City = "Jerash", Role = UserRole.User }
        };

        await context.Users.AddRangeAsync(users);
        await context.SaveChangesAsync();

        var userByEmail = users.ToDictionary(user => user.Email, StringComparer.OrdinalIgnoreCase);

        var pets = new List<Pet>
        {
            new() { Name = "Milo", Type = PetType.Cat, Breed = "Persian", AgeInMonths = 18, Gender = PetGender.Male, CollarId = "PCJ-1001", Color = "White", City = "Amman", WeightKg = 4.2m, IsNeutered = true, Description = "Calm indoor cat who loves quiet homes.", PhotoUrl = GetSeedPhotoUrl(PetType.Cat, "PCJ-1001"), OwnerId = userByEmail["lina@petcare.jo"].Id },
            new() { Name = "Bella", Type = PetType.Dog, Breed = "Golden Retriever", AgeInMonths = 30, Gender = PetGender.Female, CollarId = "PCJ-1002", Color = "Golden", City = "Amman", WeightKg = 22.4m, IsNeutered = false, Description = "Friendly and perfect with children.", PhotoUrl = GetSeedPhotoUrl(PetType.Dog, "PCJ-1002"), OwnerId = userByEmail["yousef@petcare.jo"].Id },
            new() { Name = "Kiwi", Type = PetType.Bird, Breed = "Cockatiel", AgeInMonths = 10, Gender = PetGender.Female, CollarId = "PCJ-1003", Color = "Grey and yellow", City = "Irbid", WeightKg = 0.1m, IsNeutered = false, Description = "Social bird that whistles a lot.", PhotoUrl = GetSeedPhotoUrl(PetType.Bird, "PCJ-1003"), OwnerId = userByEmail["sara@petcare.jo"].Id },
            new() { Name = "Snow", Type = PetType.Rabbit, Breed = "Holland Lop", AgeInMonths = 12, Gender = PetGender.Female, CollarId = "PCJ-1004", Color = "Cream", City = "Zarqa", WeightKg = 1.8m, IsNeutered = true, Description = "Gentle rabbit used to apartment life.", PhotoUrl = GetSeedPhotoUrl(PetType.Rabbit, "PCJ-1004"), OwnerId = userByEmail["dina@petcare.jo"].Id },
            new() { Name = "Simba", Type = PetType.Cat, Breed = "Tabby", AgeInMonths = 24, Gender = PetGender.Male, CollarId = "PCJ-1005", Color = "Brown", City = "Amman", WeightKg = 5.1m, IsNeutered = true, Description = "Playful cat with lots of energy.", PhotoUrl = GetSeedPhotoUrl(PetType.Cat, "PCJ-1005"), OwnerId = userByEmail["ahmad@petcare.jo"].Id },
            new() { Name = "Rocky", Type = PetType.Dog, Breed = "German Shepherd", AgeInMonths = 36, Gender = PetGender.Male, CollarId = "PCJ-1006", Color = "Black and tan", City = "Aqaba", WeightKg = 29.7m, IsNeutered = false, Description = "Loyal dog that needs an active owner.", PhotoUrl = GetSeedPhotoUrl(PetType.Dog, "PCJ-1006"), OwnerId = userByEmail["rama@petcare.jo"].Id },
            new() { Name = "Lulu", Type = PetType.Cat, Breed = "Siamese", AgeInMonths = 16, Gender = PetGender.Female, CollarId = "PCJ-1007", Color = "Cream and brown", City = "Madaba", WeightKg = 3.9m, IsNeutered = false, Description = "Talkative and affectionate.", PhotoUrl = GetSeedPhotoUrl(PetType.Cat, "PCJ-1007"), OwnerId = userByEmail["tareq@petcare.jo"].Id },
            new() { Name = "Coco", Type = PetType.Bird, Breed = "Lovebird", AgeInMonths = 14, Gender = PetGender.Male, CollarId = "PCJ-1008", Color = "Green", City = "Salt", WeightKg = 0.09m, IsNeutered = false, Description = "Bright and cheerful companion.", PhotoUrl = GetSeedPhotoUrl(PetType.Bird, "PCJ-1008"), OwnerId = userByEmail["lina@petcare.jo"].Id },
            new() { Name = "Nala", Type = PetType.Dog, Breed = "Husky", AgeInMonths = 28, Gender = PetGender.Female, CollarId = "PCJ-1009", Color = "Grey and white", City = "Jerash", WeightKg = 20.2m, IsNeutered = true, Description = "Energetic dog that enjoys long walks.", PhotoUrl = GetSeedPhotoUrl(PetType.Dog, "PCJ-1009"), OwnerId = userByEmail["yousef@petcare.jo"].Id },
            new() { Name = "Hazel", Type = PetType.Rabbit, Breed = "Mini Rex", AgeInMonths = 9, Gender = PetGender.Female, CollarId = "PCJ-1010", Color = "Brown", City = "Amman", WeightKg = 1.4m, IsNeutered = false, Description = "Curious rabbit with a calm personality.", PhotoUrl = GetSeedPhotoUrl(PetType.Rabbit, "PCJ-1010"), OwnerId = userByEmail["sara@petcare.jo"].Id },
            new() { Name = "Zazu", Type = PetType.Bird, Breed = "African Grey", AgeInMonths = 40, Gender = PetGender.Male, CollarId = "PCJ-1011", Color = "Grey", City = "Amman", WeightKg = 0.4m, IsNeutered = false, Description = "Smart parrot with a growing vocabulary.", PhotoUrl = GetSeedPhotoUrl(PetType.Bird, "PCJ-1011"), OwnerId = userByEmail["dina@petcare.jo"].Id },
            new() { Name = "Poppy", Type = PetType.Cat, Breed = "Scottish Fold", AgeInMonths = 20, Gender = PetGender.Female, CollarId = "PCJ-1012", Color = "Silver", City = "Irbid", WeightKg = 4.0m, IsNeutered = true, Description = "Quiet cat that likes window naps.", PhotoUrl = GetSeedPhotoUrl(PetType.Cat, "PCJ-1012"), OwnerId = userByEmail["ahmad@petcare.jo"].Id },
            new() { Name = "Max", Type = PetType.Dog, Breed = "Mixed Breed", AgeInMonths = 14, Gender = PetGender.Male, CollarId = "PCJ-1013", Color = "Brown and white", City = "Zarqa", WeightKg = 11.5m, IsNeutered = true, Description = "Rescued dog ready for a second chance.", PhotoUrl = GetSeedPhotoUrl(PetType.Dog, "PCJ-1013"), OwnerId = userByEmail["rama@petcare.jo"].Id },
            new() { Name = "Ruby", Type = PetType.Other, Breed = "Hamster", AgeInMonths = 6, Gender = PetGender.Female, CollarId = "PCJ-1014", Color = "Golden", City = "Salt", WeightKg = 0.05m, IsNeutered = false, Description = "Small and easy to care for.", PhotoUrl = GetSeedPhotoUrl(PetType.Other, "PCJ-1014"), OwnerId = userByEmail["tareq@petcare.jo"].Id },
            new() { Name = "Leo", Type = PetType.Cat, Breed = "Orange Tabby", AgeInMonths = 15, Gender = PetGender.Male, CollarId = "PCJ-1015", Color = "Orange", City = "Amman", WeightKg = 4.6m, IsNeutered = true, Description = "Curious and social cat.", PhotoUrl = GetSeedPhotoUrl(PetType.Cat, "PCJ-1015"), OwnerId = userByEmail["lina@petcare.jo"].Id },
            new() { Name = "Lemon", Type = PetType.Bird, Breed = "Canary", AgeInMonths = 8, Gender = PetGender.Female, CollarId = "PCJ-1016", Color = "Yellow", City = "Madaba", WeightKg = 0.03m, IsNeutered = false, Description = "Beautiful singer for a calm home.", PhotoUrl = GetSeedPhotoUrl(PetType.Bird, "PCJ-1016"), OwnerId = userByEmail["yousef@petcare.jo"].Id },
            new() { Name = "Bruno", Type = PetType.Dog, Breed = "Boxer", AgeInMonths = 26, Gender = PetGender.Male, CollarId = "PCJ-1017", Color = "Brown", City = "Irbid", WeightKg = 24.2m, IsNeutered = false, Description = "Protective, smart, and playful.", PhotoUrl = GetSeedPhotoUrl(PetType.Dog, "PCJ-1017"), OwnerId = userByEmail["sara@petcare.jo"].Id },
            new() { Name = "Mochi", Type = PetType.Rabbit, Breed = "Lionhead", AgeInMonths = 13, Gender = PetGender.Male, CollarId = "PCJ-1018", Color = "White and brown", City = "Jerash", WeightKg = 1.6m, IsNeutered = true, Description = "Fluffy rabbit that enjoys gentle handling.", PhotoUrl = GetSeedPhotoUrl(PetType.Rabbit, "PCJ-1018"), OwnerId = userByEmail["dina@petcare.jo"].Id },
            new() { Name = "Sandy", Type = PetType.Cat, Breed = "Domestic Shorthair", AgeInMonths = 22, Gender = PetGender.Female, CollarId = "PCJ-1019", Color = "Sand", City = "Aqaba", WeightKg = 4.3m, IsNeutered = true, Description = "Relaxed cat suited for first-time owners.", PhotoUrl = GetSeedPhotoUrl(PetType.Cat, "PCJ-1019"), OwnerId = userByEmail["ahmad@petcare.jo"].Id },
            new() { Name = "Thor", Type = PetType.Dog, Breed = "Labrador", AgeInMonths = 32, Gender = PetGender.Male, CollarId = "PCJ-1020", Color = "Black", City = "Amman", WeightKg = 27.4m, IsNeutered = true, Description = "Very trainable dog with a calm temperament.", PhotoUrl = GetSeedPhotoUrl(PetType.Dog, "PCJ-1020"), OwnerId = userByEmail["rama@petcare.jo"].Id },
            new() { Name = "Pearl", Type = PetType.Cat, Breed = "Persian", AgeInMonths = 27, Gender = PetGender.Female, CollarId = "PCJ-1021", Color = "White", City = "Salt", WeightKg = 4.7m, IsNeutered = false, Description = "Elegant and low-energy companion.", PhotoUrl = GetSeedPhotoUrl(PetType.Cat, "PCJ-1021"), OwnerId = userByEmail["tareq@petcare.jo"].Id },
            new() { Name = "Pico", Type = PetType.Bird, Breed = "Budgie", AgeInMonths = 11, Gender = PetGender.Male, CollarId = "PCJ-1022", Color = "Blue", City = "Zarqa", WeightKg = 0.04m, IsNeutered = false, Description = "A small bird that enjoys interaction.", PhotoUrl = GetSeedPhotoUrl(PetType.Bird, "PCJ-1022"), OwnerId = userByEmail["lina@petcare.jo"].Id },
            new() { Name = "Daisy", Type = PetType.Rabbit, Breed = "Dutch Rabbit", AgeInMonths = 10, Gender = PetGender.Female, CollarId = "PCJ-1023", Color = "Black and white", City = "Amman", WeightKg = 1.7m, IsNeutered = false, Description = "Compact rabbit suited for indoor life.", PhotoUrl = GetSeedPhotoUrl(PetType.Rabbit, "PCJ-1023"), OwnerId = userByEmail["yousef@petcare.jo"].Id },
            new() { Name = "Scout", Type = PetType.Other, Breed = "Turtle", AgeInMonths = 48, Gender = PetGender.Male, CollarId = "PCJ-1024", Color = "Green", City = "Madaba", WeightKg = 2.3m, IsNeutered = false, Description = "Healthy turtle with a full habitat setup.", PhotoUrl = GetSeedPhotoUrl(PetType.Other, "PCJ-1024"), OwnerId = userByEmail["sara@petcare.jo"].Id }
        };

        await context.Pets.AddRangeAsync(pets);
        await context.SaveChangesAsync();

        var petByCollarId = pets.ToDictionary(pet => pet.CollarId, StringComparer.OrdinalIgnoreCase);

        var adoptionListings = new List<AdoptionListing>
        {
            new() { PetId = petByCollarId["PCJ-1001"].Id, Story = "Owner is relocating and wants a safe home.", ContactMethod = "Phone", ContactDetails = "0799001002", Status = AdoptionStatus.Available, PostedAtUtc = DateTime.UtcNow.AddDays(-10) },
            new() { PetId = petByCollarId["PCJ-1004"].Id, Story = "Looking for a family experienced with rabbits.", ContactMethod = "Phone", ContactDetails = "0799001007", Status = AdoptionStatus.Available, PostedAtUtc = DateTime.UtcNow.AddDays(-7) },
            new() { PetId = petByCollarId["PCJ-1006"].Id, Story = "Needs an active adopter with a yard.", ContactMethod = "Phone", ContactDetails = "0799001009", Status = AdoptionStatus.Pending, PostedAtUtc = DateTime.UtcNow.AddDays(-4) },
            new() { PetId = petByCollarId["PCJ-1010"].Id, Story = "Perfect for a calm apartment home.", ContactMethod = "Email", ContactDetails = "sara@petcare.jo", Status = AdoptionStatus.Available, PostedAtUtc = DateTime.UtcNow.AddDays(-3) },
            new() { PetId = petByCollarId["PCJ-1013"].Id, Story = "Rescue dog that deserves a loving family.", ContactMethod = "Phone", ContactDetails = "0799001009", Status = AdoptionStatus.Available, PostedAtUtc = DateTime.UtcNow.AddDays(-5) },
            new() { PetId = petByCollarId["PCJ-1018"].Id, Story = "Friendly rabbit available because owner is moving.", ContactMethod = "Phone", ContactDetails = "0799001007", Status = AdoptionStatus.Available, PostedAtUtc = DateTime.UtcNow.AddDays(-6) },
            new() { PetId = petByCollarId["PCJ-1021"].Id, Story = "Quiet Persian cat available for adoption.", ContactMethod = "Phone", ContactDetails = "0799001010", Status = AdoptionStatus.Pending, PostedAtUtc = DateTime.UtcNow.AddDays(-2) },
            new() { PetId = petByCollarId["PCJ-1023"].Id, Story = "Young rabbit looking for a first home.", ContactMethod = "Phone", ContactDetails = "0799001003", Status = AdoptionStatus.Available, PostedAtUtc = DateTime.UtcNow.AddDays(-1) }
        };

        var lostReports = new List<LostPetReport>
        {
            new() { PetName = "Shadow", PetType = PetType.Cat, Description = "Black cat with green collar.", ApproximateAgeInMonths = 20, LastSeenPlace = "Jabal Amman near Rainbow Street", LastSeenDateUtc = DateTime.UtcNow.AddDays(-2), RewardAmount = 25, PhotoUrl = "https://images.unsplash.com/photo-1518791841217-8f162f1e1131", ContactName = "Lina Khalil", ContactPhone = "0799001002", Status = ReportStatus.Active },
            new() { PetName = "Biscuit", PetType = PetType.Dog, Description = "Small brown dog, very friendly.", ApproximateAgeInMonths = 14, LastSeenPlace = "Irbid University Street", LastSeenDateUtc = DateTime.UtcNow.AddDays(-1), RewardAmount = null, PhotoUrl = "https://images.unsplash.com/photo-1507146426996-ef05306b995a", ContactName = "Ahmad Shannaq", ContactPhone = "0799001008", Status = ReportStatus.Active },
            new() { PetName = "Sunny", PetType = PetType.Bird, Description = "Yellow canary escaped from balcony.", ApproximateAgeInMonths = 9, LastSeenPlace = "Madaba downtown", LastSeenDateUtc = DateTime.UtcNow.AddDays(-3), RewardAmount = 15, PhotoUrl = "https://images.unsplash.com/photo-1520808663317-647b476a81b9", ContactName = "Rama Azar", ContactPhone = "0799001009", Status = ReportStatus.Active }
        };

        var foundReports = new List<FoundPetReport>
        {
            new() { PetType = PetType.Cat, Description = "Grey cat found with no visible injury.", FoundPlace = "Abdoun, Amman", FoundDateUtc = DateTime.UtcNow.AddDays(-1), PhotoUrl = "https://images.unsplash.com/photo-1519052537078-e6302a4968d4", ContactName = "Dina Majali", ContactPhone = "0799001007", Status = ReportStatus.Active },
            new() { PetType = PetType.Dog, Description = "White mixed-breed dog found near market.", FoundPlace = "Salt city center", FoundDateUtc = DateTime.UtcNow.AddDays(-2), PhotoUrl = "https://images.unsplash.com/photo-1561037404-61cd46aa615b", ContactName = "Tareq Fares", ContactPhone = "0799001010", Status = ReportStatus.Active }
        };

        await context.AdoptionListings.AddRangeAsync(adoptionListings);
        await context.LostPetReports.AddRangeAsync(lostReports);
        await context.FoundPetReports.AddRangeAsync(foundReports);
        await context.SaveChangesAsync();

        var medicalRecords = new List<MedicalRecord>
        {
            new() { PetId = petByCollarId["PCJ-1001"].Id, VetId = userByEmail["noor.vet@petcare.jo"].Id, VisitReason = "General check-up", Diagnosis = "Healthy", Treatment = "No treatment needed", VisitDateUtc = DateTime.UtcNow.AddMonths(-2) },
            new() { PetId = petByCollarId["PCJ-1002"].Id, VetId = userByEmail["omar.vet@petcare.jo"].Id, VisitReason = "Skin irritation", Diagnosis = "Mild allergy", Treatment = "Antihistamine for 5 days", VisitDateUtc = DateTime.UtcNow.AddMonths(-1) },
            new() { PetId = petByCollarId["PCJ-1006"].Id, VetId = userByEmail["noor.vet@petcare.jo"].Id, VisitReason = "Vaccination follow-up", Diagnosis = "Healthy", Treatment = "Routine monitoring", VisitDateUtc = DateTime.UtcNow.AddMonths(-3) },
            new() { PetId = petByCollarId["PCJ-1011"].Id, VetId = userByEmail["omar.vet@petcare.jo"].Id, VisitReason = "Feather check", Diagnosis = "Vitamin deficiency", Treatment = "Diet adjustment and supplements", VisitDateUtc = DateTime.UtcNow.AddDays(-40) },
            new() { PetId = petByCollarId["PCJ-1020"].Id, VetId = userByEmail["noor.vet@petcare.jo"].Id, VisitReason = "Dental cleaning", Diagnosis = "Healthy gums", Treatment = "Annual follow-up", VisitDateUtc = DateTime.UtcNow.AddDays(-18) }
        };

        var vaccinations = new List<VaccinationRecord>
        {
            new() { PetId = petByCollarId["PCJ-1001"].Id, VetId = userByEmail["noor.vet@petcare.jo"].Id, VaccineName = "Rabies", GivenOnUtc = DateTime.UtcNow.AddMonths(-11), DueDateUtc = DateTime.UtcNow.AddDays(15), IsCompleted = false },
            new() { PetId = petByCollarId["PCJ-1002"].Id, VetId = userByEmail["omar.vet@petcare.jo"].Id, VaccineName = "DHPP", GivenOnUtc = DateTime.UtcNow.AddMonths(-10), DueDateUtc = DateTime.UtcNow.AddDays(7), IsCompleted = false },
            new() { PetId = petByCollarId["PCJ-1006"].Id, VetId = userByEmail["noor.vet@petcare.jo"].Id, VaccineName = "Rabies", GivenOnUtc = DateTime.UtcNow.AddMonths(-4), DueDateUtc = DateTime.UtcNow.AddMonths(8), IsCompleted = true },
            new() { PetId = petByCollarId["PCJ-1009"].Id, VetId = userByEmail["omar.vet@petcare.jo"].Id, VaccineName = "Bordetella", GivenOnUtc = DateTime.UtcNow.AddMonths(-8), DueDateUtc = DateTime.UtcNow.AddDays(9), IsCompleted = false },
            new() { PetId = petByCollarId["PCJ-1012"].Id, VetId = userByEmail["noor.vet@petcare.jo"].Id, VaccineName = "FVRCP", GivenOnUtc = DateTime.UtcNow.AddMonths(-11), DueDateUtc = DateTime.UtcNow.AddDays(20), IsCompleted = false },
            new() { PetId = petByCollarId["PCJ-1015"].Id, VetId = userByEmail["noor.vet@petcare.jo"].Id, VaccineName = "Rabies", GivenOnUtc = DateTime.UtcNow.AddMonths(-9), DueDateUtc = DateTime.UtcNow.AddDays(5), IsCompleted = false },
            new() { PetId = petByCollarId["PCJ-1020"].Id, VetId = userByEmail["noor.vet@petcare.jo"].Id, VaccineName = "DHPP", GivenOnUtc = DateTime.UtcNow.AddMonths(-12), DueDateUtc = DateTime.UtcNow.AddDays(3), IsCompleted = false },
            new() { PetId = petByCollarId["PCJ-1023"].Id, VetId = userByEmail["omar.vet@petcare.jo"].Id, VaccineName = "Rabbit Hemorrhagic Disease", GivenOnUtc = DateTime.UtcNow.AddMonths(-6), DueDateUtc = DateTime.UtcNow.AddDays(12), IsCompleted = false }
        };

        var notifications = new List<Notification>
        {
            new() { UserId = userByEmail["lina@petcare.jo"].Id, Type = NotificationType.VaccineReminder, Title = "Vaccine reminder for Milo", Message = "Rabies vaccine is due in 15 days.", TriggerDateUtc = DateTime.UtcNow, IsRead = false },
            new() { UserId = userByEmail["yousef@petcare.jo"].Id, Type = NotificationType.VaccineReminder, Title = "Vaccine reminder for Bella", Message = "DHPP vaccine is due in 7 days.", TriggerDateUtc = DateTime.UtcNow, IsRead = false },
            new() { UserId = userByEmail["rama@petcare.jo"].Id, Type = NotificationType.VaccineReminder, Title = "Vaccine reminder for Thor", Message = "DHPP vaccine is due in 3 days.", TriggerDateUtc = DateTime.UtcNow, IsRead = false }
        };

        await context.MedicalRecords.AddRangeAsync(medicalRecords);
        await context.VaccinationRecords.AddRangeAsync(vaccinations);
        await context.Notifications.AddRangeAsync(notifications);
        await context.SaveChangesAsync();

        await SeedAppointmentWorkflowAsync(context, userByEmail, petByCollarId);
    }

    private static async Task SeedAppointmentWorkflowAsync(
        PetCareJordanContext context,
        IDictionary<string, AppUser>? users = null,
        IDictionary<string, Pet>? pets = null)
    {
        if (await context.AppointmentRequests.AnyAsync())
        {
            return;
        }

        users ??= await context.Users.ToDictionaryAsync(user => user.Email, StringComparer.OrdinalIgnoreCase);
        pets ??= await context.Pets.ToDictionaryAsync(pet => pet.CollarId, StringComparer.OrdinalIgnoreCase);

        var appointmentRequests = new List<AppointmentRequest>
        {
            new()
            {
                PetId = pets["PCJ-1001"].Id,
                OwnerId = users["lina@petcare.jo"].Id,
                VetId = users["noor.vet@petcare.jo"].Id,
                PreferredDateUtc = DateTime.UtcNow.AddDays(2),
                Reason = "Milo has been eating less than usual for three days.",
                OwnerNotes = "No vomiting, but activity is lower than normal.",
                VetNotes = "Review appetite change and hydration level.",
                Status = AppointmentStatus.Confirmed,
                CreatedAtUtc = DateTime.UtcNow.AddDays(-1),
                UpdatedAtUtc = DateTime.UtcNow.AddHours(-5)
            },
            new()
            {
                PetId = pets["PCJ-1002"].Id,
                OwnerId = users["yousef@petcare.jo"].Id,
                VetId = users["omar.vet@petcare.jo"].Id,
                PreferredDateUtc = DateTime.UtcNow.AddDays(1),
                Reason = "Bella needs a skin follow-up after medication.",
                OwnerNotes = "Redness improved but still scratching sometimes.",
                VetNotes = string.Empty,
                Status = AppointmentStatus.Pending,
                CreatedAtUtc = DateTime.UtcNow.AddHours(-18)
            },
            new()
            {
                PetId = pets["PCJ-1020"].Id,
                OwnerId = users["rama@petcare.jo"].Id,
                VetId = users["noor.vet@petcare.jo"].Id,
                PreferredDateUtc = DateTime.UtcNow.AddDays(-3),
                Reason = "Thor had his vaccine visit and needs a quick check on recovery.",
                OwnerNotes = "Everything looks fine, just confirming next steps.",
                VetNotes = "Case completed after check-up and owner guidance.",
                Status = AppointmentStatus.Completed,
                CreatedAtUtc = DateTime.UtcNow.AddDays(-5),
                UpdatedAtUtc = DateTime.UtcNow.AddDays(-2)
            }
        };

        await context.AppointmentRequests.AddRangeAsync(appointmentRequests);
        await context.SaveChangesAsync();

        var appointmentsByPetId = appointmentRequests.ToDictionary(item => item.PetId);
        var chatMessages = new List<ChatMessage>
        {
            new()
            {
                AppointmentRequestId = appointmentsByPetId[pets["PCJ-1001"].Id].Id,
                SenderId = users["lina@petcare.jo"].Id,
                Message = "Can I bring Milo earlier if a slot opens up?",
                SentAtUtc = DateTime.UtcNow.AddHours(-10)
            },
            new()
            {
                AppointmentRequestId = appointmentsByPetId[pets["PCJ-1001"].Id].Id,
                SenderId = users["noor.vet@petcare.jo"].Id,
                Message = "Yes, if there is a cancellation we will contact you. Please keep water available for him.",
                SentAtUtc = DateTime.UtcNow.AddHours(-8)
            },
            new()
            {
                AppointmentRequestId = appointmentsByPetId[pets["PCJ-1002"].Id].Id,
                SenderId = users["yousef@petcare.jo"].Id,
                Message = "I uploaded this as a follow-up because Bella still scratches at night.",
                SentAtUtc = DateTime.UtcNow.AddHours(-6)
            }
        };

        await context.ChatMessages.AddRangeAsync(chatMessages);
        await context.Notifications.AddRangeAsync(new List<Notification>
        {
            new()
            {
                UserId = users["noor.vet@petcare.jo"].Id,
                Type = NotificationType.AppointmentUpdate,
                Title = "Confirmed appointment for Milo",
                Message = "Lina Khalil has a confirmed visit in 2 days.",
                TriggerDateUtc = DateTime.UtcNow,
                IsRead = false
            },
            new()
            {
                UserId = users["omar.vet@petcare.jo"].Id,
                Type = NotificationType.AppointmentUpdate,
                Title = "New pending appointment for Bella",
                Message = "Yousef Naser requested a follow-up appointment.",
                TriggerDateUtc = DateTime.UtcNow,
                IsRead = false
            }
        });
        await context.SaveChangesAsync();
    }

    private static async Task RepairPetPhotoDuplicatesAsync(PetCareJordanContext context)
    {
        var pets = await context.Pets
            .AsTracking()
            .ToListAsync();

        var petsNeedingRefresh = pets
            .Where(pet =>
                pet.PhotoUrl.Contains("loremflickr.com", StringComparison.OrdinalIgnoreCase)
                || pet.PhotoUrl.StartsWith("data:image/svg+xml", StringComparison.OrdinalIgnoreCase))
            .ToList();

        var duplicatePets = pets
            .GroupBy(pet => pet.PhotoUrl.Trim().ToLowerInvariant())
            .Where(group => group.Count() > 1)
            .SelectMany(group => group)
            .ToList();

        var petsToUpdate = petsNeedingRefresh
            .Concat(duplicatePets)
            .DistinctBy(pet => pet.Id)
            .ToList();

        if (petsToUpdate.Count == 0)
        {
            return;
        }

        foreach (var pet in petsToUpdate)
        {
            pet.PhotoUrl = GetSeedPhotoUrl(pet.Type, pet.CollarId);
        }

        await context.SaveChangesAsync();
    }

    private static readonly Dictionary<PetType, int> PhotoIndices = new();

    private static string GetSeedPhotoUrl(PetType type, string uniqueKey)
    {
        var urls = GetPhotoPool(type, uniqueKey);
        
        if (!PhotoIndices.ContainsKey(type))
        {
            PhotoIndices[type] = 0;
        }

        var index = PhotoIndices[type];
        PhotoIndices[type] = (index + 1) % urls.Length;
        return urls[index];
    }

    private static string[] GetPhotoPool(PetType type, string uniqueKey)
    {
        if (type == PetType.Other)
        {
            return uniqueKey.EndsWith("14", StringComparison.Ordinal)
                ? HamsterPhotos
                : TurtlePhotos;
        }

        return type switch
        {
            PetType.Cat => CatPhotos,
            PetType.Dog => DogPhotos,
            PetType.Bird => BirdPhotos,
            PetType.Rabbit => RabbitPhotos,
            _ => CatPhotos
        };
    }

    // Realistic stock photos (Unsplash) — stable URLs for demo data
    private static readonly string[] CatPhotos =
    {
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=800&q=80"
    };

    private static readonly string[] DogPhotos =
    {
        "https://images.unsplash.com/photo-1543466835-192a7c4e51f7?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1530281700549-e82e7bf010d6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=800&q=80"
    };

    private static readonly string[] BirdPhotos =
    {
        "https://images.unsplash.com/photo-1520808663317-647b476a81b9?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1444464666168-49d933b2eddb?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1549608276-5786777e6587?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1601262846983-db61a7a24558?auto=format&fit=crop&w=800&q=80"
    };

    private static readonly string[] RabbitPhotos =
    {
        "https://images.unsplash.com/photo-1585110396000-c5ffd4a28924?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1589933768059-bd8b4f26fbc5?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1589146194411-f2ba87fe3fca?auto=format&fit=crop&w=800&q=80"
    };

    private static readonly string[] HamsterPhotos =
    {
        "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80"
    };

    private static readonly string[] TurtlePhotos =
    {
        "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1549366021-9f761d45033f?auto=format&fit=crop&w=800&q=80"
    };
}
