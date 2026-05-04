function Loader() {
  return (
    <div className="fixed left-0 top-0 w-full h-screen flex items-center justify-center  backdrop-blur-[2px] bg-white/10 z-100">
      <div className=" loader   "></div>
    </div>
  );
}
function LoaderSpinner() {
  return (
    <div className="space-y-4 w-full px-4">
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-emerald-200 rounded-full"></div>
      </div>
    </div>
  );
}

export { Loader, LoaderSpinner };
