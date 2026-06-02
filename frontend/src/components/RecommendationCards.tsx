type RecommendationCardProps = {
  name: string;
  category: string;
  rating: number;
  phone?: string;
  priceLevel?: string;
  distanceKm?: number;
  recommendationScore?: number;
  recommendationReason?: string;
  isOpen?: boolean;
};

export default function RecommendationCard({
  name,
  category,
  rating,
  phone,
  priceLevel,
  distanceKm,
  recommendationScore,
  recommendationReason,
  isOpen,
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

      {typeof distanceKm === 'number' && (
        <p className="mt-1 text-sm text-gray-600">
          Distance: <span className="font-medium">{distanceKm.toFixed(2)} km</span>
        </p>
      )}

      {typeof recommendationScore === 'number' && (
        <p className="mt-1 text-sm text-gray-600">
          Score: <span className="font-medium">{recommendationScore.toFixed(3)}</span>
        </p>
      )}

      {typeof isOpen === 'boolean' && (
        <p className="mt-1 text-sm text-gray-600">
          Status: <span className="font-medium">{isOpen ? 'Open now' : 'Closed now'}</span>
        </p>
      )}

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

      {recommendationReason && (
        <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {recommendationReason}
        </p>
      )}
    </div>
  );
}