export default function Footer() {
  return (
    <footer className="border-t border-hairline mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between gap-6">
        <p className="font-display font-black text-xl uppercase tracking-tight">Stride</p>
        <p className="text-graphite text-sm">&copy; {new Date().getFullYear()} Stride. All rights reserved.</p>
      </div>
    </footer>
  );
}