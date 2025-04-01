'use client'
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [mesaj, setMesaj] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000")
      .then((response) => response.json())
      .then((data) => {
        setMesaj(data.mesaj);
      })
      .catch((error) => console.error("Error fetching mesaj:", error));
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Navbar */} 
      <nav className="bg-teal-900 p-4 flex justify-between items-center text-white">
        <div className="text-2xl font-bold flex items-center">
          <span className="text-cyan-400 text-4xl">Ecommerce {mesaj}</span>
        </div>
        <div className="flex items-center bg-white text-black px-4 py-2 rounded-lg w-1/2">
          <span className="mr-2">🔍</span>
          <input
            type="text"
            placeholder="Ce anume cauți?"
            className="w-full focus:outline-none"
          />
        </div>
        <button className="bg-white text-teal-900 px-4 py-2 rounded-lg font-semibold">
          Adaugă anunț nou
        </button>
      </nav>
      
      {/* Main Content */}
      <div className="text-center my-8">
        <h2 className="text-3xl font-bold text-gray-900">Categorii principale</h2>
      </div>
      
      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-6 px-8">
        {categories.map((category, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: category.bgColor }}
            >
              <Image src={category.icon} width={50} height={50} alt={category.name} />
            </div>
            <p className="text-center text-gray-700 mt-2 text-sm font-medium">
              {category.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const categories = [
  { name: "Auto, moto și ambarcațiuni", icon: "/car.png", bgColor: "#FFD700" },
  { name: "Imobiliare", icon: "/key.png", bgColor: "#00CED1" },
  { name: "Locuri de muncă", icon: "/briefcase.png", bgColor: "#4682B4" },
  { name: "Electronice și electrocasnice", icon: "/phone.png", bgColor: "#FF6347" },
  { name: "Moda și frumusețe", icon: "/dress.png", bgColor: "#4169E1" },
  { name: "Piese auto", icon: "/car-door.png", bgColor: "#D3D3D3" },
  { name: "Casă și grădină", icon: "/sofa.png", bgColor: "#ADD8E6" },
  { name: "Mamă și copil", icon: "/stroller.png", bgColor: "#FFB6C1" },
  { name: "Sport, timp liber, artă", icon: "/football.png", bgColor: "#FFD700" },
];
