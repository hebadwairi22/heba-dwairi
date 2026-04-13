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
            new() { FullName = "علاء حداد", Email = "alaa@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001001", City = "عمان", Role = UserRole.Admin },
            new() { FullName = "لينا خليل", Email = "lina@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001002", City = "عمان", Role = UserRole.User },
            new() { FullName = "يوسف ناصر", Email = "yousef@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001003", City = "إربد", Role = UserRole.User },
            new() { FullName = "سارة عودة", Email = "sara@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001004", City = "الزرقاء", Role = UserRole.User },
            new() { FullName = "د. نور حمدان", Email = "noor.vet@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001005", City = "عمان", Role = UserRole.Vet },
            new() { FullName = "د. عمر قضاة", Email = "omar.vet@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001006", City = "إربد", Role = UserRole.Vet },
            new() { FullName = "دينا مجالي", Email = "dina@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001007", City = "السلط", Role = UserRole.User },
            new() { FullName = "أحمد شناق", Email = "ahmad@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001008", City = "العقبة", Role = UserRole.User },
            new() { FullName = "رما عازر", Email = "rama@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001009", City = "مأدبا", Role = UserRole.User },
            new() { FullName = "طارق فارس", Email = "tareq@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001010", City = "جرش", Role = UserRole.User },
            new() { FullName = "هالة زيدان", Email = "hala@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001011", City = "المفرق", Role = UserRole.User },
            new() { FullName = "محمد العبادي", Email = "mohammad@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001012", City = "المفرق", Role = UserRole.User },
            new() { FullName = "نادين شوشة", Email = "nadine@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001013", City = "عمان", Role = UserRole.User },
            new() { FullName = "خالد الطراونة", Email = "khaled@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001014", City = "الكرك", Role = UserRole.User },
            new() { FullName = "ريم البطاينة", Email = "reem@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001015", City = "إربد", Role = UserRole.User }
        };

        await context.Users.AddRangeAsync(users);
        await context.SaveChangesAsync();

        var userByEmail = users.ToDictionary(user => user.Email, StringComparer.OrdinalIgnoreCase);

        var pets = new List<Pet>
        {
            new() { Name = "ميلو", Type = PetType.Cat, Breed = "شيرازي", AgeInMonths = 18, Gender = PetGender.Male, CollarId = "PCJ-1001", Color = "أبيض", City = "عمان", WeightKg = 4.2m, IsNeutered = true, Description = "قط هادئ يحب الجلوس في البيت.", PhotoUrl = GetSeedPhotoUrl(PetType.Cat, "PCJ-1001"), OwnerId = userByEmail["lina@petcare.jo"].Id },
            new() { Name = "بيلا", Type = PetType.Dog, Breed = "جولدن ريتريفر", AgeInMonths = 30, Gender = PetGender.Female, CollarId = "PCJ-1002", Color = "ذهبي", City = "عمان", WeightKg = 22.4m, IsNeutered = false, Description = "ودودة جداً ومناسبة للأطفال.", PhotoUrl = GetSeedPhotoUrl(PetType.Dog, "PCJ-1002"), OwnerId = userByEmail["yousef@petcare.jo"].Id },
            new() { Name = "كيوي", Type = PetType.Bird, Breed = "كوكتيل", AgeInMonths = 10, Gender = PetGender.Female, CollarId = "PCJ-1003", Color = "رمادي وأصفر", City = "إربد", WeightKg = 0.1m, IsNeutered = false, Description = "طائر اجتماعي يصفّر كثيراً.", PhotoUrl = GetSeedPhotoUrl(PetType.Bird, "PCJ-1003"), OwnerId = userByEmail["sara@petcare.jo"].Id },
            new() { Name = "سنو", Type = PetType.Rabbit, Breed = "هولاند لوب", AgeInMonths = 12, Gender = PetGender.Female, CollarId = "PCJ-1004", Color = "كريمي", City = "الزرقاء", WeightKg = 1.8m, IsNeutered = true, Description = "أرنبة لطيفة تعودت على حياة الشقق.", PhotoUrl = GetSeedPhotoUrl(PetType.Rabbit, "PCJ-1004"), OwnerId = userByEmail["dina@petcare.jo"].Id },
            new() { Name = "سيمبا", Type = PetType.Cat, Breed = "تابي", AgeInMonths = 24, Gender = PetGender.Male, CollarId = "PCJ-1005", Color = "بني", City = "المفرق", WeightKg = 5.1m, IsNeutered = true, Description = "قط نشيط ومرح يحب اللعب.", PhotoUrl = GetSeedPhotoUrl(PetType.Cat, "PCJ-1005"), OwnerId = userByEmail["hala@petcare.jo"].Id },
            new() { Name = "روكي", Type = PetType.Dog, Breed = "جيرمن شيبرد", AgeInMonths = 36, Gender = PetGender.Male, CollarId = "PCJ-1006", Color = "أسود وبني", City = "العقبة", WeightKg = 29.7m, IsNeutered = false, Description = "كلب وفي يحتاج مالك نشيط.", PhotoUrl = GetSeedPhotoUrl(PetType.Dog, "PCJ-1006"), OwnerId = userByEmail["ahmad@petcare.jo"].Id },
            new() { Name = "لولو", Type = PetType.Cat, Breed = "سيامي", AgeInMonths = 16, Gender = PetGender.Female, CollarId = "PCJ-1007", Color = "كريمي وبني", City = "مأدبا", WeightKg = 3.9m, IsNeutered = false, Description = "قطة حنونة وثرثارة.", PhotoUrl = GetSeedPhotoUrl(PetType.Cat, "PCJ-1007"), OwnerId = userByEmail["rama@petcare.jo"].Id },
            new() { Name = "كوكو", Type = PetType.Bird, Breed = "طائر الحب", AgeInMonths = 14, Gender = PetGender.Male, CollarId = "PCJ-1008", Color = "أخضر", City = "السلط", WeightKg = 0.09m, IsNeutered = false, Description = "طائر مشرق ورفيق مرح.", PhotoUrl = GetSeedPhotoUrl(PetType.Bird, "PCJ-1008"), OwnerId = userByEmail["tareq@petcare.jo"].Id },
            new() { Name = "نالا", Type = PetType.Dog, Breed = "هاسكي", AgeInMonths = 28, Gender = PetGender.Female, CollarId = "PCJ-1009", Color = "رمادي وأبيض", City = "جرش", WeightKg = 20.2m, IsNeutered = true, Description = "كلبة نشيطة تحب المشي الطويل.", PhotoUrl = GetSeedPhotoUrl(PetType.Dog, "PCJ-1009"), OwnerId = userByEmail["nadine@petcare.jo"].Id },
            new() { Name = "هازل", Type = PetType.Rabbit, Breed = "ميني ركس", AgeInMonths = 9, Gender = PetGender.Female, CollarId = "PCJ-1010", Color = "بني", City = "عمان", WeightKg = 1.4m, IsNeutered = false, Description = "أرنبة فضولية بشخصية هادئة.", PhotoUrl = GetSeedPhotoUrl(PetType.Rabbit, "PCJ-1010"), OwnerId = userByEmail["khaled@petcare.jo"].Id },
            new() { Name = "زازو", Type = PetType.Bird, Breed = "ببغاء رمادي أفريقي", AgeInMonths = 40, Gender = PetGender.Male, CollarId = "PCJ-1011", Color = "رمادي", City = "عمان", WeightKg = 0.4m, IsNeutered = false, Description = "ببغاء ذكي يتعلم كلمات جديدة.", PhotoUrl = GetSeedPhotoUrl(PetType.Bird, "PCJ-1011"), OwnerId = userByEmail["reem@petcare.jo"].Id },
            new() { Name = "بوبي", Type = PetType.Cat, Breed = "سكوتش فولد", AgeInMonths = 20, Gender = PetGender.Female, CollarId = "PCJ-1012", Color = "فضي", City = "إربد", WeightKg = 4.0m, IsNeutered = true, Description = "قطة هادئة تحب النوم عند النافذة.", PhotoUrl = GetSeedPhotoUrl(PetType.Cat, "PCJ-1012"), OwnerId = userByEmail["mohammad@petcare.jo"].Id },
            new() { Name = "ماكس", Type = PetType.Dog, Breed = "مختلط", AgeInMonths = 14, Gender = PetGender.Male, CollarId = "PCJ-1013", Color = "بني وأبيض", City = "المفرق", WeightKg = 11.5m, IsNeutered = true, Description = "كلب تم إنقاذه يبحث عن فرصة ثانية.", PhotoUrl = GetSeedPhotoUrl(PetType.Dog, "PCJ-1013"), OwnerId = userByEmail["hala@petcare.jo"].Id },
            new() { Name = "روبي", Type = PetType.Other, Breed = "هامستر", AgeInMonths = 6, Gender = PetGender.Female, CollarId = "PCJ-1014", Color = "ذهبي", City = "السلط", WeightKg = 0.05m, IsNeutered = false, Description = "صغيرة وسهلة العناية.", PhotoUrl = GetSeedPhotoUrl(PetType.Other, "PCJ-1014"), OwnerId = userByEmail["dina@petcare.jo"].Id },
            new() { Name = "ليو", Type = PetType.Cat, Breed = "تابي برتقالي", AgeInMonths = 15, Gender = PetGender.Male, CollarId = "PCJ-1015", Color = "برتقالي", City = "عمان", WeightKg = 4.6m, IsNeutered = true, Description = "قط فضولي واجتماعي.", PhotoUrl = GetSeedPhotoUrl(PetType.Cat, "PCJ-1015"), OwnerId = userByEmail["nadine@petcare.jo"].Id },
            new() { Name = "ليمون", Type = PetType.Bird, Breed = "كناري", AgeInMonths = 8, Gender = PetGender.Female, CollarId = "PCJ-1016", Color = "أصفر", City = "المفرق", WeightKg = 0.03m, IsNeutered = false, Description = "مغرّدة جميلة لبيت هادئ.", PhotoUrl = GetSeedPhotoUrl(PetType.Bird, "PCJ-1016"), OwnerId = userByEmail["mohammad@petcare.jo"].Id },
            new() { Name = "برونو", Type = PetType.Dog, Breed = "بوكسر", AgeInMonths = 26, Gender = PetGender.Male, CollarId = "PCJ-1017", Color = "بني", City = "الكرك", WeightKg = 24.2m, IsNeutered = false, Description = "حارس ذكي ومرح.", PhotoUrl = GetSeedPhotoUrl(PetType.Dog, "PCJ-1017"), OwnerId = userByEmail["khaled@petcare.jo"].Id },
            new() { Name = "موتشي", Type = PetType.Rabbit, Breed = "لايون هيد", AgeInMonths = 13, Gender = PetGender.Male, CollarId = "PCJ-1018", Color = "أبيض وبني", City = "جرش", WeightKg = 1.6m, IsNeutered = true, Description = "أرنب كثيف الشعر يحب اللمس.", PhotoUrl = GetSeedPhotoUrl(PetType.Rabbit, "PCJ-1018"), OwnerId = userByEmail["tareq@petcare.jo"].Id },
            new() { Name = "ساندي", Type = PetType.Cat, Breed = "قط منزلي", AgeInMonths = 22, Gender = PetGender.Female, CollarId = "PCJ-1019", Color = "رملي", City = "العقبة", WeightKg = 4.3m, IsNeutered = true, Description = "قطة مريحة مناسبة للمبتدئين.", PhotoUrl = GetSeedPhotoUrl(PetType.Cat, "PCJ-1019"), OwnerId = userByEmail["ahmad@petcare.jo"].Id },
            new() { Name = "ثور", Type = PetType.Dog, Breed = "لابرادور", AgeInMonths = 32, Gender = PetGender.Male, CollarId = "PCJ-1020", Color = "أسود", City = "عمان", WeightKg = 27.4m, IsNeutered = true, Description = "كلب هادئ وسهل التدريب.", PhotoUrl = GetSeedPhotoUrl(PetType.Dog, "PCJ-1020"), OwnerId = userByEmail["lina@petcare.jo"].Id },
            new() { Name = "بيرل", Type = PetType.Cat, Breed = "شيرازي", AgeInMonths = 27, Gender = PetGender.Female, CollarId = "PCJ-1021", Color = "أبيض", City = "السلط", WeightKg = 4.7m, IsNeutered = false, Description = "أنيقة وهادئة.", PhotoUrl = GetSeedPhotoUrl(PetType.Cat, "PCJ-1021"), OwnerId = userByEmail["reem@petcare.jo"].Id },
            new() { Name = "بيكو", Type = PetType.Bird, Breed = "بادجي", AgeInMonths = 11, Gender = PetGender.Male, CollarId = "PCJ-1022", Color = "أزرق", City = "الزرقاء", WeightKg = 0.04m, IsNeutered = false, Description = "طائر صغير يحب التفاعل.", PhotoUrl = GetSeedPhotoUrl(PetType.Bird, "PCJ-1022"), OwnerId = userByEmail["sara@petcare.jo"].Id },
            new() { Name = "ديزي", Type = PetType.Rabbit, Breed = "أرنب هولندي", AgeInMonths = 10, Gender = PetGender.Female, CollarId = "PCJ-1023", Color = "أسود وأبيض", City = "عمان", WeightKg = 1.7m, IsNeutered = false, Description = "أرنبة صغيرة مناسبة للشقق.", PhotoUrl = GetSeedPhotoUrl(PetType.Rabbit, "PCJ-1023"), OwnerId = userByEmail["rama@petcare.jo"].Id },
            new() { Name = "سكاوت", Type = PetType.Other, Breed = "سلحفاة", AgeInMonths = 48, Gender = PetGender.Male, CollarId = "PCJ-1024", Color = "أخضر", City = "المفرق", WeightKg = 2.3m, IsNeutered = false, Description = "سلحفاة بصحة جيدة مع بيئة كاملة.", PhotoUrl = GetSeedPhotoUrl(PetType.Other, "PCJ-1024"), OwnerId = userByEmail["mohammad@petcare.jo"].Id }
        };

        await context.Pets.AddRangeAsync(pets);
        await context.SaveChangesAsync();

        var petByCollarId = pets.ToDictionary(pet => pet.CollarId, StringComparer.OrdinalIgnoreCase);

        var adoptionListings = new List<AdoptionListing>
        {
            new() { PetId = petByCollarId["PCJ-1001"].Id, Story = "المالك ينتقل لمكان جديد ويبحث عن بيت آمن.", ContactMethod = "Phone", ContactDetails = "0799001002", Status = AdoptionStatus.Available, PostedAtUtc = DateTime.UtcNow.AddDays(-10) },
            new() { PetId = petByCollarId["PCJ-1004"].Id, Story = "نبحث عن عائلة لديها خبرة بالأرانب.", ContactMethod = "Phone", ContactDetails = "0799001007", Status = AdoptionStatus.Available, PostedAtUtc = DateTime.UtcNow.AddDays(-7) },
            new() { PetId = petByCollarId["PCJ-1006"].Id, Story = "يحتاج مالك نشيط ومكان واسع.", ContactMethod = "Phone", ContactDetails = "0799001008", Status = AdoptionStatus.Pending, PostedAtUtc = DateTime.UtcNow.AddDays(-4) },
            new() { PetId = petByCollarId["PCJ-1010"].Id, Story = "مناسبة لشقة هادئة ولأول مرة.", ContactMethod = "Email", ContactDetails = "khaled@petcare.jo", Status = AdoptionStatus.Available, PostedAtUtc = DateTime.UtcNow.AddDays(-3) },
            new() { PetId = petByCollarId["PCJ-1013"].Id, Story = "كلب تم إنقاذه ويستحق عائلة محبة.", ContactMethod = "Phone", ContactDetails = "0799001011", Status = AdoptionStatus.Available, PostedAtUtc = DateTime.UtcNow.AddDays(-5) },
            new() { PetId = petByCollarId["PCJ-1018"].Id, Story = "أرنب ودود متاح لأن المالك ينتقل.", ContactMethod = "Phone", ContactDetails = "0799001010", Status = AdoptionStatus.Available, PostedAtUtc = DateTime.UtcNow.AddDays(-6) },
            new() { PetId = petByCollarId["PCJ-1021"].Id, Story = "قطة شيرازي هادئة متاحة للتبنّي.", ContactMethod = "Phone", ContactDetails = "0799001015", Status = AdoptionStatus.Pending, PostedAtUtc = DateTime.UtcNow.AddDays(-2) },
            new() { PetId = petByCollarId["PCJ-1023"].Id, Story = "أرنبة صغيرة تبحث عن بيتها الأول.", ContactMethod = "Phone", ContactDetails = "0799001009", Status = AdoptionStatus.Available, PostedAtUtc = DateTime.UtcNow.AddDays(-1) }
        };

        var lostReports = new List<LostPetReport>
        {
            new() { PetName = "شادو", PetType = PetType.Cat, Description = "قط أسود بطوق أخضر.", ApproximateAgeInMonths = 20, LastSeenPlace = "جبل عمان قرب شارع الرينبو", LastSeenDateUtc = DateTime.UtcNow.AddDays(-2), RewardAmount = 25, PhotoUrl = "https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=400", ContactName = "لينا خليل", ContactPhone = "0799001002", Status = ReportStatus.Active },
            new() { PetName = "بسكوت", PetType = PetType.Dog, Description = "كلب صغير بني وودود جداً.", ApproximateAgeInMonths = 14, LastSeenPlace = "شارع الجامعة - إربد", LastSeenDateUtc = DateTime.UtcNow.AddDays(-1), RewardAmount = null, PhotoUrl = "https://images.pexels.com/photos/1490908/pexels-photo-1490908.jpeg?auto=compress&cs=tinysrgb&w=400", ContactName = "خالد الطراونة", ContactPhone = "0799001014", Status = ReportStatus.Active },
            new() { PetName = "صني", PetType = PetType.Bird, Description = "كناري أصفر هرب من البلكونة.", ApproximateAgeInMonths = 9, LastSeenPlace = "وسط مأدبا", LastSeenDateUtc = DateTime.UtcNow.AddDays(-3), RewardAmount = 15, PhotoUrl = "https://images.pexels.com/photos/56733/pexels-photo-56733.jpeg?auto=compress&cs=tinysrgb&w=400", ContactName = "رما عازر", ContactPhone = "0799001009", Status = ReportStatus.Active },
            new() { PetName = "توتو", PetType = PetType.Cat, Description = "قط مخطط ضاع في المفرق.", ApproximateAgeInMonths = 15, LastSeenPlace = "حي الحسين - المفرق", LastSeenDateUtc = DateTime.UtcNow.AddDays(-1), RewardAmount = 20, PhotoUrl = "https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg?auto=compress&cs=tinysrgb&w=400", ContactName = "هالة زيدان", ContactPhone = "0799001011", Status = ReportStatus.Active }
        };

        var foundReports = new List<FoundPetReport>
        {
            new() { PetType = PetType.Cat, Description = "قط رمادي وُجد بدون إصابات ظاهرة.", FoundPlace = "عبدون - عمان", FoundDateUtc = DateTime.UtcNow.AddDays(-1), PhotoUrl = "https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg?auto=compress&cs=tinysrgb&w=400", ContactName = "نادين شوشة", ContactPhone = "0799001013", Status = ReportStatus.Active },
            new() { PetType = PetType.Dog, Description = "كلب أبيض مختلط وُجد قرب السوق.", FoundPlace = "وسط السلط", FoundDateUtc = DateTime.UtcNow.AddDays(-2), PhotoUrl = "https://images.pexels.com/photos/58997/pexels-photo-58997.jpeg?auto=compress&cs=tinysrgb&w=400", ContactName = "طارق فارس", ContactPhone = "0799001010", Status = ReportStatus.Active },
            new() { PetType = PetType.Rabbit, Description = "أرنب أبيض صغير وُجد في حديقة.", FoundPlace = "حدائق الملك حسين - المفرق", FoundDateUtc = DateTime.UtcNow.AddDays(-1), PhotoUrl = "https://images.pexels.com/photos/326012/pexels-photo-326012.jpeg?auto=compress&cs=tinysrgb&w=400", ContactName = "محمد العبادي", ContactPhone = "0799001012", Status = ReportStatus.Active }
        };

        await context.AdoptionListings.AddRangeAsync(adoptionListings);
        await context.LostPetReports.AddRangeAsync(lostReports);
        await context.FoundPetReports.AddRangeAsync(foundReports);
        await context.SaveChangesAsync();

        var medicalRecords = new List<MedicalRecord>
        {
            new() { PetId = petByCollarId["PCJ-1001"].Id, VetId = userByEmail["noor.vet@petcare.jo"].Id, VisitReason = "فحص عام", Diagnosis = "بصحة جيدة", Treatment = "لا يحتاج علاج", VisitDateUtc = DateTime.UtcNow.AddMonths(-2) },
            new() { PetId = petByCollarId["PCJ-1002"].Id, VetId = userByEmail["omar.vet@petcare.jo"].Id, VisitReason = "تهيج جلدي", Diagnosis = "حساسية خفيفة", Treatment = "مضاد حساسية لمدة 5 أيام", VisitDateUtc = DateTime.UtcNow.AddMonths(-1) },
            new() { PetId = petByCollarId["PCJ-1006"].Id, VetId = userByEmail["noor.vet@petcare.jo"].Id, VisitReason = "متابعة تطعيم", Diagnosis = "بصحة جيدة", Treatment = "مراقبة روتينية", VisitDateUtc = DateTime.UtcNow.AddMonths(-3) },
            new() { PetId = petByCollarId["PCJ-1011"].Id, VetId = userByEmail["omar.vet@petcare.jo"].Id, VisitReason = "فحص ريش", Diagnosis = "نقص فيتامينات", Treatment = "تعديل النظام الغذائي ومكملات", VisitDateUtc = DateTime.UtcNow.AddDays(-40) },
            new() { PetId = petByCollarId["PCJ-1020"].Id, VetId = userByEmail["noor.vet@petcare.jo"].Id, VisitReason = "تنظيف أسنان", Diagnosis = "لثة سليمة", Treatment = "متابعة سنوية", VisitDateUtc = DateTime.UtcNow.AddDays(-18) }
        };

        var vaccinations = new List<VaccinationRecord>
        {
            new() { PetId = petByCollarId["PCJ-1001"].Id, VetId = userByEmail["noor.vet@petcare.jo"].Id, VaccineName = "داء الكلب", GivenOnUtc = DateTime.UtcNow.AddMonths(-11), DueDateUtc = DateTime.UtcNow.AddDays(15), IsCompleted = false },
            new() { PetId = petByCollarId["PCJ-1002"].Id, VetId = userByEmail["omar.vet@petcare.jo"].Id, VaccineName = "DHPP", GivenOnUtc = DateTime.UtcNow.AddMonths(-10), DueDateUtc = DateTime.UtcNow.AddDays(7), IsCompleted = false },
            new() { PetId = petByCollarId["PCJ-1006"].Id, VetId = userByEmail["noor.vet@petcare.jo"].Id, VaccineName = "داء الكلب", GivenOnUtc = DateTime.UtcNow.AddMonths(-4), DueDateUtc = DateTime.UtcNow.AddMonths(8), IsCompleted = true },
            new() { PetId = petByCollarId["PCJ-1009"].Id, VetId = userByEmail["omar.vet@petcare.jo"].Id, VaccineName = "بورديتيلا", GivenOnUtc = DateTime.UtcNow.AddMonths(-8), DueDateUtc = DateTime.UtcNow.AddDays(9), IsCompleted = false },
            new() { PetId = petByCollarId["PCJ-1012"].Id, VetId = userByEmail["noor.vet@petcare.jo"].Id, VaccineName = "FVRCP", GivenOnUtc = DateTime.UtcNow.AddMonths(-11), DueDateUtc = DateTime.UtcNow.AddDays(20), IsCompleted = false },
            new() { PetId = petByCollarId["PCJ-1015"].Id, VetId = userByEmail["noor.vet@petcare.jo"].Id, VaccineName = "داء الكلب", GivenOnUtc = DateTime.UtcNow.AddMonths(-9), DueDateUtc = DateTime.UtcNow.AddDays(5), IsCompleted = false },
            new() { PetId = petByCollarId["PCJ-1020"].Id, VetId = userByEmail["noor.vet@petcare.jo"].Id, VaccineName = "DHPP", GivenOnUtc = DateTime.UtcNow.AddMonths(-12), DueDateUtc = DateTime.UtcNow.AddDays(3), IsCompleted = false },
            new() { PetId = petByCollarId["PCJ-1023"].Id, VetId = userByEmail["omar.vet@petcare.jo"].Id, VaccineName = "مرض الأرانب النزفي", GivenOnUtc = DateTime.UtcNow.AddMonths(-6), DueDateUtc = DateTime.UtcNow.AddDays(12), IsCompleted = false }
        };

        var notifications = new List<Notification>
        {
            new() { UserId = userByEmail["lina@petcare.jo"].Id, Type = NotificationType.VaccineReminder, Title = "تذكير بتطعيم ميلو", Message = "تطعيم داء الكلب مستحق خلال 15 يوم.", TriggerDateUtc = DateTime.UtcNow, IsRead = false },
            new() { UserId = userByEmail["yousef@petcare.jo"].Id, Type = NotificationType.VaccineReminder, Title = "تذكير بتطعيم بيلا", Message = "تطعيم DHPP مستحق خلال 7 أيام.", TriggerDateUtc = DateTime.UtcNow, IsRead = false },
            new() { UserId = userByEmail["lina@petcare.jo"].Id, Type = NotificationType.VaccineReminder, Title = "تذكير بتطعيم ثور", Message = "تطعيم DHPP مستحق خلال 3 أيام.", TriggerDateUtc = DateTime.UtcNow, IsRead = false }
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
                Reason = "ميلو يأكل أقل من المعتاد منذ ثلاثة أيام.",
                OwnerNotes = "لا يوجد استفراغ لكن النشاط أقل من الطبيعي.",
                VetNotes = "مراجعة تغير الشهية ومستوى الترطيب.",
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
                Reason = "بيلا تحتاج متابعة جلدية بعد الدواء.",
                OwnerNotes = "الاحمرار تحسن لكن لا تزال تحكّ أحياناً.",
                VetNotes = string.Empty,
                Status = AppointmentStatus.Pending,
                CreatedAtUtc = DateTime.UtcNow.AddHours(-18)
            },
            new()
            {
                PetId = pets["PCJ-1020"].Id,
                OwnerId = users["lina@petcare.jo"].Id,
                VetId = users["noor.vet@petcare.jo"].Id,
                PreferredDateUtc = DateTime.UtcNow.AddDays(-3),
                Reason = "ثور أخذ تطعيمه ويحتاج فحص سريع.",
                OwnerNotes = "كل شيء يبدو طبيعي، فقط للتأكيد.",
                VetNotes = "الحالة اكتملت بعد الفحص وإرشاد المالك.",
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
                Message = "هل ممكن أجيب ميلو أبكر لو صار فتحة؟",
                SentAtUtc = DateTime.UtcNow.AddHours(-10)
            },
            new()
            {
                AppointmentRequestId = appointmentsByPetId[pets["PCJ-1001"].Id].Id,
                SenderId = users["noor.vet@petcare.jo"].Id,
                Message = "نعم، لو صار إلغاء رح نتواصل معك. خلّي الماء متوفر له.",
                SentAtUtc = DateTime.UtcNow.AddHours(-8)
            },
            new()
            {
                AppointmentRequestId = appointmentsByPetId[pets["PCJ-1002"].Id].Id,
                SenderId = users["yousef@petcare.jo"].Id,
                Message = "رفعت الطلب كمتابعة لأن بيلا لسا بتحكّ بالليل.",
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
                Title = "موعد مؤكد لميلو",
                Message = "لينا خليل لديها زيارة مؤكدة خلال يومين.",
                TriggerDateUtc = DateTime.UtcNow,
                IsRead = false
            },
            new()
            {
                UserId = users["omar.vet@petcare.jo"].Id,
                Type = NotificationType.AppointmentUpdate,
                Title = "موعد جديد معلق لبيلا",
                Message = "يوسف ناصر طلب موعد متابعة.",
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

    // Realistic stock photos (Pexels) — stable URLs for demo data
    private static readonly string[] CatPhotos =
    {
        "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/320014/pexels-photo-320014.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/127028/pexels-photo-127028.jpeg?auto=compress&cs=tinysrgb&w=800"
    };

    private static readonly string[] DogPhotos =
    {
        "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/58997/pexels-photo-58997.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1490908/pexels-photo-1490908.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/3726314/pexels-photo-3726314.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/2023384/pexels-photo-2023384.jpeg?auto=compress&cs=tinysrgb&w=800"
    };

    private static readonly string[] BirdPhotos =
    {
        "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/56733/pexels-photo-56733.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/349758/pexels-photo-349758.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/2662434/pexels-photo-2662434.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1418241/pexels-photo-1418241.jpeg?auto=compress&cs=tinysrgb&w=800"
    };

    private static readonly string[] RabbitPhotos =
    {
        "https://images.pexels.com/photos/326012/pexels-photo-326012.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/372166/pexels-photo-372166.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/4588065/pexels-photo-4588065.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/6846043/pexels-photo-6846043.jpeg?auto=compress&cs=tinysrgb&w=800"
    };

    private static readonly string[] HamsterPhotos =
    {
        "https://images.pexels.com/photos/2061057/pexels-photo-2061057.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1612982/pexels-photo-1612982.jpeg?auto=compress&cs=tinysrgb&w=800"
    };

    private static readonly string[] TurtlePhotos =
    {
        "https://images.pexels.com/photos/847393/pexels-photo-847393.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/162307/tortoise-reptile-shell-walking-162307.jpeg?auto=compress&cs=tinysrgb&w=800"
    };
}
