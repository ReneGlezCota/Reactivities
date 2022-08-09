import { ActivityFormValues } from './../models/activity';
import { history } from "./../../index";
import { store } from "./../stores/store";
import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { Activity } from "../models/activity";
import { User, UserFormValues } from "../models/user";

const sleep = (delay: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};

axios.defaults.baseURL = "http://localhost:5000/api";

axios.interceptors.request.use((config: any) => {
  const token = store.commonStore.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  async (response) => {
    await sleep(1000);
    return response;
  },
  (error: AxiosError) => {
    const { data, status, config } = error.response!;
    console.log(error.response?.data);
    switch (status) {
      case 400:
        // if (config.method === "get" && data.errors.hasOwnProperty("id")) {
        //   history.push("not-found");
        // }
        // if(data.errors){
        //   const modelStateErrors = [];
        //   for(const key in data.errors){
        //     if(data.errors[key]){
        //       modelStateErrors.push(data.errors[key])
        //     }
        //   }
        //   throw modelStateErrors.flat();
        // }
        toast.error("Bad Request");
        break;
      case 401:
        toast.error("Unauthorised");
        break;
      case 404:
        toast.error("Not found");
        //history.push('/not-found');
        break;
      case 500:
        toast.error("Server Error");
        //store.commonStore.setServerError(data)
        //historyLog.push('/server-error');
        break;
    }
    return Promise.reject(error);
  }
);

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

const requests = {
  get: <T>(url: string) => axios.get<T>(url).then(responseBody),
  post: <T>(url: string, body: {}) =>
    axios.post<T>(url, body).then(responseBody),
  put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
  delete: <T>(url: string) => axios.delete<T>(url).then(responseBody),
};

const Activities = {
  list: () => requests.get<Activity[]>("/activities"),
  details: (id: string) => requests.get<Activity>(`/activities/${id}`),
  create: (activity: ActivityFormValues) => requests.post<void>(`/activities`, activity),
  update: (activity: ActivityFormValues) =>
    requests.put<void>(`/activities/${activity.id}`, activity),
  delete: (id: string) => requests.delete<void>(`/activities/${id}`),
  attend: (id: string) => requests.post<void>(`/activities/${id}/attend`,{})
};

const Account = {
  current: () => requests.get<User>("/account"),
  login: (user: UserFormValues) => requests.post<User>("/account/login", user),
  register: (user: UserFormValues) =>
    requests.post<User>("/account/register", user),
};

const agent = {
  Activities,
  Account,
};

export default agent;
