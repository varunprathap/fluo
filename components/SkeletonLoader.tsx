export default function SkeletonLoader() {
  return (
    <div className="p-8">
      <div className="animate-pulse h-8 bg-gray-200 rounded mb-4 w-1/2" />
      <div className="animate-pulse h-4 bg-gray-200 rounded mb-2 w-full" />
      <div className="animate-pulse h-4 bg-gray-200 rounded mb-2 w-3/4" />
      {/* Add more skeleton elements as needed */}
    </div>
  );
} 