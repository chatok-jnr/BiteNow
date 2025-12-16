function Analytics({ restaurant, foodItems, orders }) {
  // Calculate analytics
  const totalRevenue = restaurant?.restaurant_total_revenue || 0;
  const totalSales = restaurant?.restaurant_total_sales || 0;
  const avgRating = restaurant?.restaurant_rating?.average || 0;
  const reviewCount = restaurant?.restaurant_rating?.count || 0;

  // Today's stats (mock - would come from filtered orders)
  const todayOrders = orders.filter((order) => {
    const orderDate = new Date(order.created_at);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });

  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const pendingOrders = orders.filter((o) => ["new", "accepted", "preparing"].includes(o.order_status)).length;
  const completedOrders = orders.filter((o) => o.order_status === "delivered").length;
  const cancelledOrders = orders.filter((o) => o.order_status === "cancelled").length;

  // Best and worst performers
  const itemSales = foodItems.map((item) => {
    const sold = orders
      .filter((o) => o.order_status === "delivered")
      .reduce((total, order) => {
        const orderItem = order.items.find((i) => i.food_id === item._id);
        return total + (orderItem ? orderItem.quantity : 0);
      }, 0);
    return { ...item, sold };
  });

  const bestSellers = [...itemSales].sort((a, b) => b.sold - a.sold).slice(0, 5);
  const worstPerformers = [...itemSales].filter((item) => item.sold > 0).sort((a, b) => a.sold - b.sold).slice(0, 5);

  // Acceptance rate
  const acceptedCount = orders.filter((o) => o.order_status !== "cancelled" && o.order_status !== "new").length;
  const acceptanceRate = orders.length > 0 ? ((acceptedCount / orders.length) * 100).toFixed(1) : 0;
  const cancellationRate = orders.length > 0 ? ((cancelledOrders / orders.length) * 100).toFixed(1) : 0;

  // Weekly revenue (mock data)
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyData = weekDays.map((day, index) => ({
    day,
    revenue: Math.floor(totalRevenue / 30) + Math.random() * 1000,
    orders: Math.floor(totalSales / 30) + Math.floor(Math.random() * 10),
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">৳{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalSales}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{avgRating.toFixed(1)} ⭐</p>
              <p className="text-xs text-gray-500">{reviewCount} reviews</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">৳{todayRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{todayOrders.length} orders</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Order Stats */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
            <p className="text-sm text-gray-600 mt-1">Total Orders</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{pendingOrders}</p>
            <p className="text-sm text-gray-600 mt-1">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{completedOrders}</p>
            <p className="text-sm text-gray-600 mt-1">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{cancelledOrders}</p>
            <p className="text-sm text-gray-600 mt-1">Cancelled</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Order Acceptance Rate</span>
                <span className="text-sm font-bold text-green-600">{acceptanceRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${acceptanceRate}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Order Cancellation Rate</span>
                <span className="text-sm font-bold text-red-600">{cancellationRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-600 h-3 rounded-full transition-all"
                  style={{ width: `${cancellationRate}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Average Order Value</span>
                <span className="text-sm font-bold text-gray-900">
                  ৳{totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Revenue Trend</h3>
          <div className="space-y-3">
            {weeklyData.map((data, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600 w-12">{data.day}</span>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div
                        className="bg-primary h-6 rounded-full flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${(data.revenue / Math.max(...weeklyData.map((d) => d.revenue))) * 100}%` }}
                      >
                        <span className="text-xs text-white font-semibold">
                          ৳{data.revenue.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 w-16 text-right">{data.orders} orders</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best and Worst Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            🏆 Best Selling Items
          </h3>
          <div className="space-y-3">
            {bestSellers.length > 0 ? (
              bestSellers.map((item, index) => (
                <div key={item._id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full font-bold text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">{item.food_name}</p>
                      <p className="text-sm text-gray-600">৳{item.food_price}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{item.sold}</p>
                    <p className="text-xs text-gray-500">sold</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No sales data available yet</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            📉 Needs Attention
          </h3>
          <div className="space-y-3">
            {worstPerformers.length > 0 ? (
              worstPerformers.map((item, index) => (
                <div key={item._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-full font-bold text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">{item.food_name}</p>
                      <p className="text-sm text-gray-600">৳{item.food_price}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{item.sold}</p>
                    <p className="text-xs text-gray-500">sold</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">All items performing well!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
