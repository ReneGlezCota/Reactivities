import { PaginatedResult } from "./../models/pagination";
import { ActivityFormValues } from "./../models/activity";
import { history } from "./../../index";
import { store } from "./../stores/store";
import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { Activity } from "../models/activity";
import { User, UserFormValues } from "../models/user";
import { Photo, Profile, UserActivity } from "../models/profile";
import { request } from "http";

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
    const pagination = response.headers["pagination"];

    if (pagination) {
      response.data = new PaginatedResult(
        response.data,
        JSON.parse(pagination)
      );
      return response as AxiosResponse<PaginatedResult<any>>;
    }

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
  list: (params: URLSearchParams) =>
    axios
      .get<PaginatedResult<Activity[]>>("/activities", { params })
      .then(responseBody),
  details: (id: string) => requests.get<Activity>(`/activities/${id}`),
  create: (activity: ActivityFormValues) =>
    requests.post<void>(`/activities`, activity),
  update: (activity: ActivityFormValues) =>
    requests.put<void>(`/activities/${activity.id}`, activity),
  delete: (id: string) => requests.delete<void>(`/activities/${id}`),
  attend: (id: string) => requests.post<void>(`/activities/${id}/attend`, {}),
};

const Account = {
  current: () => requests.get<User>("/account"),
  login: (user: UserFormValues) => requests.post<User>("/account/login", user),
  register: (user: UserFormValues) =>
    requests.post<User>("/account/register", user),
};

const Profiles = {
  get: (username: string) => requests.get<Profile>(`/profiles/${username}`),
  uploadPhoto: (file: Blob) => {
    let formData = new FormData();
    formData.append("File", file);
    return axios.post<Photo>("photos", formData, {
      headers: { "Content-type": "multipart/form-data" },
    });
  },
  setMainPhoto: (id: string) => requests.post(`/photos/${id}/setMain`, {}),
  deletePhoto: (id: string) => requests.delete(`/photos/${id}`),
  updateProfile: (profile: Partial<Profile>) =>
    requests.put(`/profiles`, profile),
  updateFollowing: (username: string) =>
    requests.post(`/follow/${username}`, {}),
  listFollowing: (username: string, predicate: string) =>
    requests.get<Profile[]>(`/follow/${username}?predicate=${predicate}`),
  listActivities: (username: string, predicate: string) =>
    requests.get<UserActivity[]>(
      `/profiles/${username}/activities?predicate=${predicate}`
    ),
};

const agent = {
  Activities,
  Account,
  Profiles,
};

export default agent;
