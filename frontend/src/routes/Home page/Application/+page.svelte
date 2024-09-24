<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import axios from 'axios';
  import { userStore } from '../../../lib/stores';
  import Layout from '../../layout.svelte';
  import { page } from '$app/stores';
  import { handleError, customError, customAlert} from '../../../lib/errorHandler';
  const ApiUrl = import.meta.env.VITE_API_URL+':'+import.meta.env.VITE_PORT+'/api';
  import Modal from '../../../lib/AddGroupModel.svelte'
  import TMSPage from '../TMS/TMSPage.svelte' 
 

  let App_Name_URL;

  let isAdmin = false;
  let globalUsername;

  let originApp = null
  let selectedApp = null;

  let showEditModal = false;
  let showModal = false;
  let App_Acronym = '';
  let App_Rnumber = '';
  let App_Description = '';
  let App_startDate = '';
  let App_endDate = '';
  let App_permit_create = '';
  let App_permit_Open = '';
  let App_permit_toDoList = '';
  let App_permit_Doing = '';
  let App_permit_Done = '';
  let AppList = [];
  let distinctGroups = [];

  let newApp = {
    App_Acronym: null,
    App_Rnumber: null,
    App_Description: '',
    App_startDate: null,
    App_endDate: null,
    App_permit_create: null,
    App_permit_Open: null,
    App_permit_toDoList: null,
    App_permit_Doing: null,
    App_permit_Done: null
};

  const getAllApplication = async() => {
      try{
      const Apps = await axios.get(ApiUrl + '/getApplicationByUsername?username='+ globalUsername, {
        withCredentials: true  
        });

        AppList = Apps.data

         console.log(Apps.data)
    } catch (error) {
       console.error('Access denied:', error.response.data.message);
       handleError(error.response.data);
    }
}

  const getAllGroups = async() => {
        try{
        const grouplist = await axios.get(ApiUrl + '/allGroup', {
          withCredentials: true  
          });
          distinctGroups = grouplist.data
          console.log(grouplist)
      }catch (error) {
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
        getAllGroups()

    } catch (error) {
        goto('/login');
        console.error('Access denied:', error.response.data.message);
        handleError(error.response.data);
    }
  });

  function convertIntToDate(intDate) {
    console.log(intDate)
    const dateStr = intDate.toString();
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    return `${year}-${month}-${day}`;
  }


  let NewUserSelectedGroup ="";
  function addNewAppPermitGroup(permitKey) {
    if (NewUserSelectedGroup && !newApp[permitKey].includes(NewUserSelectedGroup)) {
      // Add the selected group to the correct permit array
      newApp[permitKey] = [...newApp[permitKey], NewUserSelectedGroup];
    }
        // Reset selection and close dropdown after adding
    NewUserSelectedGroup = "";
    //GroupShowDropdown = false;
  }

  function NewPermitRemoveGroup(permitKey, index) {
    newApp[permitKey].splice(index, 1);
    newApp[permitKey] = [...newApp[permitKey]];
  }

  function submitNewApp(){
    console.log("submitNewApp variable:",newApp)
      const response =  axios.post(ApiUrl + '/InsertApplications', newApp, {
        withCredentials: true  
        }).then(response => {
        console.log("Status:", response.status);  // Logs the status, e.g., 200
        newApp = {
            App_Acronym: null,
            App_Rnumber: null,
            App_Description: '',
            App_startDate: null,
            App_endDate: null,
            App_permit_create: null,
            App_permit_Open: null,
            App_permit_toDoList: null,
            App_permit_Doing: null,
            App_permit_Done: null
        };

            getAllApplication()
            customAlert("New APP Added")
      })
      .catch(error => {
        console.error("Error:", error);
        handleError(error.response.data);
        
      });    
  }

  function openEditModal(app) {
    app.App_startDate = convertIntToDate(app.App_startDate)
    app.App_endDate = convertIntToDate(app.App_endDate)
    selectedApp = { ...app };
    originApp = app
    showEditModal = true;
    console.log(selectedApp.App_startDate)
  }

  

