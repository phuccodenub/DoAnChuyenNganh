// Pagination utility functions
export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
  defaultLimit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage?: number;
    prevPage?: number;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage?: number;
  prevPage?: number;
}

export const paginationUtils = {
  // Parse pagination options from query parameters
  parsePaginationOptions(query: Record<string, unknown>, options: PaginationOptions = {}): {
    page: number;
    limit: number;
    offset: number;
  } {
    const {
      page = 1,
      limit = 10,
      maxLimit = 100,
      defaultLimit = 10
    } = options;

    // Parse page number
    const parsedPage = Math.max(1, parseInt(String(query.page || '')) || page);
    
    // Parse limit with constraints
    const parsedLimit = Math.min(
      maxLimit,
      Math.max(1, parseInt(String(query.limit || '')) || defaultLimit)
    );

    // Calculate offset
    const offset = (parsedPage - 1) * parsedLimit;

    return {
      page: parsedPage,
      limit: parsedLimit,
      offset
    };
  },

  // Create pagination metadata
  createPaginationMeta(
    page: number,
    limit: number,
    total: number
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    const nextPage = hasNext ? page + 1 : undefined;
    const prevPage = hasPrev ? page - 1 : undefined;

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
      nextPage,
      prevPage
    };
  },

  // Create paginated result
  createPaginatedResult<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): PaginationResult<T> {
    return {
      data,
      pagination: this.createPaginationMeta(page, limit, total)
    };
  },

  // Generate pagination links
  generatePaginationLinks(
    baseUrl: string,
    page: number,
    limit: number,
    total: number,
    queryParams: Record<string, unknown> = {}
  ): {
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
  } {
    const totalPages = Math.ceil(total / limit);
    const links: {
      first?: string;
      prev?: string;
      next?: string;
      last?: string;
    } = {};

    // Helper function to build URL
    const buildUrl = (pageNum: number) => {
      const params = new URLSearchParams({
        ...Object.fromEntries(
          Object.entries(queryParams).map(([key, value]) => [key, String(value)])
        ),
        page: pageNum.toString(),
        limit: limit.toString()
      });
      return `${baseUrl}?${params.toString()}`;
    };

    // First page
    if (page > 1) {
      links.first = buildUrl(1);
    }

    // Previous page
    if (page > 1) {
      links.prev = buildUrl(page - 1);
    }

    // Next page
    if (page < totalPages) {
      links.next = buildUrl(page + 1);
    }

    // Last page
    if (page < totalPages) {
      links.last = buildUrl(totalPages);
    }

    return links;
  },

  // Validate pagination parameters
  validatePaginationParams(query: Record<string, unknown>): {
    isValid: boolean;
    errors: string[];
    page?: number;
    limit?: number;
  } {
    const errors: string[] = [];
    let page: number | undefined;
    let limit: number | undefined;

    // Validate page
    if (query.page !== undefined) {
      const parsedPage = parseInt(String(query.page));
      if (isNaN(parsedPage) || parsedPage < 1) {
        errors.push('Page must be a positive integer');
      } else {
        page = parsedPage;
      }
    }

    // Validate limit
    if (query.limit !== undefined) {
      const parsedLimit = parseInt(String(query.limit));
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        errors.push('Limit must be a positive integer between 1 and 100');
      } else {
        limit = parsedLimit;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      page,
      limit
    };
  },

  // Calculate skip value for database queries
  calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  },

  // Calculate total pages
  calculateTotalPages(total: number, limit: number): number {
    return Math.ceil(total / limit);
  },

  // Check if page exists
  pageExists(page: number, total: number, limit: number): boolean {
    const totalPages = this.calculateTotalPages(total, limit);
    return page >= 1 && page <= totalPages;
  },

  // Get page range for pagination UI
  getPageRange(
    currentPage: number,
    totalPages: number,
    rangeSize: number = 5
  ): number[] {
    const halfRange = Math.floor(rangeSize / 2);
    let start = Math.max(1, currentPage - halfRange);
    let end = Math.min(totalPages, start + rangeSize - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < rangeSize) {
      start = Math.max(1, end - rangeSize + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }
};

