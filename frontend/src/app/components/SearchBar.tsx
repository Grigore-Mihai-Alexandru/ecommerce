'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchBar() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (search.trim()) {
      router.push(`/search?query=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <motion.div
      className="flex items-center bg-white text-black px-4 py-2 rounded-lg max-w-md w-full mx-4 focus-within:shadow-lg transition-all duration-300 relative"
      whileFocus={{ scale: 1.05 }}
    >
      <span className="mr-2 text-gray-600">🔍</span>
      <input
        type="text"
        placeholder="Ce anume cauți?"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full focus:outline-none"
      />
      <AnimatePresence>
        {search.trim() && (
          <motion.button
            key="searchBtn"
            initial={{ opacity: 0, scale: 0.8, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-600 text-white rounded-full p-2 hover:bg-teal-700 focus:outline-none"
            onClick={handleSearch}
            aria-label="Caută"
          >
            <SearchIcon />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
