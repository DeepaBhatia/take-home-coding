import { Request, Response } from "express";
import { getMovieLists } from "../src/controllers/movieController";
import axios from "axios";

// Mocking axios
jest.mock("axios");

describe('getMovieLists Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    // Ensure params are always defined with a default value
    mockReq = {
      params: {} as { year: string }, // Defaulting to an empty object with the correct type
      query: {}
    };
    statusMock = jest.fn();
    jsonMock = jest.fn();
    mockRes = {
      status: statusMock.mockReturnThis(),
      json: jsonMock
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if year is missing or invalid', async () => {
    // Test with missing year
    mockReq.params!.year = ""; // Adding "!" to assert params is not undefined
    await getMovieLists(mockReq as Request, mockRes as Response);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: "Year is required and must be a valid number" });

    // Test with non-numeric year
    mockReq.params!.year = "abc"; // Invalid year
    await getMovieLists(mockReq as Request, mockRes as Response);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: "Year is required and must be a valid number" });
  });

  it('should return 200 with movies data for a valid year', async () => {
    // Mock successful response from axios.get for /discover/movie
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 1,
            title: "Joker",
            release_date: "January 1, 2019",
            vote_average: 8.19,
          }
        ]
      }
    });

    // Mock successful response from axios.get for /movie/{id}/credits
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: {
        crew: [
          { known_for_department: "Editing", name: "Jill Bogdanowicz" },
          { known_for_department: "Editing", name: "Cindy Bond" }
        ]
      }
    });

    mockReq.params!.year = "2019"; // Adding "!" to assert params is not undefined
    const expectedResponse = [
      {
        title: "Joker",
        release_date: "January 1, 2019",
        vote_average: 8.19,
        editors: ["Jill Bogdanowicz", "Cindy Bond"]
      }
    ];

    await getMovieLists(mockReq as Request, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(expectedResponse);
  });

  it('should return 500 if there is an error fetching movies with credits', async () => {
    // Mock an error response for /discover/movie
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error("Failed to fetch movies with credits."));

    mockReq.params!.year = "2019"; // Adding "!" to assert params is not undefined
    await getMovieLists(mockReq as Request, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ error: "Failed to fetch movies with credits." });
  });
});
