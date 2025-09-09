import React, { useEffect, useState } from 'react';

const StoreDashboard = () => {
  const [ratings, setRatings] = useState([]);
  const [average, setAverage] = useState(null); // ✅ new state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token'); // or use context if you have it

  useEffect(() => {
    fetch('http://localhost:3000/api/ratings/store-owner', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch ratings');
        }
        return res.json();
      })
      .then((data) => {
        console.log('Ratings fetched:', data);
        setRatings(data.ratings); // ✅ updated
        setAverage(data.averageRating); // ✅ updated
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading ratings:', err);
        setError('Could not load ratings');
        setLoading(false);
      });
  }, []);

  const getRatingColor = (rating) => {
    if (rating > 4) return 'text-green-500';
    if (rating > 2) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Recent Ratings</h2>

      {/* ✅ Show average rating */}
      {average !== null && (
        <p className="text-lg font-semibold mb-2">
          Average Rating:{' '}
          <span className={`text-xl ${getRatingColor(average)}`}>
            {average.toFixed(2)} ⭐
          </span>{' '}
          {average > 4 ? '😍' : average > 2 ? '🙂' : '😢'}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500">Loading ratings...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : ratings.length === 0 ? (
        <p className="text-gray-500">No ratings submitted yet</p>
      ) : (
        <table className="w-full text-sm text-left border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Rating</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {ratings.map((r, index) => {
              const displayName = r.userName || 'Unknown';
              const ratingColor = getRatingColor(r.rating);
              const formattedDate = new Date(r.createdAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              });

              return (
                <tr key={r.id || index} className="border-t">
                  <td className="px-4 py-2">{displayName}</td>
                  <td className={`px-4 py-2 ${ratingColor}`}>{r.rating} ⭐</td>
                  <td className="px-4 py-2">{formattedDate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StoreDashboard;