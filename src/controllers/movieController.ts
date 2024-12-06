import { Request, Response } from "express";
import { getMoviesWithCredits } from "../services/movieService";
import { MovieWithCredits } from "../interfaces/movies";

export async function getMovieLists(req: Request, resp: Response): Promise<void> {
  try {
    const year = req.params.year;
    if (!year || isNaN(Number(year))) {
      resp.status(400).json({ error: "Year is required and must be a valid number" });
      return;
    }
    const movies: MovieWithCredits[] = await getMoviesWithCredits(year);
    
    resp.status(200).json(movies);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    resp.status(500).json({ error: message });
  }
}