//                 {
//   "App_Acronym": "TMS3",
//   "App_Rnumber": 1,
//   "App_App_startDate": "2024-01-01",
//   "App_App_endDate": "2024-12-31",
//   "App_permit_Open": ["PL_forTMS1", "PM_forTMS1", "admin"],
//   "App_permit_toDoList": ["PM_forTMS1", "PL_forTMS1", "DEV_forTMS1"],
//   "App_permit_Doing": ["PM_forTMS1", "DEV_forTMS1"],
//   "App_permit_Done": ["DEV_forTMS1", "PL_forTMS1"],
//   "App_permit_create": ["PL_forTMS1"]
// } 
function submitEditedApp() {
    const updatedApp = 
    {
      App_Acronym : selectedApp.App_Acronym,
      App_Rnumber: selectedApp.App_Rnumber,
      App_Description: '',
      App_startDate: null,
      App_endDate: null,
      App_permit_Open: null,
      App_permit_toDoList: null,
      App_permit_Doing: null,
      App_permit_Done: null,
      App_permit_create: null
    };

    // Only include the fields that were modified
    if (selectedApp.App_Description !== originApp.App_Description) {
      updatedApp.App_Description = selectedApp.App_Description;
    }
    if (selectedApp.App_startDate !== originApp.App_startDate) {
      updatedApp.App_startDate = selectedApp.App_startDate;
    }
    if (selectedApp.App_endDate !== originApp.App_endDate) {
      updatedApp.App_endDate = selectedApp.App_endDate;
    }
    if (selectedApp.App_permit_create !== originApp.App_permit_create) {
      updatedApp.App_permit_create = selectedApp.App_permit_create;
    }
    if (selectedApp.App_permit_Open !== originApp.App_permit_Open) {
      updatedApp.App_permit_Open = selectedApp.App_permit_Open;
    }
    if (selectedApp.App_permit_toDoList !== originApp.App_permit_toDoList) {
      updatedApp.App_permit_toDoList = selectedApp.App_permit_toDoList;
    }
    if (selectedApp.App_permit_Doing !== originApp.App_permit_Doing) {
      updatedApp.App_permit_Doing = selectedApp.App_permit_Doing;
    }
    if (selectedApp.App_permit_Done !== originApp.App_permit_Done) {
      updatedApp.App_permit_Done = selectedApp.App_permit_Done;
    }
    // Repeat for other fields (App_permit_Open, App_permit_toDoList, etc.)
    console.log(updatedApp)



    if (Object.keys(updatedApp).length > 0) {
     updatedApp.App_Acronym = selectedApp.App_Acronym
      // Send only updated fields to the backend
      axios.put(ApiUrl + `/updateApplication`, updatedApp, {
        withCredentials: true
      })
      .then(response => {
        console.log("Application updated:", response.data);
        getAllApplication(); // Refresh the app list

        showEditModal = false; // Close the modal
      })
      .catch(error => {
        console.error("Error updating application:", error);
        handleError(error.response.data);
      });
    } else {
      customAlert("No changes made");
    }
  }

  function refresh() {
    window.location.reload();  
  }

  export let Global_App_Acronym = ''
  let showTMSPage = false; // This will control the visibility of TMSPage
  function openTMSpage(App_Acronym){
    showTMSPage = true; 
    Global_App_Acronym = App_Acronym
  }

</script>


