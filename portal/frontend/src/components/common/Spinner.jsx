export default function Spinner({ className = 'h-8 w-8' }) {
  return (
    <div className="flex justify-center items-center py-12">
      <div className={`animate-spin rounded-full border-b-2 border-primary-500 ${className}`} />
    </div>
  );
}
