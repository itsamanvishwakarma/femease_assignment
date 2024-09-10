import React, { useState, useEffect, useRef, useCallback } from "react";

const API_KEY = process.env.REACT_APP_API_KEY;

function LazyImage({ src, alt, style }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true);
          observer.unobserve(imgRef.current);
        }
      },
      { rootMargin: "100px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  return (
    <div ref={imgRef} style={{ ...style, backgroundColor: "#f0f0f0" }}>
      {isLoaded ? (
        <img src={src} alt={alt} style={{ ...style, display: "block" }} />
      ) : (
        <div
          style={{
            ...style,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Loading...
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [animals, setAnimals] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [selectedBreed, setSelectedBreed] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [animalType, setAnimalType] = useState("cat");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBreeds = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.the${animalType}api.com/v1/breeds`,
        {
          headers: { "x-api-key": API_KEY },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBreeds(data);
    } catch (error) {
      setError(`Error fetching ${animalType} breeds: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [animalType]);

  const fetchAnimals = useCallback(
    async (breed = "") => {
      setIsLoading(true);
      setError(null);
      try {
        const url = breed
          ? `https://api.the${animalType}api.com/v1/images/search?breed_ids=${breed}&limit=20`
          : `https://api.the${animalType}api.com/v1/images/search?limit=20`;
        const response = await fetch(url, {
          headers: { "x-api-key": API_KEY },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAnimals(data);
      } catch (error) {
        setError(`Error fetching ${animalType}s: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [animalType]
  );

  useEffect(() => {
    fetchBreeds();
    fetchAnimals();
  }, [animalType, fetchBreeds, fetchAnimals]);

  const handleBreedChange = (e) => {
    setSelectedBreed(e.target.value);
    fetchAnimals(e.target.value);
  };

  const handleSearch = () => {
    const filteredBreed = breeds.find((breed) =>
      breed.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredBreed) {
      setSelectedBreed(filteredBreed.id);
      fetchAnimals(filteredBreed.id);
    } else {
      setError("No matching breed found.");
    }
  };

  const handleAnimalTypeChange = (e) => {
    setAnimalType(e.target.value);
    setSelectedBreed("");
    setSearchTerm("");
  };

  const getBreedName = (animal) => {
    return animal.breeds && animal.breeds.length > 0
      ? animal.breeds[0].name
      : "Unknown Breed";
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          marginBottom: "1rem",
          textAlign: "center",
          color: "#333",
        }}
      >
        Pet Gallery
      </h1>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1rem",
          justifyContent: "center",
        }}
      >
        <select
          onChange={handleAnimalTypeChange}
          value={animalType}
          style={{
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
          aria-label="Select animal type"
        >
          <option value="cat">Cats</option>
          <option value="dog">Dogs</option>
        </select>
        <select
          onChange={handleBreedChange}
          value={selectedBreed}
          style={{
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
          aria-label="Select breed"
        >
          <option value="">All Breeds</option>
          {breeds.map((breed) => (
            <option key={breed.id} value={breed.id}>
              {breed.name}
            </option>
          ))}
        </select>
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search breeds"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "0.5rem",
              borderRadius: "4px 0 0 4px",
              border: "1px solid #ccc",
            }}
            aria-label="Search breeds"
          />
          <button
            onClick={handleSearch}
            style={{
              padding: "0.5rem",
              borderRadius: "0 4px 4px 0",
              border: "1px solid #ccc",
              backgroundColor: "#4CAF50",
              color: "white",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </div>
      </div>
      {isLoading && (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            backgroundColor: "#f0f0f0",
            borderRadius: "8px",
            margin: "1rem 0",
          }}
        >
          <div
            style={{
              display: "inline-block",
              width: "50px",
              height: "50px",
              border: "3px solid #333",
              borderTop: "3px solid #4CAF50",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      {error && (
        <p
          style={{
            color: "#d32f2f",
            backgroundColor: "#ffcdd2",
            padding: "1rem",
            borderRadius: "4px",
            textAlign: "center",
            margin: "1rem 0",
          }}
        >
          {error}
        </p>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "1rem",
        }}
      >
        {animals.map((animal) => (
          <div
            key={animal.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1rem",
              backgroundColor: "#fff",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.3s ease",
              ":hover": {
                transform: "scale(1.05)",
              },
            }}
          >
            <LazyImage
              src={animal.url}
              alt={`${animalType} - ${getBreedName(animal)}`}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                borderRadius: "4px",
              }}
            />
            {/* <p
              style={{
                marginTop: "0.5rem",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {getBreedName(animal)}
            </p> */}
          </div>
        ))}
      </div>
    </div>
  );
}
