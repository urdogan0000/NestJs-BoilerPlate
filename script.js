import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 5000 },
    { duration: '3m30s', target: 20000 },
    { duration: '20s', target: 2000 },
  ],
};

export default function () {
  const url = 'http://localhost:3000/login';

  // Define headers, including the Authorization header
  const headers = {
    Authorization: 'test112:test12312',
  };

  // Send the GET request with the headers
  http.get(url, { headers });

  sleep(1);
}
