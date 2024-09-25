<script>
    import Modal from '../lib/AddGroupModel.svelte';
    import { setContext, getContext } from 'svelte';
    import { goto } from '$app/navigation';
    import axios from 'axios';
    import { onMount } from 'svelte';
    import { handleError,customError, handleNetworkError, handleUnauthorizedError, handleValidationError, customAlert } from '../lib/errorHandler';
    const ApiUrl = import.meta.env.VITE_API_URL+':'+import.meta.env.VITE_PORT+'/api';

    export let showModal = false;
    let username; 
    let updatedEmail;
    let password;
    let usergroups
    let user;

    const getUserdetails = async(userid) => {
        try{
        const userdetails = await axios.get(ApiUrl + '/getUserByUsername?username='+userid, {
        withCredentials: true  
        });
        user = userdetails.data
        updatedEmail = userdetails.data.email
        password = userdetails.data.password
        usergroups = userdetails.data.usergroups
        // users = userlist.data
        console.log(user)
    } catch (error) {
        console.error('Access denied:', error.response.data.message);
        handleError(error.response.data);
        }
    }

onMount(async () => {
    try {
        const response = await axios.get(ApiUrl + '/Application   ', {
        withCredentials: true  
        });
        if (response.data == "Forbidden: You do not have access to this resource"){
           alert("test")
            goto('/login');
        }
        username = response.data.username
        getUserdetails(username)
        console.log('Access granted:', response.data);
        if (response.data.result.includes("admin") ){
                 
        }
    } catch (error) {
        // Handle any errors, like unauthorized access
       
        goto('/login');
        console.error('Access denied:', error.response.data.message);
        //handleError(error.response.data);
    }
  });

  function submitEditProfile(updatedProfile){

    console.log(updatedProfile)
  const response =  axios.put(ApiUrl + '/updateProfile', updatedProfile, {
    withCredentials: true  
    }).then(response => {
    console.log("Status:", response);  
    getUserdetails(username)
    showModal = false
    customAlert("Profile Updated, Please refresh the page!")
    


  })
  .catch(error => {
    console.error("Error:", error);
    handleError(error.response.data);
  });
  }


function openModel(){
    showModal = true;
    getUserdetails(username)
}


  function logOut() {
    const response =  axios.post(ApiUrl + '/logout', {
      withCredentials: true  
      }).then(response => {
        console.log(response)
        goto("/login")
      customAlert("Log Out!")

    })
    .catch(error => {
      console.error("Error:", error);
      handleError(error.response.data);
    });
  }


</script>

 <main>
  <nav class="NavContainer">
    <div class="NavContentLeft"><slot name="NavContentLeft" /></div>
    <div class="NavContentCenter"><slot name="NavContentCenter" /></div>
    <div class="NavContentRight"  on:click={() => openModel()}><slot name="NavContentRight" /></div>
    <button class="SignOutBtn" on:click={logOut}>sign out</button>
  </nav>

  <!-- Default slot for the main content -->
  <slot></slot>
  
</main>

<Modal bind:showModal on:close={() => (showModal = false)}>
	<h2 slot="header">
    Profile
	</h2>

 <div class="input-container">
    <label for="Username" style="margin-bottom: 10px;">Username:</label>
    <input type="text" id="Username" bind:value={username} disabled class="editable" />
</div>

 <div class="input-container">
    <label for="Email" style="margin-bottom: 10px; margin-right:31px">Email:</label>
    <input type="text" id="Email" bind:value={updatedEmail} class="editable" />
</div>
 <div class="input-container">
    <label for="Password" style="margin-bottom: 10px;margin-right:8px">Password:</label>
    <input type="password" id="Password" bind:value={password} class="editable" />
</div>
 <div slot="button">
    <button class="modelCloseBtn" on:click={() => submitEditProfile({"username":username, "email": updatedEmail, "password":password , "accountStatus":"Active", "usergroups":usergroups})}>SAVE CHANGES</button>
  </div>
</Modal>

<style>
.NavContainer {
    background-color: black;
    color: white;
    height: 80px;
    display: flex; /* Make the container a flexbox */
    justify-content: space-between; /* Space out the items to left, center, and right */
    align-items: center; /* Vertically center the items */
    font-size: large;
    width: 100%; /* Ensure the container takes the full width */
}

.NavContentLeft {
    flex: 1; /* Make it flexible */
    text-align: left; /* Align the content to the left */
    padding-left: 150px;
}

.NavContentCenter {
    flex: 1; /* Center element takes up equal space */
    text-align: center; /* Center content horizontally */
}

.NavContentRight {
    flex: 1; /* Make it flexible */
    text-align: right; /* Align the content to the right */
    padding-right: 50px;
}

input {
  margin-bottom: 20px;
  padding: 10px;
  width: 50px;
  box-sizing: border-box;
  border: none;
  outline: none;
  padding: 8px;
  background-color: #C9C9C9; /* Default background color for non-editable inputs */
}

.input-container {
    display: flex;
    align-items: center; /* This centers the items vertically */
    justify-content: center;
    gap: 10px; /* Adds space between the label and the input */
}

.input-container label {
    margin-right: 5px; /* Optional: add more space between the label and the input */
    white-space: nowrap; /* Keeps the label text on one line */
}

.input-container input {
    flex-grow: 1; /* Allows the input to take up any remaining space */
}

.modelCloseBtn{
  cursor: pointer;
  padding: 5px 10px;
  border: none;
  color: white;
  background-color: black;
  width: 150px;
  height: 35px;
}


.SignOutBtn{
 background-color: black;
 color: aliceblue;
 width: 100px;
 height: 50px;
 margin-right: 10px;
}

</style>