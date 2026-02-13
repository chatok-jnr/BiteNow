const mongoose = require("mongoose");
const Customer = require("../models/customerModel");

// Set test locations for customers in Dhaka area
async function setTestLocations() {
  try {
    // Test locations in Dhaka, Bangladesh
    const testLocations = [
      {
        area: "Dhaka University Area",
        coordinates: [90.3936, 23.734], // [longitude, latitude]
      },
      {
        area: "Mirpur",
        coordinates: [90.3685, 23.8223],
      },
      {
        area: "Dhanmondi",
        coordinates: [90.3755, 23.751],
      },
      {
        area: "Gulshan",
        coordinates: [90.4078, 23.7808],
      },
    ];

    const customers = await Customer.find({});

    console.log(`\n${"=".repeat(70)}`);
    console.log(`📍 SETTING TEST LOCATIONS FOR CUSTOMERS`);
    console.log(`${"=".repeat(70)}\n`);

    let updatedCount = 0;

    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      const location = testLocations[i % testLocations.length];

      // Only update if customer doesn't have location
      const hasLocation =
        customer.customer_location &&
        customer.customer_location.coordinates &&
        customer.customer_location.coordinates.length === 2;

      if (!hasLocation) {
        customer.customer_location = {
          type: "Point",
          coordinates: location.coordinates,
        };
        customer.lastLocationUpdate = new Date();

        await customer.save();
        updatedCount++;

        console.log(`✅ ${customer.customer_name}`);
        console.log(`   Email: ${customer.customer_email}`);
        console.log(`   Location: ${location.area}`);
        console.log(`   Coordinates: [${location.coordinates}]`);
        console.log(``);
      } else {
        console.log(
          `⏭️  ${customer.customer_name} - Already has location, skipping\n`,
        );
      }
    }

    console.log(`${"=".repeat(70)}`);
    console.log(`✅ Updated ${updatedCount} customer(s) with test locations`);
    console.log(`${"=".repeat(70)}\n`);

    console.log(
      `💡 Now run the fixOrderLocations script to copy these locations to orders:`,
    );
    console.log(`   node utils/fixOrderLocations.js\n`);
  } catch (err) {
    console.error("❌ Error setting test locations:", err);
  }
}

module.exports = { setTestLocations };

// Run if called directly
if (require.main === module) {
  const dotenv = require("dotenv");
  dotenv.config({ path: "./config.env" });

  const DB = (process.env.DATABASE || "").replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD || "",
  );

  mongoose
    .connect(DB)
    .then(() => {
      console.log("Database connected\n");
      return setTestLocations();
    })
    .then(() => {
      console.log("Done!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error:", err);
      process.exit(1);
    });
}
