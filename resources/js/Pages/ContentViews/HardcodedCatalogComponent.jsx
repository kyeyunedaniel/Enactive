import React, { useState, useEffect } from "react";
import { Link, Head } from "@inertiajs/react";
import PageHeaderUnauthenticated from "../PageHeaderUnauthenticated";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const HardcodedCatalogComponent = ({ auth, courses, categories }) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    console.log(e.target.value); 
    setCurrentPage(1); // Reset to first page on category change
  };

  // Filter the courses based on search and selected category
  const filteredItems = courses.filter(
    // console.log(selectedCategory)
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) &&
      (selectedCategory === "All" || item?.category_id === parseInt(selectedCategory) ) //we are using the id of the categories to create a match, no the names. 
  );

  // Calculate the total number of pages
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Get the items for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    console.log("hardcodedCatalog Component " + JSON.stringify(auth));
    console.log("categories "+JSON.stringify(categories));
    console.log("courses "+JSON.stringify(courses));
  }, []);

  const CatalogContent = (
    <div className="catalog-container mx-auto p-4 max-w-6xl">
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
              {/* Dynamically generate categories from courses if necessary */}
              {/* <option value="Medical">Medical</option>
              <option value="Safety">Safety</option> */}
             {/* Dynamically generate categories from the passed 'categories' prop */}
        {categories?.map((category, index) => (
          <option key={category?.index} value={category?.id}>
            {category?.category_name}
          </option>
        ))}
            </select>
          </div>
        </div>

        {/* Catalog Items Section */}
        <div className="catalog-grid w-3/4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentItems.length > 0 ? (
              currentItems.map((item) => (
                <div
                  key={item.id}
                  className="item-card border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <img
                      src={item.image_url || "https://via.placeholder.com/150"} // Fallback image if image_url is null
                      alt={item.title}
                      className="object-cover w-full h-32 mb-4 rounded-md"
                    />
                    <h2 className="text-lg font-semibold">{item.title}</h2>
                    <p className="text-gray-600">{item.description}</p>
                    <p className="text-gray-800 font-bold">Price: {item.course_price} UGX</p>
                  </div>

                  <Link
                    href={route('content-view.course', { item: item })} // Pass item as a parameter
                    className="mt-4 text-blue-500 underline self-end" // Style directly on Link
                  >
                    View Details
                  </Link>

                </div>
              ))
            ) : (
              <p className="col-span-full text-center">No items match your filters.</p>
            )}
        </div>
      </div>

      {/* Pagination */}
      <div className="pagination mt-8 flex justify-center">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-3 py-1 mx-1 rounded ${currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Head title="All Content" />
      {/* Always show Authenticated Header */}
      <AuthenticatedLayout
        user={auth}
        // header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">All Content</h2>}
      >
        {/* {auth?.user ? CatalogContent : <PageHeaderUnauthenticated />} */}
        {CatalogContent}
      </AuthenticatedLayout>
    </>
  );
};

export default HardcodedCatalogComponent;
// content-view.course