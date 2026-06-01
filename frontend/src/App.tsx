import RecommendationCard from "./components/RecommendationCards";

const activities = [
  {
    name: "Gluvo Kuče",
    category: "bar",
    rating: 4.6,
    phone: "+389 71 721 545",
    priceLevel: "Moderate",
  },
  {
    name: "Fitness House",
    category: "restaurant",
    rating: 3.9,
    phone: "+389 72 699 999",
    priceLevel: "Moderate",
  },
  {
    name: "Bar Kino Karpoš",
    category: "bar",
    rating: 4.5,
    phone: "+389 2 321 3515",
    priceLevel: "Moderate",
  },
  {
    name: "Cafe Bar Che",
    category: "coffee shop",
    rating: 4.7,
    phone: "+389 71 696 063",
    priceLevel: "Inexpensive",
  },
  {
    name: "The Brunch Cafe",
    category: "restaurant",
    rating: 4.7,
    phone: "+389 77 661 424",
  },
  {
    name: "Amigos Mexican Restaurant & Bar",
    category: "mexican restaurant",
    rating: 4.5,
    phone: "+389 71 230 315",
    priceLevel: "Moderate",
  },
];

function App() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Recommended Activities
        </h1>

        <p className="mb-6 text-gray-600">
          Discover recommended local places based on activity data.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <RecommendationCard
              key={activity.name}
              name={activity.name}
              category={activity.category}
              rating={activity.rating}
              phone={activity.phone}
              priceLevel={activity.priceLevel}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default App;