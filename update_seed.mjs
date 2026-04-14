import fs from "fs";

let seed = fs.readFileSync("backend/PetCareJordan.Api/Data/SeedData.cs", "utf8");

// 1. Update demo users names and emails
seed = seed.replace('"علاء حداد", Email = "alaa@petcare.jo"', '"لؤي | Loai", Email = "loai.admin@petcare.jo"');
seed = seed.replace('"لينا خليل", Email = "lina@petcare.jo"', '"يقين | Yaqeen", Email = "yaqeen@petcare.jo"');
seed = seed.replace('"د. نور حمدان", Email = "noor.vet@petcare.jo"', '"د. صفاء | Dr. Safaa", Email = "safaa.vet@petcare.jo"');

// 2. Update dictionary keys to match new emails
seed = seed.replace(/userByEmail\["lina@petcare.jo"\]/g, 'userByEmail["yaqeen@petcare.jo"]');
seed = seed.replace(/userByEmail\["noor.vet@petcare.jo"\]/g, 'userByEmail["safaa.vet@petcare.jo"]');
seed = seed.replace(/userByEmail\["alaa@petcare.jo"\]/g, 'userByEmail["loai.admin@petcare.jo"]');
seed = seed.replace(/users\["lina@petcare.jo"\]/g, 'users["yaqeen@petcare.jo"]');
seed = seed.replace(/users\["noor.vet@petcare.jo"\]/g, 'users["safaa.vet@petcare.jo"]');
seed = seed.replace(/users\["alaa@petcare.jo"\]/g, 'users["loai.admin@petcare.jo"]');

// 3. Add bilingual markers to some pets
const biPets = [
  ['"ميلو"', '"ميلو | Milo"', '"شيرازي"', '"شيرازي | Persian"', '"قط هادئ يحب الجلوس في البيت."', '"قط هادئ يحب الجلوس في البيت | Calm cat who loves staying at home."'],
  ['"بيلا"', '"بيلا | Bella"', '"جولدن ريتريفر"', '"جولدن ريتريفر | Golden Retriever"', '"ودودة جداً ومناسبة للأطفال."', '"ودودة جداً ومناسبة للأطفال | Very friendly and great with kids."'],
  ['"كيوي"', '"كيوي | Kiwi"', '"كوكتيل"', '"كوكتيل | Cockatiel"', '"طائر اجتماعي يصفّر كثيراً."', '"طائر اجتماعي يصفّر كثيراً | Social bird who whistles a lot."']
];

biPets.forEach(([oldN, newN, oldB, newB, oldD, newD]) => {
  seed = seed.replace(oldN, newN);
  seed = seed.replace(oldB, newB);
  seed = seed.replace(oldD, newD);
});

// 4. Update the photo helper to handle new types
seed = seed.replace(
  'case PetType.Rabbit: urls = new[] { "https://images.pexels.com/photos/372166/pexels-photo-372166.jpeg", "https://images.pexels.com/photos/326012/pexels-photo-326012.jpeg", "https://images.pexels.com/photos/4588052/pexels-photo-4588052.jpeg" }; break;',
  `case PetType.Rabbit: urls = new[] { "https://images.pexels.com/photos/372166/pexels-photo-372166.jpeg", "https://images.pexels.com/photos/326012/pexels-photo-326012.jpeg", "https://images.pexels.com/photos/4588052/pexels-photo-4588052.jpeg" }; break;
            case PetType.Hamster: urls = new[] { "https://images.pexels.com/photos/208805/pexels-photo-208805.jpeg", "https://images.pexels.com/photos/3760233/pexels-photo-3760233.jpeg" }; break;
            case PetType.Turtle: urls = new[] { "https://images.pexels.com/photos/812258/pexels-photo-812258.jpeg", "https://images.pexels.com/photos/2260682/pexels-photo-2260682.jpeg" }; break;`
);

// 5. Add Hamster and Turtle to the pets list
const newPets = `
            new() { Name = "فلفل | Pepper", Type = PetType.Hamster, Breed = "سوري | Syrian", AgeInMonths = 6, Gender = PetGender.Male, CollarId = "PCJ-1025", Color = "بيج | Beige", City = "عمان | Amman", WeightKg = 0.2m, IsNeutered = false, Description = "صغير ونشيط جداً بالليل | Small and very active at night.", PhotoUrl = GetSeedPhotoUrl(PetType.Hamster, "PCJ-1025"), OwnerId = userByEmail["yaqeen@petcare.jo"].Id },
            new() { Name = "ترتل | Turtle", Type = PetType.Turtle, Breed = "برمائي | Slider", AgeInMonths = 120, Gender = PetGender.Female, CollarId = "PCJ-1026", Color = "أخضر | Green", City = "العقبة | Aqaba", WeightKg = 1.5m, IsNeutered = false, Description = "هادئة وتحب السباحة | Calm and loves swimming.", PhotoUrl = GetSeedPhotoUrl(PetType.Turtle, "PCJ-1026"), OwnerId = userByEmail["ahmad@petcare.jo"].Id },`;

seed = seed.replace('};', newPets + '\n        };');

fs.writeFileSync("backend/PetCareJordan.Api/Data/SeedData.cs", seed);
console.log("SeedData update completed!");
