import { z } from "zod";

export interface validateUserBody {
  email: string;
  password: string;
}

export type AccessToken = {
  access_token: string;
};

export type AccessTokenPayload = {
  id: string;
  email: string;
  roles: string[];
};

export interface RegisterRequestBody {
    username: string,
    email: string,
    password: string,
    name?: string,
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface VerifyEmailRequestBody {
  userId: string;
}