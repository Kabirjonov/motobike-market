export type ApiError = {
  code: string;
  fieldErrors?: Record<string, string[]>;
  message: string;
};

export type ApiSuccess<TData, TMeta = never> = {
  data: TData;
  meta?: TMeta;
};

export type ApiErrorResponse = {
  error: ApiError;
};
