/** @type {import('./$types').PageLoad} */
import { goto } from '$app/navigation';
import axios from 'axios';
const ApiUrl = import.meta.env.VITE_API_URL+':'+import.meta.env.VITE_PORT+'/api';

// export const load = async () => {

//   try {
//     // The token is automatically included in the cookies with 'withCredentials: true'
//     const response = await axios.get(ApiUrl + '/verifyJWT', {
//       withCredentials: true,  // This sends the cookies, including the token
//     });
//     console.log(response)

//     if (!response.data.valid) {
//       goto('/login');  // Redirect to login if token is invalid
//     }
//   } catch (error) {
//     console.error('Token verification failed:', error);
//     goto('/login');  // Redirect if verification failed
//   }
// };