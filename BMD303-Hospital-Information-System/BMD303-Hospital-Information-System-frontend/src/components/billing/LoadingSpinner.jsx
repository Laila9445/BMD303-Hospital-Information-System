const LoadingSpinner = ({ label = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-slate-500">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
      <p className="mt-3 text-xs">{label}</p>
    </div>
  );
};

export default LoadingSpinner;
