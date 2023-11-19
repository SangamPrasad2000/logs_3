import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.post('http://localhost:3000/search', {
        searchQuery,
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error during search:', error);
    }
  };

  return (
    <div>
      <h1>Log Query Interface</h1>
      <input
        type="text"
        placeholder="Search logs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      <div>
        <h2>Search Results</h2>
        <ul>
          {searchResults.map((result) => (
            <li key={result._id}>{result.message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
