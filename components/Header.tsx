
import React from 'react';

interface HeaderProps {
  currentFactionName: string;
  turnNumber: number;
  year: number;
  month: number;
}

const Header: React.FC<HeaderProps> = ({ currentFactionName, turnNumber, year, month }) => {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-2xl lg:text-3xl font-bold">삼국지 Lite</h1>
        <div className="text-sm sm:text-base mt-2 sm:mt-0">
          <span>{year}년 {month}월 (턴 {turnNumber})</span>
          <span className="mx-2">|</span>
          <span>현재 세력: <span className="font-semibold">{currentFactionName}</span></span>
        </div>
      </div>
    </header>
  );
};

export default Header;
