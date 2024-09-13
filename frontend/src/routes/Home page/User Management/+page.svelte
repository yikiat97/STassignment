<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import axios from 'axios';
  import { userStore } from '../../../lib/stores';
  import Layout from '../../layout.svelte';
  import { page } from '$app/stores';
  import { handleError,customError, handleNetworkError, handleUnauthorizedError, handleValidationError, customAlert } from '../../../lib/errorHandler';
  const ApiUrl = import.meta.env.VITE_API_URL+':'+import.meta.env.VITE_PORT+'/api';
  import Modal from '../../../lib/AddGroupModel.svelte';

	
let isAdmin = false;
let showModal = false;
let ProfileModal = false;
let AddedGroupName = '';
let users = [];
let distinctGroups = [];
let globalUsername;

let updatedEmail;
let password

const getAllUsers = async() => {
      try{
      const userlist = await axios.get(ApiUrl + '/users', {
        withCredentials: true  
        });
        users = userlist.data
        // users = userlist.data
        console.log(userlist)
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
        const response = await axios.get(ApiUrl + '/UserManagement', {
        withCredentials: true  
        });
        console.log(response)
        if (response.data == "Forbidden: You do not have access to this resource"){
            goto('/login');
        }
        isAdmin = true
        console.log('Access granted:', response.data);
        globalUsername = response.data.username
        getAllUsers()
        getAllGroups()
    } catch (error) {
        // Handle any errors, like unauthorized access
        
        // @ts-ignore
        console.error('Access denied:', error.response.data.message);
        handleError(error.response.data);
        goto('/login');
    }
// @ts-ignore



});



// let users = [
//     { name: 'John Doe', email: 'john@example.com', group: ['Admin'], password: 'qweqweq', active: 'Active', editMode: false },
//     { name: 'Jane Smith', email: '', group: ['User','Admin], password: 'qwewqe', active: 'Inactive', editMode: false }
// ];

let groups = ['Admin', 'User'];
// let distinctGroups = ['admin', 'users', "root admin"];
let activeStatus = ['Active', 'Inactive'];

// New user object for the creation row
let newUser = {
    username: null,
    email: null,
    group: [],
    password: null,
    active: 'Active',
    editMode: false
};

let NewUserShowDropdown = false
function showAddGroupDropdownNewUser(){
  NewUserShowDropdown = true;
}

let NewUserSelectedGroup ="";
function addNewUserGroup(){
  if (!newUser.group.includes(NewUserSelectedGroup)) {
    newUser.group = [ ...newUser.group, NewUserSelectedGroup];
  }
  NewUserShowDropdown = false;
}

function NewUserRemoveGroup(groupIndex){
  newUser.group = [...newUser.group.slice(0, groupIndex), ...newUser.group.slice(groupIndex + 1)];
}

// @ts-ignore
function toggleEditMode(index) {
   users[index].editMode = !users[index].editMode;
}


function removeGroup(userIndex, groupIndex) {
  users[userIndex].usergroups = [...users[userIndex].usergroups.slice(0, groupIndex), ...users[userIndex].usergroups.slice(groupIndex + 1)];
  // console.log($users[userIndex])
}

function showAddGroupDropdown(index) {
 users[index].showDropdown = true;
}

function addGroup(index) {
      if (users[index].selectedGroup === '') {
      customAlert("Please select a valid group.")
      return; // Don't allow the default option to proceed
    }
  if (!users[index].usergroups.includes(users[index].selectedGroup)) {
   users[index].usergroups.push(users[index].selectedGroup);
  }
 users[index].showDropdown = false;
}

// @ts-ignore
function saveChanges(index) {
  users[index].editMode = false;
  console.log('Saved before post:',users[index]);

  const response =  axios.put(ApiUrl + '/updateUser', users[index], {
    withCredentials: true  
    }).then(response => {
    console.log("Status:", response);  // Logs the status, e.g., 200
    getAllUsers()
    customAlert("Updated Profile")

  })
  .catch(error => {
    console.error("Error:", error);
    getAllUsers()
    handleError(error.response.data);
    /////////////////////////////////////////////////// rmb change Forbidden: You do not have access to this resource 
  });

  
}

// @ts-ignore
function cancelEdit(index) {
    // Cancel logic, reset or ignore changes
   users[index].editMode = false;
    getAllUsers()
}

