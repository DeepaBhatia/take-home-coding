import axios from 'axios';
import { Movie, MovieWithCredits } from "../interfaces/movies";
import { Credits } from "../interfaces/credits";

// Fetch movies with credits
export async function getMoviesWithCredits(year: string): Promise<MovieWithCredits[]> {
  try {
    // Fetch movie list from the API
    const movieResponse = await axios.get<{ results: Movie[] }>(`${process.env.BASE_URL}/discover/movie`, {
      headers: {
        Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
      },
      params: {
        language: 'en-US',
        page: 1,
        primary_release_year: year,
        sort_by: 'popularity.desc',
      },
    });

    const movies: Movie[] = movieResponse.data.results;

    // Fetch credits for each movie concurrently
    const moviesWithCredits = await Promise.all(
      movies.map(async (movie): Promise<MovieWithCredits> => {
        const editors = movie.id ? await fetchCredits(movie.id, movie.title) : [];
        return {
          title: movie.title || "Unknown Title",
          release_date: movie.release_date || "Unknown Release Date",
          vote_average: movie.vote_average || 0,
          editors,
        };
      })
    );

    return moviesWithCredits;

  } catch (error: any) {
    console.error("Error fetching movies with credits:", error.message || error);
    throw new Error("Failed to fetch movies with credits.");
  }
}

// Helper function to fetch credits for a movie
async function fetchCredits(movieId: number, movieTitle: string): Promise<string[]> {
  try {
    const creditsResponse = await axios.get<Credits>(`${process.env.BASE_URL}/movie/${movieId}/credits`, {
      headers: {
        Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
      },
      params: {
        language: "en-US",
      },
    });

    const editors = creditsResponse.data.crew
      .filter((crew) => crew.known_for_department === "Editing")
      .map((editor) => editor.name);

    return editors;
  } catch (creditsError: any) {
    console.error(`Error fetching credits for movie ${movieTitle}:`, creditsError.message || creditsError);
    return []; // Return an empty array if credits can't be fetched
  }
}
