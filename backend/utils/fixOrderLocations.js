const mongoose = require("mongoose");
const Order = require("../models/orderModel");
const Restaurant = require("../models/restaurantModel");
const Customer = require("../models/customerModel");

// Fix orders that are missing location data
async function fixOrderLocations() {
  try {
    // Find orders without location data OR with empty/invalid coordinates
    const orders = await Order.find({
      $or: [
        { restaurant_location: { $exists: false } },
        { customer_location: { $exists: false } },
        { "restaurant_location.coordinates": { $exists: false } },
        { "customer_location.coordinates": { $exists: false } },
        { "restaurant_location.coordinates": { $size: 0 } },
        { "customer_location.coordinates": { $size: 0 } },
      ],
    });

    console.log(`\n🔍 Found ${orders.length} orders to fix\n`);

    let fixedCount = 0;
    let failedCount = 0;

    for (const order of orders) {
      let updated = false;
      console.log(`\n📦 Processing Order ID: ${order._id}`);
      console.log(`   Order Number: ${order.order_id || "N/A"}`);

      // Fix restaurant location
      if (
        !order.restaurant_location ||
        !order.restaurant_location.coordinates ||
        order.restaurant_location.coordinates.length === 0
      ) {
        console.log(`   ⚠️  Missing restaurant location`);
        const restaurant = await Restaurant.findById(order.restaurant_id);
        if (
          restaurant &&
          restaurant.restaurant_location &&
          restaurant.restaurant_location.coordinates &&
          restaurant.restaurant_location.coordinates.length === 2
        ) {
          order.restaurant_location = {
            type: "Point",
            coordinates: restaurant.restaurant_location.coordinates,
          };
          updated = true;
          console.log(
            `   ✅ Fixed restaurant location: [${restaurant.restaurant_location.coordinates}]`,
          );
        } else {
          console.log(
            `   ❌ Could not fix restaurant location - profile has no coordinates`,
          );
          failedCount++;
        }
      } else {
        console.log(`   ✓ Restaurant location OK`);
      }

      // Fix customer location
      if (
        !order.customer_location ||
        !order.customer_location.coordinates ||
        order.customer_location.coordinates.length === 0
      ) {
        console.log(`   ⚠️  Missing customer location`);
        const customer = await Customer.findById(order.customer_id);
        if (
          customer &&
          customer.customer_location &&
          customer.customer_location.coordinates &&
          customer.customer_location.coordinates.length === 2
        ) {
          order.customer_location = {
            type: "Point",
            coordinates: customer.customer_location.coordinates,
          };
          updated = true;
          console.log(
            `   ✅ Fixed customer location: [${customer.customer_location.coordinates}]`,
          );
        } else {
          console.log(
            `   ❌ Could not fix customer location - profile has no coordinates`,
          );
          failedCount++;
        }
      } else {
        console.log(`   ✓ Customer location OK`);
      }

      if (updated) {
        await order.save();
        fixedCount++;
        console.log(`   💾 Saved updates for order ${order._id}`);
      } else {
        console.log(`   ⏭️  No updates needed`);
      }
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`✅ Finished fixing order locations`);
    console.log(`   Fixed: ${fixedCount} orders`);
    console.log(`   Failed: ${failedCount} issues`);
    console.log(`${"=".repeat(60)}\n`);
  } catch (err) {
    console.error("❌ Error fixing order locations:", err);
  }
}

module.exports = { fixOrderLocations };

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
      console.log("Database connected");
      return fixOrderLocations();
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
