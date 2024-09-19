<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import axios from 'axios';
  import { userStore } from '../../../lib/stores';
  import Layout from '../../layout.svelte';
  import { page } from '$app/stores';
  import { handleError, handleNetworkError, handleUnauthorizedError, handleValidationError } from '../../../lib/errorHandler';
  const ApiUrl = import.meta.env.VITE_API_URL+':'+import.meta.env.VITE_PORT+'/api';
  import Modal from '../../../lib/AddGroupModel.svelte'

  let isAdmin = false;
  let globalUsername;

  let showModal = false;
  let AppAcronym = '';
  let AppRNumber = '';
  let AppDescription = '';
  let StartDate = '';
  let EndDate = '';
  let AppPermitCreate = '';
  let AppPermitOpen = '';
  let AppPermitToDo = '';
  let AppPermitDoing = '';
  let AppPermitDone = '';

  let AppList = [];

  const getAllApplication = async() => {
      try{
      const Apps = await axios.get(ApiUrl + '/getApplicationByUsername?username='+ globalUsername, {
        withCredentials: true  
        });

        AppList = Apps.data

        // console.log(Apps.data)
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
        console.log(response)
        if (response.data == "Forbidden: You do not have access to this resource"){
            goto('/login');
        }
        globalUsername = response.data.username
        // console.log('Access granted:', response.data);
        if (response.data.result.includes("admin") ){
            isAdmin = true      
        }

        getAllApplication()
    } catch (error) {
        goto('/login');
        console.error('Access denied:', error.response.data.message);
        handleError(error.response.data);
    }
  });

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

<div class="container">
  <div class="header">
    <h1 class="head" >Application</h1>
    <div class="middle"></div>
    <div class="CreateApp">
      <div class="CreateAppBtn" on:click={() => (showModal = true)} >+ Create App</div> 
    </div>
  </div>
  <div class="wrapper">

{#each AppList as app, appIndex}

    <div class="card">
      <div class="left">
        <h1 class="title">App Name: </h1>
        <h1 class="title2" style="height: 100px; margin-bottom:100px" >App description: </h1>
        <h1 class="title2">Start date: </h1>
        <h1 class="title2">End date: </h1>
      </div>
      <div class="right">
        <p>{app.App_Acronym}</p>
        <p style="height: 200px; max-height:175px; max-width:320px; overflow: auto; ">{app.App_Description}</p>     
        <p>{app.App_startDate}</p>
        <p>{app.App_endDate}</p>
      </div>
    </div>
  {/each}

  </div>


</div>

<Modal bind:showModal>
	<h2 slot="header">
    Create App
	</h2>

  <div class="input-container">
      <label for="Username" style="margin-bottom: 10px;">AppAcronym:</label>
      <input type="text" id="AppAcronym" bind:value={AppAcronym} class="editable" />
  </div>

  <div class="input-container">
      <label for="Email" style="margin-bottom: 10px; margin-right:31px">AppRNumber:</label>
      <input type="text" id="AppRNumber" bind:value={AppRNumber} class="editable" />
  </div>
  <div class="input-container">
      <label for="Password" style="margin-bottom: 10px;margin-right:8px">AppDescription:</label>
      <input type="password" id="AppDescription" bind:value={AppDescription} class="editable" />
  </div>
  <div class="input-container">
      <label for="Username" style="margin-bottom: 10px;">StartDate:</label>
      <input type="date" id="StartDate" bind:value={StartDate}  class="editable" />
  </div>
  <div class="input-container">
      <label for="Username" style="margin-bottom: 10px;">EndDate:</label>
      <input type="date" id="EndDate" bind:value={EndDate}  class="editable" />
  </div>
  <div class="input-container">
      <label for="Username" style="margin-bottom: 10px;">AppPermitCreate:</label>
      <input type="text" id="AppPermitCreate" bind:value={AppPermitCreate}  class="editable" />
  </div>
  <div class="input-container">
      <label for="Username" style="margin-bottom: 10px;">AppPermitOpen:</label>
      <input type="text" id="AppPermitOpen" bind:value={AppPermitOpen}  class="editable" />
  </div>
  <div class="input-container">
      <label for="Username" style="margin-bottom: 10px;">AppPermitToDo:</label>
      <input type="text" id="AppPermitToDo" bind:value={AppPermitToDo}  class="editable" />
  </div>
  <div class="input-container">
      <label for="Username" style="margin-bottom: 10px;">AppPermitDoing:</label>
      <input type="text" id="AppPermitDoing" bind:value={AppPermitDoing}  class="editable" />
  </div>
  <div class="input-container">
      <label for="Username" style="margin-bottom: 10px;">AppPermitDone:</label>
      <input type="text" id="AppPermitDone" bind:value={AppPermitDone}  class="editable" />
  </div>
  <div slot="button">
      <button class="modelCloseBtn" on:click={() => addNewGroup()}>ADD</button>
      <!-- <button class="modelCloseBtn" on:click={() => showModal = false}>CANCEL</button> not fixeddddd -->
  </div>
      
</Modal>


<style>

.container{
  width: 90%
}

    a {
  text-decoration: none; 
  color: white;
  padding: 0 10px;
}

a:hover {
  text-decoration: underline; 
}

a.active {
  text-decoration: underline; 
  font-weight: bold;
}

.container {
  margin-top: 45px;
  align-items: stretch;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
}

.header {
  display: flex;
  justify-content: center;
  text-align: center;
}

.head {
  flex-grow: 1;
}

.middle {
  flex-grow: 4;
}

.CreateApp {
  flex-grow: 1;
  display: flex;
  justify-content: center;
}

.CreateAppBtn {
  width: 150px;
  appearance: button;
  background-color: black;
  color: white;
  border-width: 0;
  box-shadow: rgba(50, 50, 93, .1) 0 0 0 1px inset, rgba(50, 50, 93, .1) 0 2px 5px 0, rgba(0, 0, 0, .07) 0 1px 1px 0;
  box-sizing: border-box;
  font-size: 15px;
  height: 40px;
  margin: 15px 0 0;
  text-align: center;
  cursor: pointer;
  padding: 0 15px;
  transition: all .2s;
  float: right;
  padding-top: 13px;
}

.editable {
  background-color: #C9C9C9; /* Background color when editable */
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
  margin-top: 20px;
  border: none;
  color: white;
  background-color: black;
  width: 150px;
  height: 35px;
}
/*  /////////////////////  End model css    ///////////////////////    */

.wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 20px;
}

.card {
  box-sizing: border-box;
  width: 500px; /* Set width to accommodate both left and right sections */
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  border-radius: 20px;
  background: #fff;
  display: flex; /* Apply flex to the card to align the left and right sections */
  flex-direction: row; /* Set direction to row for horizontal alignment */
}

.card:hover {
  transform: translateY(-10px); /* Moves the card up by 10px */
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.7); /* Increases shadow for a more interactive feel */
}

.left, .right {
  flex: 1; /* Allow both left and right to take up equal space */
}

.left {
  padding-right: 20px; /* Add some space between left and right */
  max-width: 100px;
}

.title, .title2 {
  font-weight: 300;
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.right p {
  line-height: 1.5;
  color: rgba(0,0,0, 0.7);
}


p {
  font-weight: 300;
  margin-left: 20px;
  font-size: 1rem;
  line-height: 10px;
  color: rgba(0,0,0, 0.6);
  margin-left: 20px;
}



/* ////////////////////////////////////////////// end card ////////////////////////////////// */
</style>