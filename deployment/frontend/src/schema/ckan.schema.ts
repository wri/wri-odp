export interface CkanResponse<T> {
  help: string;
  success: boolean;
  error?: {
    __type: string;
    message: string;
  };
  result: T;
}