<Layout bind:globalUsername>
<span slot="NavContentLeft">Hello, {globalUsername}</span>
  <div slot="NavContentCenter">
    {#if isAdmin}
      <a href="/Home page/Application" class:active={$page.url.pathname === '/Home%20page/Application' && !showTMSPage} on:click={refresh}>Application</a>
      {#if showTMSPage}
       <a href="" class:active={showTMSPage} on:click={openTMSpage(Global_App_Acronym)}>Task</a>
      {/if}
      <a href="/Home page/User Management" class:active={$page.url.pathname === '/Home%20page/User%20Management'}>User Management</a>
    {/if}
  </div>
  <div slot="NavContentRight" >Edit here</div>
</Layout>

{#if showTMSPage}
  <TMSPage {Global_App_Acronym} />
{/if}

<div class="container">
  <div class="header">
    <h1 class="head" >Application</h1>
    <div class="middle"></div>
    <div class="CreateApp">
      <div class="CreateAppBtn" on:click={() => (showModal = true)} >+ Create App</div> 
    </div>
  </div>
  <div class="wrapper">

<!-- svelte-ignore a11y-no-static-element-interactions -->
{#each AppList as app, appIndex}

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- on:click={goto(`/Home%20page/TMS/?App_Acronym=${app.App_Acronym}`) } -->
    <div class="card" on:click={openTMSpage(app.App_Acronym)} >   
      <div class="left">
        <h1 class="title">App Name: </h1>
        <h1 class="title2" style="height: 100px; margin-bottom:100px" >App description: </h1>
        <h1 class="title2">Start date: </h1>
        <h1 class="title2">End date: </h1>
      </div>
      <div class="right">
        <p>{app.App_Acronym}</p>
        <p style="height: 200px; max-height:175px; max-width:320px; overflow: auto; ">{app.App_Description}</p>     
        <p>{convertIntToDate(app.App_startDate)}</p>
        <p>{convertIntToDate(app.App_endDate)}</p>
      </div>
    </div>
    <span class="edit-icon" on:click={() => openEditModal(app)}>🖉</span>
    
  {/each}

  </div>


</div>

<Modal bind:showModal>
	<h2 slot="header">
    Create App
	</h2>

  <div class="input-container">
      <label for="Username" style="margin-bottom: 10px;">App_Acronym:</label>
      <input type="text" id="App_Acronym" bind:value={newApp.App_Acronym} class="editable" />
  </div>

  <div class="input-container">
      <label for="Email" style="margin-bottom: 10px; margin-right:31px">App_Rnumber:</label>
      <input type="number" id="App_Rnumber" bind:value={newApp.App_Rnumber} class="editable" />
  </div>
  <div class="input-container">
      <label for="Password" style="margin-bottom: 10px;margin-right:8px">App_Description:</label>
      <input type="text" id="App_Description" bind:value={newApp.App_Description} class="editable" />
  </div>
  <div class="input-container">
      <label for="Username" style="margin-bottom: 10px;">App_startDate:</label>
      <input type="date" id="App_startDate" bind:value={newApp.App_startDate}  class="editable" />
  </div>
  <div class="input-container">
      <label for="Username" style="margin-bottom: 10px;">App_endDate:</label>
      <input type="date" id="App_endDate" bind:value={newApp.App_endDate}  class="editable" />
  </div>

  <div class="tags-container input-container">
    <label for="App_permit_create" style="margin-bottom: 10px;">App_permit_create:</label>
      <div class="spanBox" style="max-height:100px; overflow: auto;">
      
          <span class="tag">
            {newApp.App_permit_create} 
          </span>
 
      </div>
        <select bind:value={newApp.App_permit_create} >
          <option value="" disabled>Select a group</option>
          {#each distinctGroups as distinctGroup}
            <option value={distinctGroup}>{distinctGroup}</option>
          {/each}
        </select>
  </div>

  <div class="input-container">
    <label for="App_permit_Open" style="margin-bottom: 10px;">App_permit_Open:</label>
      <div class="spanBox" style="max-height:100px; overflow: auto;">    
          <span class="tag">
            {newApp.App_permit_Open} 
          </span>
      </div>
        <select bind:value={newApp.App_permit_Open}>
          <option value="" disabled>Select a group</option>
          {#each distinctGroups as distinctGroup}
            <option value={distinctGroup}>{distinctGroup}</option>
          {/each}
        </select>
   
  </div>

  <div class="input-container">
      <label for="Username" style="margin-bottom: 10px;">App_permit_toDoList:</label>
      <div class="spanBox" style="max-height:100px; overflow: auto;">
    
          <span class="tag">
            {newApp.App_permit_toDoList} 
          </span>

      </div>
        <select bind:value={newApp.App_permit_toDoList}>
          <option value="" disabled>Select a group</option>
          {#each distinctGroups as distinctGroup}
            <option value={distinctGroup}>{distinctGroup}</option>
          {/each}
        </select>
  </div>

  <div class="input-container">
      <label for="Username" style="margin-bottom: 10px;">App_permit_Doing:</label>
      <div class="spanBox" style="max-height:100px; overflow: auto;">
          <span class="tag">
            {newApp.App_permit_Doing} 
          </span>
      </div>
        <select bind:value={newApp.App_permit_Doing}>
          <option value="" disabled>Select a group</option>
          {#each distinctGroups as distinctGroup}
            <option value={distinctGroup}>{distinctGroup}</option>
          {/each}
        </select>
  </div>

  <div class="input-container">
      <label for="Username" style="margin-bottom: 10px;">App_permit_Done:</label>
      <div class="spanBox" style="max-height:100px; overflow: auto;">
          <span class="tag">
            { newApp.App_permit_Done} 
          </span>
      </div>
        <select bind:value={newApp.App_permit_Done} >
          <option value="" disabled>Select a group</option>
          {#each distinctGroups as distinctGroup}
            <option value={distinctGroup}>{distinctGroup}</option>
          {/each}
        </select>
  </div>

  <div slot="button">
      <button class="modelCloseBtn" on:click={() => submitNewApp()}>ADD</button>
      <!-- <button class="modelCloseBtn" on:click={() => showModal = false}>CANCEL</button> not fixeddddd -->
  </div>
      
</Modal>



{#if showEditModal}
  <Modal bind:showModal={showEditModal}>
    <h2 slot="header">Edit Application</h2>

    <div class="input-container">
      <label for="App_Acronym" style="margin-bottom: 10px;">App_Acronym:</label>
      <input type="text" id="App_Acronym" bind:value={selectedApp.App_Acronym} class="editable" disabled />
    </div>

    <div class="input-container">
      <label for="App_Rnumber" style="margin-bottom: 10px; margin-right:31px">App_Rnumber:</label>
      <input type="number" id="App_Rnumber" bind:value={selectedApp.App_Rnumber} class="editable" disabled />
    </div>

    <div class="input-container">
      <label for="App_Description" style="margin-bottom: 10px;margin-right:8px">App_Description:</label>
      <input type="text" id="App_Description" bind:value={selectedApp.App_Description} class="editable" />
    </div>

    <div class="input-container">
      <label for="App_startDate" style="margin-bottom: 10px;">App_startDate:</label>
      <input type="date" id="App_startDate" bind:value={selectedApp.App_startDate} class="editable" />
    </div>

    <div class="input-container">
      <label for="App_endDate" style="margin-bottom: 10px;">App_endDate:</label>
      <input type="date" id="App_endDate"  bind:value={selectedApp.App_endDate} class="editable" />
    </div>

    <div class="input-container">
      <label for="App_permit_create" style="margin-bottom: 10px;">App_permit_create:</label>
      <div class="spanBox" style="max-height:100px; overflow: auto;">  
        <span class="tag">
          {selectedApp.App_permit_create} 
        </span>
    </div>
      <select bind:value={selectedApp.App_permit_create} class="editable">
        <option value="" disabled>Select a group</option>
        {#each distinctGroups as distinctGroup}
          <option value={distinctGroup}>{distinctGroup}</option>
        {/each}
      </select>
    </div>

    <div class="input-container">
      <label for="App_permit_Open" style="margin-bottom: 10px;">App_permit_Open:</label>
      <div class="spanBox" style="max-height:100px; overflow: auto;">  
        <span class="tag">
          {selectedApp.App_permit_Open} 
        </span>
    </div>
      <select bind:value={selectedApp.App_permit_Open} class="editable">
        <option value="" disabled>Select a group</option>
        {#each distinctGroups as distinctGroup}
          <option value={distinctGroup}>{distinctGroup}</option>
        {/each}
      </select>
    </div>

    <div class="input-container">
      <label for="Username" style="margin-bottom: 10px;">App_permit_toDoList:</label>
      <div class="spanBox" style="max-height:100px; overflow: auto;">    
          <span class="tag">
            {selectedApp.App_permit_toDoList} 
          </span>
      </div>
        <select bind:value={selectedApp.App_permit_toDoList}>
          <option value="" disabled>Select a group</option>
          {#each distinctGroups as distinctGroup}
            <option value={distinctGroup}>{distinctGroup}</option>
          {/each}
        </select>
  </div>

  <div class="input-container">
      <label for="Username" style="margin-bottom: 10px;">App_permit_Doing:</label>
      <div class="spanBox" style="max-height:100px; overflow: auto;">
          <span class="tag">
            {selectedApp.App_permit_Doing} 
          </span>
      </div>
        <select bind:value={selectedApp.App_permit_Doing}>
          <option value="" disabled>Select a group</option>
          {#each distinctGroups as distinctGroup}
            <option value={distinctGroup}>{distinctGroup}</option>
          {/each}
        </select>
  </div>

  <div class="input-container">
      <label for="Username" style="margin-bottom: 10px;">App_permit_Done:</label>
      <div class="spanBox" style="max-height:100px; overflow: auto;">
          <span class="tag">
            { selectedApp.App_permit_Done} 
          </span>
      </div>
        <select bind:value={selectedApp.App_permit_Done} >
          <option value="" disabled>Select a group</option>
          {#each distinctGroups as distinctGroup}
            <option value={distinctGroup}>{distinctGroup}</option>
          {/each}
        </select>
  </div>

    <!-- Repeat the permit fields for toDoList, Doing, Done -->

    <div slot="button">
      <button class="modelCloseBtn" on:click={() => submitEditedApp()}>Save Changes</button>
    </div>
  </Modal>
{/if}

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

input, select {
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
  display: flex; /* Use flexbox to align label and input side by side */
  align-items: center; /* Align vertically in the center */
  justify-content: space-between;
  margin-bottom: 15px; /* Add spacing between fields */
}

.input-container label {
  flex: 1; /* Label takes up equal space */
  margin-left: 20px; /* Spacing between label and input */
  text-align: left; /* Align label text to the right */
}


.input-container input
 {
  flex: 2; /* Input takes up equal space */
  padding: 5px;
  font-size: 1rem;
  box-sizing: border-box; /* Ensure padding doesn’t increase input width */
}

.input-container select,
.input-container button
 {
  flex: 2; /* Input takes up equal space */
  font-size: 1rem;
  box-sizing: border-box; /* Ensure padding doesn’t increase input width */
  max-width: 70px;
}

.spanBox{
  flex: 2; /* Input takes up equal space */
  padding: 5px;
  font-size: 1rem;
  box-sizing: border-box; /* Ensure padding doesn’t increase input width */
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
  width: 430px; /* Set width to accommodate both left and right sections */
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

.tags-container {
  display: flex;
  flex-wrap: wrap;
}

.tag {
  background-color: #bbb7b7;
  padding: 5px 10px;
  border-radius: 5px;
  margin: 5px;
  display: inline-flex;
  align-items: left;
  color: black;
}

.delete-btn {
  background: none;
  border: none;
  margin-left: 5px;
  cursor: pointer;
  color: red;
}

.add-btn {
  margin: 5px;
  cursor: pointer;
  background-color: #bbb7b7;
  color: black;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
}
</style>