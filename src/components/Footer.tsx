export default function Footer() {
  return (
    <footer className="bg-brand-100 border-t border-brand-600/30">
      <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <p className="text-sm text-zinc-700">© {new Date().getFullYear()} Best Brownie</p>
        <p className="text-sm text-zinc-700">Feito com amor e cacau ♥</p>
      </div>
    </footer>
  );
}