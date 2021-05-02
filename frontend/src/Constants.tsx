const prod : any = {
  API_URL: '/',
};

const dev = {
  API_URL: 'http://localhost:8000/'
};

export const Config = process.env.NODE_ENV === 'development' ? dev : prod;