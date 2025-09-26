export const fetcher = async (url) => {
  const res = await fetch(url);

  if (!res.ok) {
    // Example: "An error occurred: 404 Not Found"
    const message = `An error occurred: ${res.status} ${res.statusText}`;
    const error = new Error(message);

    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};