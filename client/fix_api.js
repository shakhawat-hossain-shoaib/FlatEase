const fs = require('fs');
const file = 'D:/FlatEase/client/src/api.ts';
let c = fs.readFileSync(file, 'utf8');

const newConstructor = `let isCsrfSet = false;

class ApiClient {
  private client: import('axios').AxiosInstance;

  constructor() {
    // Dynamically importing axios and secrets inside file is bad if they are already imported.
    // We already have 'import axios from "axios";' at the top.
    this.client = axios.create({
      baseURL: import.meta.env ? import.meta.env.VITE_BACKEND_ENDPOINT : "http://localhost:8000",
      withCredentials: true,
      withXSRFToken: true,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    this.client.interceptors.request.use(async (config) => {
      const method = config.method?.toLowerCase() || '';
      if (['post', 'put', 'patch', 'delete'].includes(method) && config.url !== '/sanctum/csrf-cookie') {
        if (!isCsrfSet) {
          try {
            await this.client.get('/sanctum/csrf-cookie');
            isCsrfSet = true;
          } catch (e) {
            console.error('Failed to prepare CSRF token', e);
          }
        }
      }
      return config;
    });
  }
`;

// wait, secrets.backendEndpoint is imported at the top, so let's use it
const betterConstructor = `let isCsrfSet = false;

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: secrets.backendEndpoint,
      withCredentials: true,
      withXSRFToken: true,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    this.client.interceptors.request.use(async (config) => {
      const method = config.method?.toLowerCase() || '';
      if (['post', 'put', 'patch', 'delete'].includes(method) && config.url !== '/sanctum/csrf-cookie') {
        if (!isCsrfSet) {
          try {
            await this.client.get('/sanctum/csrf-cookie');
            isCsrfSet = true;
          } catch (e) {
            console.error('Failed to prepare CSRF token', e);
          }
        }
      }
      return config;
    });
  }
`;


let newFile = c.substring(0, c.indexOf('class ApiClient {'));
newFile += betterConstructor;

// Take the rest of the file after the old csrf block
let rest = c.substring(c.indexOf('  // currently, only fetches 1 session') + 2);
// actually find the start of getSession
rest = `  // currently, only fetches 1 session` + c.substring(c.indexOf('  // currently, only fetches 1 session') + 36);

// remove headers definitions
rest = rest.replace(/const headers = await this\.csrfHeaders\(\);\n\s*/g, '');
// there's a variation where there was no new line or spaces
rest = rest.replace(/const headers = await this\.csrfHeaders\(\);/g, '');

// remove { headers } injections
rest = rest.replace(/, \{ headers \}/g, '');

newFile += rest;

fs.writeFileSync(file, newFile, 'utf8');
console.log('Fixed api.ts');
