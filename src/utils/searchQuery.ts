type SearchQueryParams = {
  destination?: string;
  adultCount?: string;
  childCount?: string;
  facilities?: string;
  types?: string | string[];
  stars?: string | string[];
  maxPrice?: string;
};

export const constructSearchQuery = (queryParams: SearchQueryParams) => {
  const filters: any = {};
  if (queryParams.destination) {
    filters.OR = [
      {
        city: {
          contains: queryParams.destination,
          mode: "insensitive",
        },
      },
      {
        country: {
          contains: queryParams.destination,
          mode: "insensitive",
        },
      },
    ];
  }
  if (queryParams.adultCount) {
    filters.adultCount = { gte: parseInt(queryParams.adultCount) };
  }
  if (queryParams.childCount) {
    filters.childCount = { gte: parseInt(queryParams.childCount) };
  }
  if (queryParams.facilities) {
    const facilitiesArr = Array.isArray(queryParams.facilities)
      ? queryParams.facilities
      : [queryParams.facilities];
    filters.facilities = { hasEvery: facilitiesArr };
  }
  if (queryParams.types) {
    const typeArr = Array.isArray(queryParams.types)
      ? queryParams.types
      : [queryParams.types];
    filters.type = { in: typeArr };
  }
  if (queryParams.stars) {
    const starsArr = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((s) => parseInt(s))
      : [parseInt(queryParams.stars)];
    filters.starRating = { in: starsArr };
  }
  if (queryParams.maxPrice) {
    filters.pricePerNight = { lte: parseInt(queryParams.maxPrice) };
  }
  return filters;
};
