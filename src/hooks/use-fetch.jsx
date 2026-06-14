import { useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";

const useFetch = (cb, options = {}) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const fn = async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken({ template: "supabase" });
      if (!token) {
        throw new Error("Clerk Supabase token is null! Check if the 'supabase' JWT template exists in your Clerk dashboard.");
      }
      const response = await cb(token, options, ...args);
      setData(response);
      setError(null);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { fn, data, loading, error };
};

export default useFetch;