import React from 'react';
import { Button } from "@/components/ui/button";
import { Search, Menu } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode }) => {
  return (
    <header className={`bg-gradient-to-r ${isDarkMode ? 'from-purple-900 to-indigo-800' : 'from-blue-400 to-teal-300'} py-4 px-6 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-white">
              <span className="animate-pulse">Crypto</span>
              <span className="text-yellow-400">Trade</span>
            </h1>
            <nav className="hidden md:flex space-x-1">
              {['Markets', 'Exchange', 'Wallet', 'Futures'].map((item) => (
                <Button
                  key={item}
                  variant="ghost"
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
                >
                  {item}
                </Button>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search markets"
                className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <Button variant="ghost" className="md:hidden text-white">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;