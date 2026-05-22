'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  placeholder?: string;
  initial?: string;
  size?: 'lg' | 'md';
}

export function SearchBar({
  placeholder = "Try 'Canon AE-1', 'Leica M3', 'Pentax K1000'",
  initial = '',
  size = 'lg',
}: Props) {
  const [value, setValue] = useState(initial);
  const router = useRouter();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/browse?q=${encodeURIComponent(q)}` : '/browse');
  };
  const big = size === 'lg';
  return (
    <form
      onSubmit={submit}
      className={`flex items-center bg-white border border-line rounded-[13px] shadow-soft ${
        big ? 'p-1.5 pl-[18px]' : 'p-1 pl-3'
      }`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9AA9BE"
        strokeWidth="2"
        className="shrink-0"
        aria-hidden
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 bg-transparent outline-none px-3 ${
          big ? 'py-3 text-base' : 'py-2 text-sm'
        } placeholder:text-slate/70`}
        aria-label="Search cameras"
      />
      <button
        type="submit"
        className={`btn-accent rounded-[10px] font-semibold ${
          big ? 'px-5 py-2.5 text-sm' : 'px-4 py-2 text-xs'
        }`}
      >
        Search
      </button>
    </form>
  );
}
