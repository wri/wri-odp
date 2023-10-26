export interface CkanResponse<T> {
  help: string;
  success: boolean;
  result: T;
}
