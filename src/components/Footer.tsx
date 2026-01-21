import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 py-4 text-sm text-gray-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© SolaCheck {new Date().getFullYear()}</span>

        <div className="flex gap-4">
          <Link href="/impressum" className="hover:underline">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:underline">
            Datenschutz
          </Link>
          <a
            href="https://github.com/feydernoah/SolaCheck.git"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
