const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.bookingExtra.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.client.deleteMany();

  // Seed services
  const services = [
    {
      name: "Basic Wash",
      priceHatchSedan: 100,
      priceSuv: 130,
      price4x4: 150,
      description:
        "Full exterior hand wash and dry, bug residue removed, wheels and tyres clean, tyres rejuvenated, full interior vacuum, all interior surfaces cleaned, windows and mirrors cleaned, empty rubbish & deodorize, boot included",
      isExtra: false,
      sortOrder: 1,
    },
    {
      name: "Mini Detailing",
      priceHatchSedan: 350,
      priceSuv: 400,
      price4x4: 400,
      description:
        "Basic wash with premium products included + snow foam pre-wash, bug residue removed, wheels arches and tyres clean, paint sealant application, full interior steam cleaned, leather conditioning, exhaust clean, door jambs degreased and deep cleaned",
      isExtra: false,
      sortOrder: 2,
    },
    {
      name: "Full Detailing",
      priceHatchSedan: 750,
      priceSuv: 800,
      price4x4: 800,
      description:
        "Mini detailing included + textile surfaces cleaned with spray extraction cleaner, interior full dressed, engine bay detail, paint decontamination, exterior polish, exhaust polish",
      isExtra: false,
      sortOrder: 3,
    },
    {
      name: "Ceramic Coat Package",
      priceHatchSedan: 1400,
      priceSuv: 1500,
      price4x4: 1500,
      description:
        "Basic wash with premium products included, Gtechniq Crystal Serum Light Ceramic coat application. Exterior Polish included (Max 10k odo)",
      isExtra: false,
      sortOrder: 4,
    },
    {
      name: "New Car Package",
      priceHatchSedan: 1850,
      priceSuv: 1950,
      price4x4: 1950,
      description:
        "Ceramic coat package included, fabric and/or leather protection, interior trim protection, windscreen coating. Optional: exterior polish stage 2 (+$300)",
      isExtra: false,
      sortOrder: 5,
    },
    // Extras
    {
      name: "Wheel Face Ceramic Coat",
      priceHatchSedan: 150,
      priceSuv: 150,
      price4x4: 150,
      description: "Ceramic coating applied to wheel faces",
      isExtra: true,
      sortOrder: 10,
    },
    {
      name: "Leather Protection",
      priceHatchSedan: 200,
      priceSuv: 200,
      price4x4: 200,
      description: "Leather surface protection treatment",
      isExtra: true,
      sortOrder: 11,
    },
    {
      name: "Window Protection",
      priceHatchSedan: 200,
      priceSuv: 200,
      price4x4: 200,
      description: "Window coating and protection",
      isExtra: true,
      sortOrder: 12,
    },
    {
      name: "Paint Protection",
      priceHatchSedan: 100,
      priceSuv: 100,
      price4x4: 100,
      description: "Paint protection application",
      isExtra: true,
      sortOrder: 13,
    },
    {
      name: "Headbeams Rejuvenated",
      priceHatchSedan: 150,
      priceSuv: 150,
      price4x4: 150,
      description: "Headlight restoration and rejuvenation",
      isExtra: true,
      sortOrder: 14,
    },
    {
      name: "Exterior Polish",
      priceHatchSedan: 350,
      priceSuv: 350,
      price4x4: 350,
      description: "Full exterior polish (price may vary, contact for quote)",
      isExtra: true,
      sortOrder: 15,
    },
  ];

  for (const service of services) {
    await prisma.service.create({ data: service });
  }

  // Seed a sample client with vehicle for testing
  const client = await prisma.client.create({
    data: {
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@email.com",
      phone: "0412 345 678",
      address: "42 Ocean Drive",
      suburb: "Mooloolaba",
      notes: "Gate code: 1234. Has a golden retriever - expect some pet hair.",
      vehicles: {
        create: [
          {
            make: "Toyota",
            model: "RAV4",
            year: 2022,
            color: "White",
            rego: "ABC123",
            vehicleType: "suv",
            notes: "",
          },
          {
            make: "Mazda",
            model: "3",
            year: 2020,
            color: "Soul Red",
            rego: "XYZ789",
            vehicleType: "hatch_sedan",
            notes: "Small scratch on rear bumper",
          },
        ],
      },
    },
  });

  const client2 = await prisma.client.create({
    data: {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.j@email.com",
      phone: "0423 456 789",
      address: "15 Beach Road",
      suburb: "Noosa Heads",
      notes: "Prefers morning appointments. Very particular about interior.",
      vehicles: {
        create: [
          {
            make: "BMW",
            model: "X5",
            year: 2023,
            color: "Black Sapphire",
            rego: "BMW555",
            vehicleType: "suv",
          },
        ],
      },
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log(`   - ${services.length} services created`);
  console.log(`   - 2 sample clients with 3 vehicles created`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
