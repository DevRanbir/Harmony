export default function Subscription() {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      features: ["Basic access", "View limited charts", "Community support"],
    },
    {
      name: "Pro",
      price: "₹499/month",
      features: ["Unlimited data queries", "Advanced charts", "Email support"],
    },
    {
      name: "Enterprise",
      price: "₹1499/month",
      features: ["All Pro features", "Team access", "Dedicated support"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl font-bold text-blue-800 mb-6">
        Choose Your Plan
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform duration-200"
          >
            <h2 className="text-2xl font-semibold text-gray-800">{plan.name}</h2>
            <p className="text-3xl font-bold text-blue-600 mt-4">{plan.price}</p>
            <ul className="mt-4 space-y-2 text-gray-600">
              {plan.features.map((feature, idx) => (
                <li key={idx}>✅ {feature}</li>
              ))}
            </ul>
            <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
