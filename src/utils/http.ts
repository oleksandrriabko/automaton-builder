import Axios, { AxiosInstance, AxiosRequestConfig, CancelTokenSource } from "axios";
import { ee } from "./emitter";
import history from "./history";

class Http {
  axios: AxiosInstance;

  emitter: typeof ee;

  defaultOptions: AxiosRequestConfig = {
    baseURL: "http://localhost:8080",
    headers: {},
  };

  constructor() {
    let token = "";
    const userState = localStorage.getItem("userState");
    if (userState) {
      const { accessToken } = JSON.parse(userState);
      token = accessToken;
    }
    (this.defaultOptions.headers["Authorization"] = `Bearer ${token}`),
      (this.axios = Axios.create({
        ...this.defaultOptions,
      }));

    this.emitter = ee;
    this.initializeResponseInterceptor();
  }

  handleResponse = (res: any) => res;

  handleError = async (err: any) => {
    const {
      data: { error, name },
    } = err.response;
    if (name === "TokenExpiredError") {
      const userState = localStorage.getItem("userState");
      if (userState) {
        const { refreshToken } = JSON.parse(userState);
        try {
          const response = await this.post("/refresh_token", { refreshToken });
          if (response.status === 201 && response.data) {
            const { accessToken } = response.data;
            err.config.headers.Authorization = `Bearer ${accessToken}`;
            this.axios.defaults.headers.Authorization = `Bearer ${accessToken}`;
            this.emitter.emmit("accessTokenUpdate", { accessToken });
            return this.axios.request(err.config);
          }
        } catch (e) {
          history.push("/login");
        }
      }
    }

    return Promise.reject(err.response);
  };

  // setToken = (config: AxiosRequestConfig): AxiosRequestConfig => {
  //   return config;
  // };

  initializeResponseInterceptor = () => {
    // this.axios.interceptors.request.use(this.setToken);
    this.axios.interceptors.response.use(this.handleResponse, this.handleError);
  };

  request = (config: AxiosRequestConfig) =>
    this.axios.request({
      method: config.method,
      baseURL: config.baseURL,
      params: config.params,
      data: config.data,
      url: config.url,
      headers: config.headers,
      responseType: config.responseType,
    });

  get = (url: string, config?: AxiosRequestConfig) => this.request({ method: "GET", url, ...config });

  post = (url: string, data: any, config?: AxiosRequestConfig) => this.request({ method: "POST", url, data, ...config });

  put = (url: string, data: any, config?: AxiosRequestConfig) => this.request({ method: "PUT", url, data, ...config });

  delete = (url: string, config?: AxiosRequestConfig) => this.request({ method: "DELETE", url, ...config });
}

const http = new Http();
export default http;
