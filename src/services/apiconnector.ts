import axios, { AxiosRequestConfig, Method, AxiosResponse } from "axios";
type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// ✅ Create axios instance
export const axiosInstance = axios.create({
  // You can add baseURL or interceptors here if needed
});

// ✅ Define a reusable API connector with proper TypeScript types
export const apiConnector = async <T = any>(
  method: HTTPMethod,
  url: string,
  bodyData?: any,
  headers?: Record<string, string>,
  params?: Record<string, any>
): Promise<AxiosResponse<T>> => {
  const config: AxiosRequestConfig = {
    method,
    url,
    data: bodyData || undefined,
    headers: headers || undefined,
    params: params || undefined,
  };

  return axiosInstance(config);
};
