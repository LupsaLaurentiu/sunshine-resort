export type AsyncStatus =
  | "idle"
  | "loading"
  | "success"
  | "error";

export type ApiMessageResponse = {
  message: string;
};

export type ApiErrorResponse = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};