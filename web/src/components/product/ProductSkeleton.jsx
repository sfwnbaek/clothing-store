export default function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square bg-hairline mb-4" />
      <div className="h-3 bg-hairline w-1/3 mb-2" />
      <div className="h-4 bg-hairline w-2/3 mb-2" />
      <div className="h-4 bg-hairline w-1/4" />
    </div>
  );
}