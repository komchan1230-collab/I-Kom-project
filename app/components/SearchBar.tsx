"use client";

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  onOpenChat: () => void;
}

export default function SearchBar({ query, onQueryChange, onOpenChat }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        {/* Search Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-4 w-5 h-5 text-[var(--text-muted)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="ค้นหาคอมพิวเตอร์... เช่น RTX 4090, เกมมิ่ง, แล็ปท็อป"
          className="w-full pl-12 pr-36 py-3.5 rounded-xl glass text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/50 focus:border-[var(--accent-blue)]/50 transition-all text-sm"
        />

        {/* AI Search Button */}
        <button
          onClick={onOpenChat}
          className="absolute right-2 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-blue)] text-white text-xs font-medium hover:shadow-lg hover:shadow-[var(--accent-blue)]/20 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          ถาม AI
        </button>
      </div>
    </div>
  );
}
