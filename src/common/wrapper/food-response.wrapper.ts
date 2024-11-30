export class FoodResponseWrapper<T> {
  statusCode: number;
  message?: string;
  data?: T;
  totalData?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  timestamp?: string;

  constructor(
    statusCode: number,
    message?: string,
    data?: T,
    totalData?: number,
    page?: number,
    limit?: number,
    totalPages?: number,
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.totalData = totalData;
    this.page = page;
    this.limit = limit;
    this.totalPages = totalPages;
  }
}
