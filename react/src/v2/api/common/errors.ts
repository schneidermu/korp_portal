export class APIError extends Error {
  status: number;
  statusText: string;

  constructor(desc: string, res: Response) {
    super(`Error ${desc}: HTTP ${res.status} ${res.statusText}`);
    this.name = "UnknownAPIError";
    this.status = res.status;
    this.statusText = res.statusText;
  }
}
