import { BASE_URL } from "./api";
import { userLS } from "../localStore";
import "@babel/polyfill";

export const getQuery = (params) => {
  if (params) {
    let query = "?";
    for (const param in params) {
      params[param] === undefined || params[param] === null
        ? null
        : (query = query.concat(`${param}=${params[param]}&`));
    }
    console.log(query)
    return query.slice(0, -1); //remove last &
  }
  return null;
};

const refreshRequest = (id, refreshToken) => {
  return fetch(`${BASE_URL}users/${id}/tokens`, {
    headers: { Authorization: `Bearer ${refreshToken}` },
  })
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      }
    })
    .then((data) => data)
    .catch((e) => {
      throw new Error("refresh req", e);
    });
};

export const fetchWrapper = async (url, config = {}) => {
  const newConfig = {
    headers: {},
    ...config,
  };
  newConfig.headers.Authorization = `Bearer ${userLS.getTokenFromLS()}`;
  let res = await fetch(url, newConfig);

  let refreshToken = userLS.getRefreshTokenFromLS();
  if (!refreshToken && res.status === 401) {
    throw new Error("Should signin");
  }

  if (res.status === 200) {
    return res;
  }
  if (res.status === 401) {
    return refreshRequest(userLS.getUserIdFromLS(), refreshToken)
      .then(async (tokens) => {
        userLS.setUser(tokens);
        newConfig.headers.Authorization = `Bearer ${userLS.getTokenFromLS()}`;
        res = await fetch(url, newConfig);
        return res;
      })
      .catch((e) => {
        throw new Error("error in 43", e);
      });
  } else {
    return res;
  }
};
