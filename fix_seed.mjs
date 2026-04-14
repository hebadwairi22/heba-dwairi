import fs from "fs";

const path = "backend/PetCareJordan.Api/Data/SeedData.cs";
let content = fs.readFileSync(path, "utf8");

// Fix the users list closure and pet list start
const brokenBlock = /new\(\) \{ FullName = "ريم البطاينة"[\s\S]*?var pets = new List<Pet>\s+\{/m;

const correctBlock = `new() { FullName = "ريم البطاينة", Email = "reem@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001015", City = "إربد", Role = UserRole.User }
        };

        await context.Users.AddRangeAsync(users);
        await context.SaveChangesAsync();

        var userByEmail = users.ToDictionary(user => user.Email, StringComparer.OrdinalIgnoreCase);

        var pets = new List<Pet>
        {
            new() { Name = "فلفل | Pepper", Type = PetType.Hamster, Breed = "سوري | Syrian", AgeInMonths = 6, Gender = PetGender.Male, CollarId = "PCJ-1025", Color = "بيج | Beige", City = "عمان | Amman", WeightKg = 0.2m, IsNeutered = false, Description = "صغير ونشيط جداً بالليل | Small and very active at night.", PhotoUrl = GetSeedPhotoUrl(PetType.Hamster, "PCJ-1025"), OwnerId = userByEmail["yaqeen@petcare.jo"].Id },
            new() { Name = "ترتل | Turtle", Type = PetType.Turtle, Breed = "برمائي | Slider", AgeInMonths = 120, Gender = PetGender.Female, CollarId = "PCJ-1026", Color = "أخضر | Green", City = "العقبة | Aqaba", WeightKg = 1.5m, IsNeutered = false, Description = "هادئة وتحب السباحة | Calm and loves swimming.", PhotoUrl = GetSeedPhotoUrl(PetType.Turtle, "PCJ-1026"), OwnerId = userByEmail["ahmad@petcare.jo"].Id },`;

content = content.replace(brokenBlock, correctBlock);
fs.writeFileSync(path, content);
console.log("SeedData.cs fixed successfully!");
