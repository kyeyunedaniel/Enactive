import React, { useState, useEffect } from "react";
import { Link, Head } from "@inertiajs/react";
import PageHeaderUnauthenticated from "../PageHeaderUnauthenticated";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const HardcodedCatalogComponent = ({ auth }) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const catalogItems = [
    {
      id: 1,
      name: "Basic Life Support (BLS) Course",
      description: "Learn the essential steps for basic life support.",
      category: "Medical",
      image: "https://via.placeholder.com/150",
    },
    {
      id: 2,
      name: "Advanced Cardiovascular Life Support (ACLS) Course",
      description: "In-depth training for advanced cardiovascular support.",
      category: "Medical",
      image: "https://via.placeholder.com/150",
    },
    {
      id: 3,
      name: "First Aid Essentials",
      description: "Learn how to handle common first aid scenarios.",
      category: "Safety",
      image: "https://via.placeholder.com/150",
    },
    {
      id: 4,
      name: "Pediatric Life Support",
      description: "Specialized support techniques for pediatric care.",
      category: "Medical",
      image: "https://via.placeholder.com/150",
    },
  ];

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const filteredItems = catalogItems.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (selectedCategory === "All" || item.category === selectedCategory)
  );

  useEffect(() => {
    console.log("hardcodedCatalog Component " + JSON.stringify(auth));
  }, []);

  const CatalogContent = (
    <div className="catalog-container mx-auto p-4 max-w-6xl">
      {/* <h1 className="text-2xl font-bold mb-4">Catalog</h1> */}

      <div className="flex">
        {/* Sidebar Filter */}
        <div className="filter-sidebar w-1/4 pr-4">
          <h2 className="text-xl font-semibold mb-2">Filters</h2>

          {/* Search Filter */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={handleSearchChange}
              className="border px-3 py-2 rounded w-full"
            />
          </div>

          {/* Category Filter */}
          <div className="mb-4">
            <label className="font-medium">Category</label>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="border px-3 py-2 rounded w-full mt-1"
            >
              <option value="All">All</option>
              <option value="Medical">Medical</option>
              <option value="Safety">Safety</option>
            </select>
          </div>
        </div>

        {/* Catalog Items Section */}
        <div className="catalog-grid w-3/4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="item-card border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="object-cover w-full h-32 mb-4 rounded-md"
                />
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-gray-600">{item.description}</p>
                <button
                  onClick={() => alert(`Viewing details for ${item.name}`)}
                  className="mt-4 text-blue-500 underline"
                >
                  View Details
                </button>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center">No items match your filters.</p>
          )}
        </div>
      </div>

      {/* Pagination - Static for Demo */}
      <div className="pagination mt-8 flex justify-center">
        <button className="px-3 py-1 mx-1 bg-gray-200 rounded">1</button>
        <button className="px-3 py-1 mx-1 bg-blue-500 text-white rounded">2</button>
        <button className="px-3 py-1 mx-1 bg-gray-200 rounded">3</button>
      </div>
    </div>
  );

  return (
    <>
      <Head title="All Content" />
      {/* Always show Authenticated Header */}
      <AuthenticatedLayout
        user={auth}
        header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">All Content</h2>}
      >
        {auth?.user ? CatalogContent : <PageHeaderUnauthenticated />}
        {CatalogContent}
      </AuthenticatedLayout>
    </>
  );
};

export default HardcodedCatalogComponent;


{/* <AuthenticatedLayout
        user={auth}
        // header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">All Content</h2>}
      >
        {auth?.user ? CatalogContent : <PageHeaderUnauthenticated />}
        {CatalogContent}
      </AuthenticatedLayout> */}