const mongoose = require("mongoose");
const Customer = require("../models/customerModel");
const Order = require("../models/orderModel");

// Check which customers need location updates
async function checkCustomerLocations() {
  try {
    // Find all customers
    const customers = await Customer.find({});

    console.log(`\n${"=".repeat(70)}`);
    console.log(`📍 CUSTOMER LOCATION STATUS`);
    console.log(`${"=".repeat(70)}\n`);

    let withLocation = 0;
    let withoutLocation = 0;
    const customersWithoutLocation = [];

    for (const customer of customers) {
      const hasLocation =
        customer.customer_location &&
        customer.customer_location.coordinates &&
        customer.customer_location.coordinates.length === 2;

      if (hasLocation) {
        withLocation++;
        console.log(
          `✅ ${customer.customer_name} (${customer.customer_email}) - Has location`,
        );
      } else {
        withoutLocation++;
        customersWithoutLocation.push({
          id: customer._id,
          name: customer.customer_name,
          email: customer.customer_email,
        });
        console.log(
          `❌ ${customer.customer_name} (${customer.customer_email}) - NO location`,
        );
      }
    }

    console.log(`\n${"=".repeat(70)}`);
    console.log(`📊 SUMMARY:`);
    console.log(`   Total Customers: ${customers.length}`);
    console.log(`   With Location: ${withLocation}`);
    console.log(`   Without Location: ${withoutLocation}`);
    console.log(`${"=".repeat(70)}\n`);

    // Check if orders exist for customers without locations
    if (customersWithoutLocation.length > 0) {
      console.log(`\n🔍 Checking orders for customers without locations...\n`);

      for (const customer of customersWithoutLocation) {
        const orderCount = await Order.countDocuments({
          customer_id: customer.id,
          order_status: {
            $in: ["pending", "confirmed", "preparing", "out_for_delivery"],
          },
        });

        if (orderCount > 0) {
          console.log(
            `⚠️  ${customer.name} has ${orderCount} active order(s) but NO location!`,
          );
        }
      }
    }

    console.log(`\n${"=".repeat(70)}`);
    console.log(`💡 SOLUTION:`);
    console.log(`   Customers must enable location services in their browser`);
    console.log(
      `   and update their location from their profile or home page.`,
    );
    console.log(`${"=".repeat(70)}\n`);
  } catch (err) {
    console.error("❌ Error checking customer locations:", err);
  }
}

module.exports = { checkCustomerLocations };

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
      return checkCustomerLocations();
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
