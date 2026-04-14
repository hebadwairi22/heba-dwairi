using Microsoft.EntityFrameworkCore;
using PetCareJordan.Api.Models;
using PetCareJordan.Api.Services;

namespace PetCareJordan.Api.Data;

public static class SeedData
{
    public static async Task InitializeAsync(PetCareJordanContext context)
    {
        var passwordService = new PasswordService();

        // For development: Clear and re-seed to apply the fresh Arabic|English data
        if (context.Users.Any())
        {
             context.Notifications.RemoveRange(context.Notifications);
             context.OwnerMessages.RemoveRange(context.OwnerMessages);
             context.ChatMessages.RemoveRange(context.ChatMessages);
             context.AppointmentRequests.RemoveRange(context.AppointmentRequests);
             context.MedicalRecords.RemoveRange(context.MedicalRecords);
             context.VaccinationRecords.RemoveRange(context.VaccinationRecords);
             context.AdoptionListings.RemoveRange(context.AdoptionListings);
             context.LostPetReports.RemoveRange(context.LostPetReports);
             context.FoundPetReports.RemoveRange(context.FoundPetReports);
             context.Pets.RemoveRange(context.Pets);
             context.Users.RemoveRange(context.Users);
             await context.SaveChangesAsync();
        }

        var users = new List<AppUser>
        {
            new() { FullName = "يقين | Yaqeen", Email = "yaqeen@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001002", City = "عمان | Amman", Role = UserRole.Admin },
            new() { FullName = "د. صفاء | Dr. Safaa", Email = "safaa.vet@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001005", City = "عمان | Amman", Role = UserRole.Vet },
            new() { FullName = "كرم | Karam", Email = "karam@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001001", City = "عمان | Amman", Role = UserRole.User },
            new() { FullName = "يوسف ناصر | Yousef Nasser", Email = "yousef@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001003", City = "إربد | Irbid", Role = UserRole.User },
            new() { FullName = "سارة عودة | Sara Odeh", Email = "sara@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001004", City = "الزرقاء | Zarqa", Role = UserRole.User },
            new() { FullName = "د. عمر قضاة | Dr. Omar", Email = "omar.vet@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001006", City = "إربد | Irbid", Role = UserRole.Vet },
            new() { FullName = "دينا مجالي | Dina Majali", Email = "dina@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001007", City = "السلط | Salt", Role = UserRole.User },
            new() { FullName = "أحمد شناق | Ahmad Shannaq", Email = "ahmad@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001008", City = "العقبة | Aqaba", Role = UserRole.User },
            new() { FullName = "رما عازر | Rama Azer", Email = "rama@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001009", City = "مأدبا | Madaba", Role = UserRole.User },
            new() { FullName = "طارق فارس | Tareq Fares", Email = "tareq@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001010", City = "جرش | Jerash", Role = UserRole.User },
            new() { FullName = "هالة زيدان | Hala Zeidan", Email = "hala@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001011", City = "المفرق | Mafraq", Role = UserRole.User },
            new() { FullName = "محمد العبادي | Mohammad Abbadi", Email = "mohammad@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001012", City = "المفرق | Mafraq", Role = UserRole.User },
            new() { FullName = "نادين شوشة | Nadine Shousha", Email = "nadine@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001013", City = "عمان | Amman", Role = UserRole.User },
            new() { FullName = "خالد الطراونة | Khaled Tarawneh", Email = "khaled@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001014", City = "الكرك | Karak", Role = UserRole.User },
            new() { FullName = "ريم البطاينة | Reem Batayneh", Email = "reem@petcare.jo", PasswordHash = passwordService.HashPassword("Pass123!"), PhoneNumber = "0799001015", City = "إربد | Irbid", Role = UserRole.User }
        };

        await context.Users.AddRangeAsync(users);
        await context.SaveChangesAsync();

        var userByEmail = users.ToDictionary(user => user.Email, StringComparer.OrdinalIgnoreCase);

        var pets = new List<Pet>
        {
            new() { Name = "فلفل | Pepper", Type = PetType.Hamster, Breed = "سوري | Syrian", AgeInMonths = 6, Gender = PetGender.Male, CollarId = "PCJ-1025", Color = "بيج | Beige", City = "عمان | Amman", WeightKg = 0.2m, IsNeutered = false, Description = "صغير ونشيط جداً بالليل | Small and very active at night.", PhotoUrl = GetSeedPhotoUrl(PetType.Hamster, "PCJ-1025"), OwnerId = userByEmail["yaqeen@petcare.jo"].Id },
            new() { Name = "ترتل | Turtle", Type = PetType.Turtle, Breed = "برمائي | Slider", AgeInMonths = 120, Gender = PetGender.Female, CollarId = "PCJ-1026", Color = "أخضر | Green", City = "العقبة | Aqaba", WeightKg = 1.5m, IsNeutered = false, Description = "هادئة وتحب السباحة | Calm and loves swimming.", PhotoUrl = GetSeedPhotoUrl(PetType.Turtle, "PCJ-1026"), OwnerId = userByEmail["ahmad@petcare.jo"].Id },
            new() { Name = "ميلو | Milo", Type = PetType.Cat, Breed = "شيرازي | Persian", AgeInMonths = 18, Gender = PetGender.Male, CollarId = "PCJ-1001", Color = "أبيض | White", City = "عمان | Amman", WeightKg = 4.2m, IsNeutered = true, Description = "قط هادئ يحب الجلوس في البيت | Calm cat who loves staying at home.", PhotoUrl = GetSeedPhotoUrl(PetType.Cat, "PCJ-1001"), OwnerId = userByEmail["yaqeen@petcare.jo"].Id },
            new() { Name = "بيلا | Bella", Type = PetType.Dog, Breed = "جولدن ريتريفر | Golden Retriever", AgeInMonths = 30, Gender = PetGender.Female, CollarId = "PCJ-1002", Color = "ذهبي | Golden", City = "عمان | Amman", WeightKg = 22.4m, IsNeutered = false, Description = "ودودة جداً ومناسبة للأطفال | Very friendly and great with kids.", PhotoUrl = GetSeedPhotoUrl(PetType.Dog, "PCJ-1002"), OwnerId = userByEmail["karam@petcare.jo"].Id },
            new() { Name = "كيوي | Kiwi", Type = PetType.Bird, Breed = "كوكتيل | Cockatiel", AgeInMonths = 10, Gender = PetGender.Female, CollarId = "PCJ-1003", Color = "رمادي وأصفر | Gray and Yellow", City = "إربد | Irbid", WeightKg = 0.1m, IsNeutered = false, Description = "طائر اجتماعي يصفّر كثيراً | Social bird who whistles a lot.", PhotoUrl = GetSeedPhotoUrl(PetType.Bird, "PCJ-1003"), OwnerId = userByEmail["sara@petcare.jo"].Id },
            new() { Name = "سنو | Snow", Type = PetType.Rabbit, Breed = "هولاند لوب | Holland Lop", AgeInMonths = 12, Gender = PetGender.Female, CollarId = "PCJ-1004", Color = "كريمي | Cream", City = "الزرقاء | Zarqa", WeightKg = 1.8m, IsNeutered = true, Description = "أرنبة لطيفة تعودت على حياة الشقق | A gentle rabbit accustomed to apartment life.", PhotoUrl = GetSeedPhotoUrl(PetType.Rabbit, "PCJ-1004"), OwnerId = userByEmail["dina@petcare.jo"].Id },
            new() { Name = "سيمبا | Simba", Type = PetType.Cat, Breed = "تابي | Tabby", AgeInMonths = 24, Gender = PetGender.Male, CollarId = "PCJ-1005", Color = "بني | Brown", City = "المفرق | Mafraq", WeightKg = 5.1m, IsNeutered = true, Description = "قط نشيط ومرح يحب اللعب | Active and playful cat who loves to play.", PhotoUrl = GetSeedPhotoUrl(PetType.Cat, "PCJ-1005"), OwnerId = userByEmail["hala@petcare.jo"].Id },
            new() { Name = "روكي | Rocky", Type = PetType.Dog, Breed = "جيرمن شيبرد | German Shepherd", AgeInMonths = 36, Gender = PetGender.Male, CollarId = "PCJ-1006", Color = "أسود وبني | Black and Brown", City = "العقبة | Aqaba", WeightKg = 29.7m, IsNeutered = false, Description = "كلب وفي يحتاج مالك نشيط | A loyal dog needing an active owner.", PhotoUrl = GetSeedPhotoUrl(PetType.Dog, "PCJ-1006"), OwnerId = userByEmail["ahmad@petcare.jo"].Id },
            new() { Name = "لولو | Lulu", Type = PetType.Cat, Breed = "سيامي | Siamese", AgeInMonths = 16, Gender = PetGender.Female, CollarId = "PCJ-1007", Color = "كريمي وبني | Cream and Brown", City = "مأدبا | Madaba", WeightKg = 3.9m, IsNeutered = false, Description = "قطة حنونة وثرثارة | Affectionate and talkative cat.", PhotoUrl = GetSeedPhotoUrl(PetType.Cat, "PCJ-1007"), OwnerId = userByEmail["rama@petcare.jo"].Id },
            new() { Name = "كوكو | Coco", Type = PetType.Bird, Breed = "طائر الحب | Lovebird", AgeInMonths = 14, Gender = PetGender.Male, CollarId = "PCJ-1008", Color = "أخضر | Green", City = "السلط | Salt", WeightKg = 0.09m, IsNeutered = false, Description = "طائر مشرق ورفيق مرح | Bright bird and a cheerful companion.", PhotoUrl = GetSeedPhotoUrl(PetType.Bird, "PCJ-1008"), OwnerId = userByEmail["tareq@petcare.jo"].Id },
            new() { Name = "نالا | Nala", Type = PetType.Dog, Breed = "هاسكي | Husky", AgeInMonths = 28, Gender = PetGender.Female, CollarId = "PCJ-1009", Color = "رمادي وأبيض | Gray and White", City = "جرش | Jerash", WeightKg = 20.2m, IsNeutered = true, Description = "كلبة نشيطة تحب المشي الطويل | Active dog who loves long walks.", PhotoUrl = GetSeedPhotoUrl(PetType.Dog, "PCJ-1009"), OwnerId = userByEmail["nadine@petcare.jo"].Id },
            new() { Name = "هازل | Hazel", Type = PetType.Rabbit, Breed = "ميني ركس | Mini Rex", AgeInMonths = 9, Gender = PetGender.Female, CollarId = "PCJ-1010", Color = "بني | Brown", City = "عمان | Amman", WeightKg = 1.4m, IsNeutered = false, Description = "أرنبة فضولية بشخصية هادئة | Curious rabbit with a calm personality.", PhotoUrl = GetSeedPhotoUrl(PetType.Rabbit, "PCJ-1010"), OwnerId = userByEmail["khaled@petcare.jo"].Id },
            new() { Name = "زازو | Zazu", Type = PetType.Bird, Breed = "ببغاء رمادي أفريقي | African Grey Parrot", AgeInMonths = 40, Gender = PetGender.Male, CollarId = "PCJ-1011", Color = "رمادي | Gray", City = "عمان | Amman", WeightKg = 0.4m, IsNeutered = false, Description = "ببغاء ذكي يتعلم كلمات جديدة | Intelligent parrot that learns new words.", PhotoUrl = GetSeedPhotoUrl(PetType.Bird, "PCJ-1011"), OwnerId = userByEmail["reem@petcare.jo"].Id },
            new() { Name = "بوبي | Bobby", Type = PetType.Cat, Breed = "سكوتش فولد | Scottish Fold", AgeInMonths = 20, Gender = PetGender.Female, CollarId = "PCJ-1012", Color = "فضي | Silver", City = "إربد | Irbid", WeightKg = 4.0m, IsNeutered = true, Description = "قطة هادئة تحب النوم عند النافذة | Calm cat who loves sleeping by the window.", PhotoUrl = GetSeedPhotoUrl(PetType.Cat, "PCJ-1012"), OwnerId = userByEmail["mohammad@petcare.jo"].Id },
            new() { Name = "ماكس | Max", Type = PetType.Dog, Breed = "مختلط | Mixed", AgeInMonths = 14, Gender = PetGender.Male, CollarId = "PCJ-1013", Color = "بني وأبيض | Brown and White", City = "المفرق | Mafraq", WeightKg = 11.5m, IsNeutered = true, Description = "كلب تم إنقاذه يبحث عن فرصة ثانية | Rescued dog looking for a second chance.", PhotoUrl = GetSeedPhotoUrl(PetType.Dog, "PCJ-1013"), OwnerId = userByEmail["hala@petcare.jo"].Id },
            new() { Name = "روبي | Ruby", Type = PetType.Hamster, Breed = "ذهبي | Golden", AgeInMonths = 6, Gender = PetGender.Female, CollarId = "PCJ-1014", Color = "ذهبي | Golden", City = "السلط | Salt", WeightKg = 0.05m, IsNeutered = false, Description = "صغيرة وسهلة العناية | Small and easy to care for.", PhotoUrl = GetSeedPhotoUrl(PetType.Hamster, "PCJ-1014"), OwnerId = userByEmail["dina@petcare.jo"].Id },
            new() { Name = "ليو | Leo", Type = PetType.Cat, Breed = "تابي برتقالي | Orange Tabby", AgeInMonths = 15, Gender = PetGender.Male, CollarId = "PCJ-1015", Color = "برتقالي | Orange", City = "عمان | Amman", WeightKg = 4.6m, IsNeutered = true, Description = "قط فضولي واجتماعي | Curious and social cat.", PhotoUrl = GetSeedPhotoUrl(PetType.Cat, "PCJ-1015"), OwnerId = userByEmail["nadine@petcare.jo"].Id },
            new() { Name = "ليمون | Lemon", Type = PetType.Bird, Breed = "كناري | Canary", AgeInMonths = 8, Gender = PetGender.Female, CollarId = "PCJ-1016", Color = "أصفر | Yellow", City = "المفرق | Mafraq", WeightKg = 0.03m, IsNeutered = false, Description = "مغرّدة جميلة لبيت هادئ | Beautiful singer for a quiet home.", PhotoUrl = GetSeedPhotoUrl(PetType.Bird, "PCJ-1016"), OwnerId = userByEmail["mohammad@petcare.jo"].Id },
            new() { Name = "برونو | Bruno", Type = PetType.Dog, Breed = "بوكسر | Boxer", AgeInMonths = 26, Gender = PetGender.Male, CollarId = "PCJ-1017", Color = "بني | Brown", City = "الكرك | Karak", WeightKg = 24.2m, IsNeutered = false, Description = "حارس ذكي ومرح | Intelligent and playful guardian.", PhotoUrl = GetSeedPhotoUrl(PetType.Dog, "PCJ-1017"), OwnerId = userByEmail["khaled@petcare.jo"].Id },
            new() { Name = "موتشي | Mochi", Type = PetType.Rabbit, Breed = "لايون هيد | Lionhead", AgeInMonths = 13, Gender = PetGender.Male, CollarId = "PCJ-1018", Color = "أبيض وبني | White and Brown", City = "جرش | Jerash", WeightKg = 1.6m, IsNeutered = true, Description = "أرنب كثيف الشعر يحب اللمس | Fluffy rabbit who loves being touched.", PhotoUrl = GetSeedPhotoUrl(PetType.Rabbit, "PCJ-1018"), OwnerId = userByEmail["tareq@petcare.jo"].Id },
            new() { Name = "ساندي | Sandy", Type = PetType.Cat, Breed = "قط منزلي | House Cat", AgeInMonths = 22, Gender = PetGender.Female, CollarId = "PCJ-1019", Color = "رملي | Sandy", City = "العقبة | Aqaba", WeightKg = 4.3m, IsNeutered = true, Description = "قطة مريحة مناسبة للمبتدئين | Comfortable cat suitable for beginners.", PhotoUrl = GetSeedPhotoUrl(PetType.Cat, "PCJ-1019"), OwnerId = userByEmail["ahmad@petcare.jo"].Id },
            new() { Name = "ثور | Thor", Type = PetType.Dog, Breed = "لابرادور | Labrador", AgeInMonths = 32, Gender = PetGender.Male, CollarId = "PCJ-1020", Color = "أسود | Black", City = "عمان | Amman", WeightKg = 27.4m, IsNeutered = true, Description = "كلب هادئ وسهل التدريب | Calm and easy to train dog.", PhotoUrl = GetSeedPhotoUrl(PetType.Dog, "PCJ-1020"), OwnerId = userByEmail["yaqeen@petcare.jo"].Id },
            new() { Name = "بيرل | Pearl", Type = PetType.Cat, Breed = "شيرازي | Persian", AgeInMonths = 27, Gender = PetGender.Female, CollarId = "PCJ-1021", Color = "أبيض | White", City = "السلط | Salt", WeightKg = 4.7m, IsNeutered = false, Description = "أنيقة وهادئة | Elegant and calm.", PhotoUrl = GetSeedPhotoUrl(PetType.Cat, "PCJ-1021"), OwnerId = userByEmail["reem@petcare.jo"].Id },
            new() { Name = "بيكو | Piko", Type = PetType.Bird, Breed = "بادجي | Budgie", AgeInMonths = 11, Gender = PetGender.Male, CollarId = "PCJ-1022", Color = "أزرق | Blue", City = "الزرقاء | Zarqa", WeightKg = 0.04m, IsNeutered = false, Description = "طائر صغير يحب التفاعل | Small bird who loves interaction.", PhotoUrl = GetSeedPhotoUrl(PetType.Bird, "PCJ-1022"), OwnerId = userByEmail["sara@petcare.jo"].Id },
            new() { Name = "ديزي | Daisy", Type = PetType.Rabbit, Breed = "أرنب هولندي | Dutch Rabbit", AgeInMonths = 10, Gender = PetGender.Female, CollarId = "PCJ-1023", Color = "أسود وأبيض | Black and White", City = "عمان | Amman", WeightKg = 1.7m, IsNeutered = false, Description = "أرنبة صغيرة مناسبة للشقق | Small rabbit suitable for apartments.", PhotoUrl = GetSeedPhotoUrl(PetType.Rabbit, "PCJ-1023"), OwnerId = userByEmail["rama@petcare.jo"].Id },
            new() { Name = "سكاوت | Scout", Type = PetType.Turtle, Breed = "سلحفاة | Turtle", AgeInMonths = 48, Gender = PetGender.Male, CollarId = "PCJ-1024", Color = "أخضر | Green", City = "المفرق | Mafraq", WeightKg = 2.3m, IsNeutered = false, Description = "سلحفاة بصحة جيدة مع بيئة كاملة | Healthy turtle with a full habitat.", PhotoUrl = GetSeedPhotoUrl(PetType.Turtle, "PCJ-1024"), OwnerId = userByEmail["mohammad@petcare.jo"].Id }
        };

        await context.Pets.AddRangeAsync(pets);
        await context.SaveChangesAsync();

        var petByCollarId = pets.ToDictionary(pet => pet.CollarId, StringComparer.OrdinalIgnoreCase);

        var adoptionListings = new List<AdoptionListing>
        {
            new() { PetId = petByCollarId["PCJ-1001"].Id, Story = "المالك ينتقل لمكان جديد ويبحث عن بيت آمن. | Owner is moving to a new place and looking for a safe home.", ContactMethod = "Phone", ContactDetails = "0799001002", Status = AdoptionStatus.Available, PostedAtUtc = DateTime.UtcNow.AddDays(-10) },
            new() { PetId = petByCollarId["PCJ-1004"].Id, Story = "نبحث عن عائلة لديها خبرة بالأرانب. | Looking for a family with experience in rabbits.", ContactMethod = "Phone", ContactDetails = "0799001007", Status = AdoptionStatus.Available, PostedAtUtc = DateTime.UtcNow.AddDays(-7) },
            new() { PetId = petByCollarId["PCJ-1006"].Id, Story = "يحتاج مالك نشيط ومكان واسع. | Needs an active owner and a spacious place.", ContactMethod = "Phone", ContactDetails = "0799001008", Status = AdoptionStatus.Pending, PostedAtUtc = DateTime.UtcNow.AddDays(-4) },
            new() { PetId = petByCollarId["PCJ-1010"].Id, Story = "مناسبة لشقة هادئة ولأول مرة. | Suitable for a quiet apartment and first-time owners.", ContactMethod = "Email", ContactDetails = "khaled@petcare.jo", Status = AdoptionStatus.Available, PostedAtUtc = DateTime.UtcNow.AddDays(-3) },
            new() { PetId = petByCollarId["PCJ-1013"].Id, Story = "كلب تم إنقاذه ويستحق عائلة محبة. | Rescued dog who deserves a loving family.", ContactMethod = "Phone", ContactDetails = "0799001011", Status = AdoptionStatus.Available, PostedAtUtc = DateTime.UtcNow.AddDays(-5) },
            new() { PetId = petByCollarId["PCJ-1018"].Id, Story = "أرنب ودود متاح لأن المالك ينتقل. | Friendly rabbit available because the owner is moving.", ContactMethod = "Phone", ContactDetails = "0799001010", Status = AdoptionStatus.Available, PostedAtUtc = DateTime.UtcNow.AddDays(-6) },
            new() { PetId = petByCollarId["PCJ-1021"].Id, Story = "قطة شيرازي هادئة متاحة للتبنّي. | Calm Persian cat available for adoption.", ContactMethod = "Phone", ContactDetails = "0799001015", Status = AdoptionStatus.Pending, PostedAtUtc = DateTime.UtcNow.AddDays(-2) },
            new() { PetId = petByCollarId["PCJ-1023"].Id, Story = "أرنبة صغيرة تبحث عن بيتها الأول. | Small rabbit looking for her first home.", ContactMethod = "Phone", ContactDetails = "0799001009", Status = AdoptionStatus.Available, PostedAtUtc = DateTime.UtcNow.AddDays(-1) }
        };

        var lostReports = new List<LostPetReport>
        {
            new() { PetName = "شادو | Shadow", PetType = PetType.Cat, Description = "قط أسود بطوق أخضر. | Black cat with a green collar.", ApproximateAgeInMonths = 20, LastSeenPlace = "جبل عمان - شارع الرينبو | Jabal Amman - Rainbow St.", LastSeenDateUtc = DateTime.UtcNow.AddDays(-2), RewardAmount = 25, PhotoUrl = "https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=400", ContactName = "لينا خليل | Lina Khalil", ContactPhone = "0799001002", Status = ReportStatus.Active },
            new() { PetName = "بسكوت | Biscuit", PetType = PetType.Dog, Description = "كلب صغير بني وودود جداً. | Small brown and very friendly dog.", ApproximateAgeInMonths = 14, LastSeenPlace = "شارع الجامعة - إربد | University St - Irbid", LastSeenDateUtc = DateTime.UtcNow.AddDays(-1), RewardAmount = null, PhotoUrl = "https://images.pexels.com/photos/1490908/pexels-photo-1490908.jpeg?auto=compress&cs=tinysrgb&w=400", ContactName = "خالد الطراونة | Khaled Tarawneh", ContactPhone = "0799001014", Status = ReportStatus.Active },
            new() { PetName = "صني | Sunny", PetType = PetType.Bird, Description = "كناري أصفر هرب من البلكونة. | Yellow canary escaped from the balcony.", ApproximateAgeInMonths = 9, LastSeenPlace = "وسط مأدبا | Madaba City Center", LastSeenDateUtc = DateTime.UtcNow.AddDays(-3), RewardAmount = 15, PhotoUrl = "https://images.pexels.com/photos/56733/pexels-photo-56733.jpeg?auto=compress&cs=tinysrgb&w=400", ContactName = "رما عازر | Rama Azer", ContactPhone = "0799001009", Status = ReportStatus.Active },
            new() { PetName = "توتو | Toto", PetType = PetType.Cat, Description = "قط مخطط ضاع في المفرق. | Striped cat lost in Mafraq.", ApproximateAgeInMonths = 15, LastSeenPlace = "حي الحسين - المفرق | Al-Hussein Neighborhood - Mafraq", LastSeenDateUtc = DateTime.UtcNow.AddDays(-1), RewardAmount = 20, PhotoUrl = "https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg?auto=compress&cs=tinysrgb&w=400", ContactName = "هالة زيدان | Hala Zeidan", ContactPhone = "0799001011", Status = ReportStatus.Active }
        };

        var foundReports = new List<FoundPetReport>
        {
            new() { PetType = PetType.Cat, Description = "قط رمادي وُجد بدون إصابات ظاهرة. | Grey cat found with no visible injuries.", FoundPlace = "عبدون - عمان | Abdoun - Amman", FoundDateUtc = DateTime.UtcNow.AddDays(-1), PhotoUrl = "https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg?auto=compress&cs=tinysrgb&w=400", ContactName = "نادين شوشة | Nadine Shousha", ContactPhone = "0799001013", Status = ReportStatus.Active },
            new() { PetType = PetType.Dog, Description = "كلب أبيض مختلط وُجد قرب السوق. | Mixed white dog found near the market.", FoundPlace = "وسط السلط | Salt City Center", FoundDateUtc = DateTime.UtcNow.AddDays(-2), PhotoUrl = "https://images.pexels.com/photos/58997/pexels-photo-58997.jpeg?auto=compress&cs=tinysrgb&w=400", ContactName = "طارق فارس | Tareq Fares", ContactPhone = "0799001010", Status = ReportStatus.Active },
            new() { PetType = PetType.Rabbit, Description = "أرنب أبيض صغير وُجد في حديقة. | Small white rabbit found in a garden.", FoundPlace = "حدائق الملك حسين - المفرق | King Hussein Gardens - Mafraq", FoundDateUtc = DateTime.UtcNow.AddDays(-1), PhotoUrl = "https://images.pexels.com/photos/326012/pexels-photo-326012.jpeg?auto=compress&cs=tinysrgb&w=400", ContactName = "محمد العبادي | Mohammad Abbadi", ContactPhone = "0799001012", Status = ReportStatus.Active }
        };

        await context.AdoptionListings.AddRangeAsync(adoptionListings);
        await context.LostPetReports.AddRangeAsync(lostReports);
        await context.FoundPetReports.AddRangeAsync(foundReports);
        await context.SaveChangesAsync();

        var medicalRecords = new List<MedicalRecord>
        {
            new() { PetId = petByCollarId["PCJ-1001"].Id, VetId = userByEmail["safaa.vet@petcare.jo"].Id, VisitReason = "فحص عام | General Checkup", Diagnosis = "بصحة جيدة | Good Health", Treatment = "لا يحتاج علاج | No Treatment Needed", VisitDateUtc = DateTime.UtcNow.AddMonths(-2) },
            new() { PetId = petByCollarId["PCJ-1002"].Id, VetId = userByEmail["omar.vet@petcare.jo"].Id, VisitReason = "تهيج جلدي | Skin Irritation", Diagnosis = "حساسية خفيفة | Mild Allergy", Treatment = "مضاد حساسية لمدة 5 أيام | Anti-allergy for 5 days", VisitDateUtc = DateTime.UtcNow.AddMonths(-1) }
        };

        var vaccinations = new List<VaccinationRecord>
        {
            new() { PetId = petByCollarId["PCJ-1001"].Id, VetId = userByEmail["safaa.vet@petcare.jo"].Id, VaccineName = "داء الكلب | Rabies", GivenOnUtc = DateTime.UtcNow.AddMonths(-11), DueDateUtc = DateTime.UtcNow.AddDays(15), IsCompleted = false },
            new() { PetId = petByCollarId["PCJ-1002"].Id, VetId = userByEmail["omar.vet@petcare.jo"].Id, VaccineName = "DHPP", GivenOnUtc = DateTime.UtcNow.AddMonths(-10), DueDateUtc = DateTime.UtcNow.AddDays(7), IsCompleted = false }
        };

        var notifications = new List<Notification>
        {
            new() { UserId = userByEmail["yaqeen@petcare.jo"].Id, Type = NotificationType.VaccineReminder, Title = "تذكير تطعيم | Vaccine Reminder", Message = "تطعيم داء الكلب مستحق قريباً | Rabies vaccine due soon.", TriggerDateUtc = DateTime.UtcNow, IsRead = false }
        };

        await context.MedicalRecords.AddRangeAsync(medicalRecords);
        await context.VaccinationRecords.AddRangeAsync(vaccinations);
        await context.Notifications.AddRangeAsync(notifications);
        await context.SaveChangesAsync();

        await SeedAppointmentWorkflowAsync(context, userByEmail, petByCollarId);
    }

