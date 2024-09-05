<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import axios from 'axios';
  const ApiUrl = import.meta.env.VITE_API_URL+':'+import.meta.env.VITE_PORT+'/api';

//   onMount(async () => {
//     try {
//       const response = await axios.get(ApiUrl + '/verifyJWT', {
//         withCredentials: true,  
//       });

//       if (response.data == "verified") {
//           // Redirect to login if token is invalid
//           // checkgroup()
//       }
//       else {
//         goto('/login');
//       }
//     } catch (error) {
//       console.error('Token verification failed:', error);
//       goto('/login');  
//     }
//   });
onMount(async () => {
    try {
        const response = await axios.get(ApiUrl + '/Application   ', {
        withCredentials: true  
        });
        if (response.data == "Forbidden: You do not have access to this resource"){
            goto('/login');
        }

        // If successful, log the response
        console.log('Access granted:', response.data);
    } catch (error) {
        // Handle any errors, like unauthorized access
        goto('/login');
        console.error('Access denied:', error.response.data.message);
    }
});
</script>


<main>
    <h1>Welcome to the Application users</h1>
    <p>Manage Task here.</p>
</main>