'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from './SearchBar';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const token = user?.accessToken;
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <nav className="bg-teal-900 p-4 text-white relative z-50">
      <div className="flex justify-between items-center">
        <span className="text-cyan-400 text-3xl font-bold">Ecommerce</span>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex w-full max-w-md mx-4">
          <SearchBar />
        </div>


        {/* Desktop buttons */}
        <div className="hidden md:flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#319795', color: '#ffffff' }}
            className="bg-white text-teal-900 px-4 py-2 rounded-lg font-semibold transition-all"
            onClick={() => router.push('/add-post')}
          >
            Adaugă anunț nou
          </motion.button>

          <div className="relative group">
            <button
              className="bg-white text-teal-900 p-2 rounded-full hover:shadow cursor-pointer"
              onClick={() => {
                if (!isLoggedIn) router.push('/login');
              }}
            >
              <PersonIcon fontSize="large" />
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {isLoggedIn && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 bg-white text-black shadow-lg rounded-md p-2 w-40 z-10 invisible group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 opacity-0 -translate-y-1 transition-all duration-200"
                >
                  <button
                    onClick={() => router.push('/profile')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Profil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white"
          >
            {isMenuOpen ? <CloseIcon fontSize="large" /> : <MenuIcon fontSize="large" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="md:hidden flex flex-col gap-4 mt-4 bg-teal-800 rounded-xl p-4"
          >
            <div className="w-full">
              <SearchBar />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white text-teal-900 px-4 py-2 rounded-lg font-semibold"
              onClick={() => {
                setIsMenuOpen(false);
                router.push('/add-post');
              }}
            >
              Adaugă anunț nou
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white text-teal-900 px-4 py-2 rounded-lg font-semibold"
              onClick={() => {
                setIsMenuOpen(false);
                isLoggedIn ? router.push('/profile') : router.push('/login');
              }}
            >
              {isLoggedIn ? 'Profil' : 'Login'}
            </motion.button>
            {isLoggedIn && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.05 }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
              >
                Logout
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
