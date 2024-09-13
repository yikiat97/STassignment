<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import axios from 'axios';
  import { userStore } from '../../../lib/stores';
  import Layout from '../../layout.svelte';
  import { page } from '$app/stores';
  import { handleError, handleNetworkError, handleUnauthorizedError, handleValidationError } from '../../../lib/errorHandler';
  const ApiUrl = import.meta.env.VITE_API_URL+':'+import.meta.env.VITE_PORT+'/api';

  let isAdmin = false;
  let globalUsername;

  onMount(async () => {
    try {
        const response = await axios.get(ApiUrl + '/Application   ', {
        withCredentials: true  
        });
        console.log(response)
        if (response.data == "Forbidden: You do not have access to this resource"){
            goto('/login');
        }
        globalUsername = response.data.username
        // console.log('Access granted:', response.data);
        if (response.data.result.includes("admin") ){
            isAdmin = true      
        }
    } catch (error) {
        goto('/login');
        console.error('Access denied:', error.response.data.message);
        handleError(error.response.data);
    }
  });


console.log($page.url.pathname)

</script>


<Layout bind:globalUsername>
<span slot="NavContentLeft">Hello, {globalUsername}</span>
  <div slot="NavContentCenter">
    {#if isAdmin}
      <a href="/Home page/Application" class:active={$page.url.pathname === '/Home%20page/Application'}>Application</a>
      <a href="/Home page/User Management" class:active={$page.url.pathname === '/Home%20page/User%20Management'}>User Management</a>
    {/if}
  </div>
  <div slot="NavContentRight" >Edit here</div>
</Layout>


<!-- <nav class="NavContainer">
   <p>Welcome, {$userStore.username}!</p>
</nav> -->




<main>
    <h1>Welcome to the Application users</h1>
    <p>Manage Task here.</p>
</main>


<style>
    a {
  text-decoration: none; /* Remove the default underline */
  color: white;
  padding: 0 10px;
}

a:hover {
  text-decoration: underline; /* Underline on hover */
}

a.active {
  text-decoration: underline; /* Underline if this is the active page */
  font-weight: bold; /* Optional: Make it bold */
  /* color: yellow; */
}
</style>