function submitNewUser() {
    if (newUser.username && newUser.password) {

      const password = newUser.password;
      if (password.length < 8 || password.length > 10) {
         customError("Password must be between 8 and 10 characters long.");
        throw new Error("Password must be between 8 and 10 characters long.");
        
      }

      const hasAlphabet = /[A-Za-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecialChar = /[@$!%*?&]/.test(password);

      if (!hasAlphabet || !hasNumber || !hasSpecialChar) {
        customError("Password must contain at least one letter, one number, and one special character.");
        throw new Error("Password must contain at least one letter, one number, and one special character.");

      }
      
        // @ts-ignore
       //users = [...users, { ...newUser }];

    

        console.log('New user list before post:', newUser);

        const response =  axios.post(ApiUrl + '/register', newUser, {
          withCredentials: true  
          }).then(response => {
          console.log("Status:", response.status);  // Logs the status, e.g., 200
          newUser = {
              // @ts-ignore
              username: "",
              // @ts-ignore
              email: "",
              // @ts-ignore
              group: [],
              // @ts-ignore
              password: "",
              active: 'active',
              editMode: false
              };

              getAllUsers()
              customAlert("New User Added")
        })
        .catch(error => {
          console.error("Error:", error);
          handleError(error.response.data);
         
        });

        
    } else {
        //alert('Please fill in all fields');
        //const error.response.data.message = 'Please fill in all fields'
        customError('Please fill in all fields');
    }
}

function addNewGroup(){
  console.log("new group added ", AddedGroupName)
        const response =  axios.post(ApiUrl + '/addNewGroup', {"groupName" :AddedGroupName}, {
          withCredentials: true  
          }).then(response => {
          console.log("Status:", response.status); 
          getAllGroups()
          customAlert("group added")
          showModal = false

        })
        .catch(error => {
          console.error("Error:", error);  
          handleError(error.response.data);
        });


}

</script>


<Layout>
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
    <h1 class="head" >User Management</h1>
    <div class="middle"></div>
    <div class="addGroup">
      <div class="AddGroupBtn" on:click={() => (showModal = true)} >+ Group</div> 
    </div>
  </div>
  <div class="header-wrapper">
  <div class="header-background"></div>
  <table>
    <thead>
        <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Group</th>
            <th>Password</th>
            <th>Active</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody class="TableBodyContainer">
        <!-- Row for Creating a New User -->
        <tr class="input-new">
            <td><input type="text" bind:value={newUser.username} placeholder="Enter name" /></td>
            <td><input type="text" bind:value={newUser.email} placeholder="Enter email" /></td>
            <td>
                <!-- <select bind:value={newUser.group}>
                    {#each groups as group}
                        <option value={group}>{group}</option>
                    {/each}
                </select> -->
            <button class="add-btn" on:click={() => showAddGroupDropdownNewUser()}>+</button>
                {#each newUser.group as group, groupIndex}
                  <span class="tag">
                    {group} 
                    <button class="delete-btn" on:click={() => NewUserRemoveGroup(groupIndex)}>x</button>
                  </span>
                {/each}
                {#if NewUserShowDropdown}
                  <!-- Show dropdown to add group -->
                  <select bind:value={NewUserSelectedGroup} on:click={() => addNewUserGroup()}>
                    <option value="" disabled>Select a group</option>
                    {#each distinctGroups as distinctGroup}
                      <option value={distinctGroup}>{distinctGroup}</option>
                    {/each}
                  </select>
                {/if}
            </td>
            <td><input type="password" bind:value={newUser.password} placeholder="Enter password" /></td>
            <td>
                <select bind:value={newUser.active}>
                    {#each activeStatus as status}
                        <option value={status}>{status}</option>
                    {/each}
                </select>
            </td>
            <td>
                <button class="btn-submit" on:click={submitNewUser}>Submit</button>
            </td>
        </tr>

        <!-- Existing Users Rows -->
    {#each users as user, index}
        <tr class="userTableBody">
            <td><input type="text" bind:value={user.username} disabled  /></td>
            <td><input type="text" bind:value={user.email} disabled={!user.editMode} class:editable={user.editMode} /></td>

            <td>
              {#if user.editMode}
              <!-- Show group tags in edit mode -->
              <div class="tags-container">
                {#each user.usergroups as group, groupIndex}
                  <span class="tag">
                    {group} 
                    <button class="delete-btn" on:click={() => removeGroup(index, groupIndex)}>x</button>
                  </span>
                {/each}
                <button class="add-btn" on:click={() => showAddGroupDropdown(index)}>+</button>
                
                {#if user.showDropdown}
                  <!-- Show dropdown to add group -->
                  <select bind:value={user.selectedGroup} on:change={() => addGroup(index)}>
                    <option value="" >Select a group</option>
                    {#each distinctGroups as distinctGroup}
                      <option value={distinctGroup}>{distinctGroup}</option>
                    {/each}
                  </select>
                {/if}
              </div>
              {:else}
                <!-- Show group in tag view-only -->
                <div class="view-only-box">
                  {#each user.usergroups as group}
                    <span class="tag">{group}</span>
                  {/each}
                </div>
              {/if}
            </td>

            <td><input type="password" bind:value={user.password} disabled={!user.editMode} class:editable={user.editMode} /></td>
            <td>
                <select bind:value={user.accountStatus} disabled={!user.editMode} class:editable={user.editMode}>
                    {#each activeStatus as status}
                        <option value={status}>{status}</option>
                    {/each}
                </select>
            </td>
            <td>
                {#if user.editMode}
                    <div class="buttons">
                        <button class="btn-save" on:click={() => saveChanges(index)}>Save</button> <br>
                        <button style="margin-top: 10px;" class="btn-cancel" on:click={() => cancelEdit(index)}>Cancel</button>
                    </div>
                {:else}
                    <span class="icon" on:click={() => toggleEditMode(index)}>🖉</span>
                {/if}
            </td>
        </tr>
    {/each}
    </tbody>
</table>
</div>
</div>

<Modal bind:showModal>
	<h2 slot="header">
    Add Group
	</h2>

 <div class="input-container">
    <label for="groupName" style="margin-bottom: 10px;">Group Name:</label>
    <input type="text" id="groupName" bind:value={AddedGroupName} class="editable" />
</div>
 <div slot="button">
    <button class="modelCloseBtn" on:click={() => addNewGroup()}>ADD</button>
    <!-- <button class="modelCloseBtn" on:click={() => showModal = false}>CANCEL</button> not fixeddddd -->
  </div>
    

</Modal>

<style>
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

.addGroup {
  flex-grow: 1;
  display: flex;
  justify-content: center;
}

.AddGroupBtn {
  width: 100px;
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

.header-wrapper {
  position: relative;
  width: 100%;
}

/* The background div behind the table header */
.header-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%; /* Set the width of the background */
  background-color: #EFF4FA;
  height: 90px;
  z-index: -1; /* Put the background behind the header */
} 

table {
  width: 80%; /* Make table span full width */
  border-collapse: collapse;
  margin-left: auto;
  margin-right: auto;
}

thead {
  width: 100%; /* Ensure thead takes full width */
}

tbody {
  width: 80%; /* Reduce width of tbody */
  margin-left: auto;
  margin-right: auto;
}

 td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
    padding: 11px;
  background-color: #EFF4FA;
  height: 68px;
  text-align: left;
}

.TableBodyContainer {
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

.icon {
  cursor: pointer;
  color: #007BFF;
}

.buttons {
  gap: 10px;
}

.btn-save, .btn-cancel, .btn-submit {
  cursor: pointer;
  padding: 5px 10px;
  border: none;
  color: white;
  background-color: black;
  width: 100%;
}

.input-new {
  background-color: #ffffff;
  width: 80%;
  margin-left: auto;
  margin-right: auto;
}

input, select {
  margin-bottom: 20px;
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
  border: none;
  outline: none;
  padding: 8px;
  background-color: #ffffff; /* Default background color for non-editable inputs */
}

.editable {
  background-color: #C9C9C9; /* Background color when editable */
}

.view-only-box {
  color: white;
  padding: 10px;
  border-radius: 8px; /* Rounded corners */
  text-align: left;
  display: inline-block;
  width: 100%; /* Make it the same width as the dropdown */
  box-sizing: border-box;
  height: 35px;
}

.view-only-box .tag {
  background-color: #d3d3d3;
  margin-right: 5px;
  padding: 3px 6px;
  border-radius: 4px;
}

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



</style>