    private static async Task SeedAppointmentWorkflowAsync(PetCareJordanContext context, IDictionary<string, AppUser> users, IDictionary<string, Pet> pets)
    {
        var appointmentRequests = new List<AppointmentRequest>
        {
             new()
             {
                 PetId = pets["PCJ-1001"].Id,
                 OwnerId = users["yaqeen@petcare.jo"].Id,
                 VetId = users["safaa.vet@petcare.jo"].Id,
                 PreferredDateUtc = DateTime.UtcNow.AddDays(2),
                 Reason = "فحص روتيني | Routine Checkup",
                 OwnerNotes = "ميلو يحب المكافآت | Milo loves treats",
                 Status = AppointmentStatus.Confirmed,
                 CreatedAtUtc = DateTime.UtcNow.AddDays(-1)
             },
             new()
             {
                 PetId = pets["PCJ-1002"].Id,
                 OwnerId = users["karam@petcare.jo"].Id,
                 VetId = users["safaa.vet@petcare.jo"].Id,
                 PreferredDateUtc = DateTime.UtcNow.AddDays(3),
                 Reason = "استشارة سلوكية | Behavioral Consultation",
                 OwnerNotes = "بيلا تنبح كثيراً في الليل | Bella barks a lot at night",
                 Status = AppointmentStatus.Pending,
                 CreatedAtUtc = DateTime.UtcNow.AddDays(-2)
             }
        };

        await context.AppointmentRequests.AddRangeAsync(appointmentRequests);
        await context.SaveChangesAsync();

        var appt = appointmentRequests.First();
        var chatMessages = new List<ChatMessage>
        {
            new() { AppointmentRequestId = appt.Id, SenderId = users["yaqeen@petcare.jo"].Id, Message = "مرحبا دكتورة صفاء | Hello Dr. Safaa", SentAtUtc = DateTime.UtcNow.AddHours(-2) },
            new() { AppointmentRequestId = appt.Id, SenderId = users["safaa.vet@petcare.jo"].Id, Message = "أهلاً يقين، بانتظاركم | Hello Yaqeen, waiting for you", SentAtUtc = DateTime.UtcNow.AddHours(-1) }
        };

        await context.ChatMessages.AddRangeAsync(chatMessages);
        await context.SaveChangesAsync();
    }

