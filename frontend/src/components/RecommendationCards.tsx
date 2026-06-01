type RecommendationCardProps = {
  name: string;
  category: string;
  rating: number;
  phone?: string;
  priceLevel?: string;
};

export default function RecommendationCard({
  name,
  category,
  rating,
  phone,
  priceLevel,
}: RecommendationCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-md border border-gray-200 hover:shadow-lg transition">
      <h2 className="text-xl font-bold text-gray-900">{name}</h2>

      <p className="mt-2 text-sm text-gray-600">
        Category: <span className="font-medium">{category}</span>
      </p>

      <p className="mt-1 text-sm text-gray-600">
        Rating: <span className="font-medium">⭐ {rating}</span>
      </p>

      {phone && (
        <p className="mt-1 text-sm text-gray-600">
          Phone: <span className="font-medium">{phone}</span>
        </p>
      )}

      {priceLevel && (
        <p className="mt-1 text-sm text-gray-600">
          Price: <span className="font-medium">{priceLevel}</span>
        </p>
      )}
    </div>
  );
}