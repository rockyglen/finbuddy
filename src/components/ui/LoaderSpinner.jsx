// components/ui/LoaderSpinner.jsx (Create this file)
export default function LoaderSpinner() {
  return (
    <div className="absolute inset-0 bg-white/70 dark:bg-black/50 flex items-center justify-center z-10 rounded-xl">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