    private static string GetSeedPhotoUrl(PetType type, string id)
    {
        return type switch
        {
            PetType.Cat => CatPhotos[Math.Abs(id.GetHashCode()) % CatPhotos.Length],
            PetType.Dog => DogPhotos[Math.Abs(id.GetHashCode()) % DogPhotos.Length],
            PetType.Bird => BirdPhotos[Math.Abs(id.GetHashCode()) % BirdPhotos.Length],
            PetType.Rabbit => RabbitPhotos[Math.Abs(id.GetHashCode()) % RabbitPhotos.Length],
            PetType.Hamster => HamsterPhotos[Math.Abs(id.GetHashCode()) % HamsterPhotos.Length],
            PetType.Turtle => TurtlePhotos[Math.Abs(id.GetHashCode()) % TurtlePhotos.Length],
            _ => CatPhotos[0]
        };
    }

    private static readonly string[] CatPhotos = { "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=800", "https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&cs=tinysrgb&w=800" };
    private static readonly string[] DogPhotos = { "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=800", "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800" };
    private static readonly string[] BirdPhotos = { "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg?auto=compress&cs=tinysrgb&w=800" };
    private static readonly string[] RabbitPhotos = { "https://images.pexels.com/photos/326012/pexels-photo-326012.jpeg?auto=compress&cs=tinysrgb&w=800" };
    private static readonly string[] HamsterPhotos = { "https://images.pexels.com/photos/2061057/pexels-photo-2061057.jpeg?auto=compress&cs=tinysrgb&w=800" };
    private static readonly string[] TurtlePhotos = { "https://images.pexels.com/photos/847393/pexels-photo-847393.jpeg?auto=compress&cs=tinysrgb&w=800" };
}
