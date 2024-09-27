<script>
    //   let kanbanBoard = {
  //   open: [
  //     { taskID: 1, title: 'Task 1', description: 'Backlog Task', color: '#FF6F61', taskOwner: 'John limmmm', planName:'',taskState:'', taskCreator:'',taskCreateDate:'', notes:''},
  //     { taskID: 2, title: 'Task 2', description: 'Backlog Task', color: '#FF6F61', taskOwner: 'Jane', planName:'',taskState:'', taskCreator:'',taskCreateDate:'', notes:'' },
  //   ],
  //   todo: [
  //     { taskID: 3, title: 'Task 3', description: 'To Do Task', color: '#FFDA77', taskOwner: 'Alice',planName:'',taskState:'', taskCreator:'',taskCreateDate:'', notes:'' },
  //   ],
  //   doing: [
  //     { taskID: 4, title: 'Task 4', description: 'Doing Task', color: '#1ABC9C', taskOwner: 'Bob' , planName:'',taskState:'', taskCreator:'',taskCreateDate:'', notes:''},
  //   ],
  //   review: [
  //     { taskID: 5, title: 'Task 5', description: 'In Review Task', color: '#9B59B6', taskOwner: 'Charlie',planName:'',taskState:'', taskCreator:'',taskCreateDate:'', notes:'' },
  //   ],
  //   done: [
  //     { taskID: 6, title: 'Task 6', description: 'Done Task', color: '#2ECC71', taskOwner: 'Emily', planName:'',taskState:'', taskCreator:'',taskCreateDate:'', notes:'' },
  //   ]
  // };
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import axios from 'axios';
    import { userStore } from '../../../lib/stores';
    import Layout from '../../layout.svelte';
    import { page } from '$app/stores';
    import { handleError, customError, customAlert} from '../../../lib/errorHandler';
    import { toast, Toaster } from 'svelte-sonner';
    const ApiUrl = import.meta.env.VITE_API_URL+':'+import.meta.env.VITE_PORT+'/api';
    import Modal from '../../../lib/AddGroupModel.svelte'

    let isAdmin = false;
    let globalUsername;
    let App_Name_URL;
    export let Global_App_Acronym = ''
    let kanbanBoard = {
      open: [],
      todo: [],
      doing: [],
      done: [],
      closed: []
    };
    let yourPermits = [];

    const getAllTask = async() => {
        try{
        const tasksListWithCategory = await axios.get(ApiUrl + '/getAllTask?appAcronym='+ App_Name_URL, {
          withCredentials: true  
          });
        kanbanBoard = tasksListWithCategory.data
        // console.log(kanbanBoard)

      } catch (error) {
        console.error('error:', error.response.data.message);
        handleError(error.response.data);
      }
  }


  const getUserPermits = async(App_Name_URL) => {
        try{
        const UserPermits = await axios.post(ApiUrl + '/getUserPermits', {username: globalUsername, appAcronym:App_Name_URL}, {
          withCredentials: true  
          });
          yourPermits = UserPermits.data.permissions.permissions
         console.log(UserPermits.data.permissions.permissions)
        // console.log(kanbanBoard)

      } catch (error) {
        console.error('error:', error.response.data.message);
        handleError(error.response.data);
      }
  }


    onMount(async () => {
        App_Name_URL = Global_App_Acronym
        console.log(App_Name_URL)
    try {
        const response = await axios.get(ApiUrl + '/Application   ', {
        withCredentials: true  
        });
        // console.log(response)
        if (response.data == "Forbidden: You do not have access to this resource"){
            goto('/login');
        }
        globalUsername = response.data.username
        // console.log('Access granted:', response.data);
        if (response.data.result.includes("admin") ){
            isAdmin = true      
        }
        getAllTask()
        getUserPermits(App_Name_URL)
        getPlan()
    } catch (error) {
        console.error('Access denied:', error.response.data.message);
        handleError(error.response.data);
    }
});


  let PlanModal = false;
  let showModal = false;

  let selectedCard =  {
    taskID: null,
    title: null,
    description: null,
    planName: null,
    taskState: null,
    taskCreator: null,
    taskOwner: null,
    taskCreateDate: null,
    notes: null
  };

  let originalPlanName = selectedCard.planName;

  let InsertplanList = {
    planName: null,
    applicationName:  Global_App_Acronym,
    startDate: null,
    endDate: null,
    color: null
  }


  let planList = []
  function getPlan() {
      const response =  axios.get(ApiUrl + '/plans?appAcronym='+ App_Name_URL, {
      withCredentials: true  
      }).then(response => {
     // console.log("getPlan Status:", response);  // Logs the status, e.g., 200
      planList = response.data
  
      })
      .catch(error => {
        console.error("Error:", error);
       // handleError(error.response.data);
      });    
  }


////////////////////////////////////// Creation of Plan and Task ////////////////////////////////// 
  function submitNewPlan(){
    console.log("submitNewPlan variable:",InsertplanList)
    if ( !InsertplanList.planName || !InsertplanList.startDate || !InsertplanList.endDate ) {
      customError("All fields must be filled")
      return
    }
    const response =  axios.post(ApiUrl + '/insertPlan', InsertplanList, {
      withCredentials: true  
      }).then(response => {
     // console.log("Status:", response.status);  // Logs the status, e.g., 200
      InsertplanList = {
          planName: null,
          applicationName: App_Name_URL,
          startDate: null,
          endDate: null,
          color: null
        }
      customAlert("New Plan Added")
      })
      .catch(error => {
        console.error("Error:", error);
        handleError(error.response.data);
      });    
    }


    function submitNewTask(){
      selectedCard.taskState = 'open'
      addComment()
      //console.log('Submit Task var: ',selectedCard)
      const response =  axios.post(ApiUrl + '/insertTask', selectedCard, {
      withCredentials: true  
      }).then(response => {
     // console.log("Status:", response.status);  // Logs the status, e.g., 200
      selectedCard =  {
        taskID: null,
        title: null,
        description: null,
        planName: null,
        taskState: null,
        taskCreator: null,
        taskOwner: null,
        taskCreateDate: null,
        notes: null
      };
      showModal = false;
      getAllTask()
      customAlert("New Task Added")
      })
      .catch(error => {
      selectedCard.taskState = 'create'
        console.error("Error:", error);
        handleError(error.response.data);
      });    
    }
////////////////////////////////////// End Creation of Plan and Task //////////////////////////////////



  let comment = '';
  let newNotes = selectedCard.notes; // To hold notes dynamically
  function addComment() {
    if (comment.trim()) {
      selectedCard.notes += `\n \n Date:${getDateNow()} \n Commented By: ${globalUsername}`
      selectedCard.notes += `\n${comment}`;
      comment = '';
    }
  }
  
  function SendEmail (){
    const response =  axios.post(ApiUrl + '/notifyUsers', {App_Acronym:Global_App_Acronym}, {
      withCredentials: true  
      }).then(response => {
     // console.log("Status:", response.status);  // Logs the status, e.g., 200

      customAlert("Email Sent")
      })
      .catch(error => {
        console.error("Error:", error);
        handleError(error.response.data);
      });  
  }



let DisableApproveBtn = false
  function editPlan(id, newPlanName){
    if (newPlanName !== originalPlanName) {
      console.log(`Plan changed to ${newPlanName}. Updating...`);
      DisableApproveBtn = true
      // Call the service to update the plan
      // Example: editPlanService(taskID, newPlanName);
      //originalPlanName = newPlanName; // Update the original value
    } else {
      DisableApproveBtn = false
      console.log('Plan name has not changed. No need to update.');
    }
  }

    //   const response =  axios.put(ApiUrl + '/editTaskPlan', {task_id: id, newTaskPlan:planName }, {
    //   withCredentials: true  
    //   }).then(response => {
    //  // console.log("editPlan Status:", response);  // Logs the status, e.g., 200
    //   // planList = response.data
    //   DisableApproveBtn = true
    //   customAlert("Plan Updated")
  
    //   })
    //   .catch(error => {
    //     console.error("Error:", error);
    //     handleError(error.response.data);
    //   });    
  


  async function saveChanges(NewState) {
    try {
      await addComment(); // Wait for addComment to complete
      //await editPlan(id, planName); // Wait for editPlan to complete
      console.log(selectedCard) 
      selectedCard.taskOwner = globalUsername
      const response =  await axios.put(ApiUrl + '/UpdateTask', {taskData: selectedCard, username:globalUsername, NewState: NewState} ,{
        withCredentials: true  
        }).then(response => {
      // console.log("Status:", response.status);  // Logs the status, e.g., 200
        // selectedCard =  {
        //   taskID: null,
        //   title: null,
        //   description: null,
        //   planName: null,
        //   taskState: null,
        //   taskCreator: null,
        //   taskOwner: null,
        //   taskCreateDate: null,
        //   notes: null
        // };
        //showModal = false;
        getAllTask()
        customAlert("Task Updated")
        })
        .catch(error => {
      
          console.error("Error:", error);
          handleError(error.response.data);
        });    

      console.log(selectedCard); // Log the updated card after changes are saved
    } catch (error) {
      console.error('Error saving changes:', error); // Handle any errors
    }
  }


  async function updateTask(taskID, state){
    await saveChanges(state)

    if (state ==='done'){
      SendEmail()
    }

    const response =  await axios.put(ApiUrl + '/updateTaskState', {task_id: taskID, newState:state, username: globalUsername }, {
      withCredentials: true  
      }).then(response => {
      console.log("updateTaskState Status:", response);  

      getAllTask()
      closeModal()
      DisableApproveBtn = false
      // planList = response.data
  
      })
      .catch(error => {
        console.error("Error:", error);
        handleError(error.response.data);
      });    
  }

  async function updateRejectedTask(taskID, state){
    //await saveChanges()
    const response =  await axios.put(ApiUrl + '/updateTaskState', {task_id: taskID, newState:state,  username: globalUsername }, {
      withCredentials: true  
      }).then(response => {
      console.log("getPlan Status:", response);  

      getAllTask()
      closeModal()
      DisableApproveBtn = false
      // planList = response.data
  
      })
      .catch(error => {
        console.error("Error:", error);
        handleError(error.response.data);
      });    
  }

  async function saveRejectedChanges(NewState) {
    try {
      await addComment(); // Wait for addComment to complete
      //await editPlan(id, planName); // Wait for editPlan to complete
      console.log(selectedCard) 
      const response =  await axios.put(ApiUrl + '/UpdateTask', {taskData: selectedCard,username: globalUsername,  NewState: NewState}, {
        withCredentials: true  
        }).then(response => {
      // console.log("Status:", response.status);  // Logs the status, e.g., 200

        //showModal = false;
        getAllTask()
        customAlert("Task Updated")
        })
        .catch(error => {
      
          console.error("Error:", error);
          handleError(error.response.data);
        });    

      console.log(selectedCard); // Log the updated card after changes are saved
    } catch (error) {
      console.error('Error saving changes:', error); // Handle any errors
    }
  }

    

//////////////////////////////////////// Modal functionalities /////////////////////////////////////
  function openModal(card) {
    // selectedCard = card;
    getAllTask()
getUserPermits()
    showModal = true;
    selectedCard = card;
    originalPlanName = selectedCard.planName;

  }

  let isEditable = false; // for onClick on create task variables
  function openCreateTaskModal(card) {
    isEditable = true
    showModal = true;

    selectedCard = {
    appAcronym: Global_App_Acronym,
    taskID: 'ID System Generated',
    title: null,
    description: null,
    planName: null, // This will be a dropdown in the modal
    taskState: 'create',
    taskCreator: globalUsername,
    taskOwner: globalUsername,
    taskCreateDate: getDateNow(),
    notes: `Date:${getDateNow()} \n Task Created By: ${globalUsername}`
    };
  }

  function closeModal() {
    showModal = false;
    isEditable = false
    selectedCard = null;
    getAllTask()
  }

  function openPlanModal(card) {
    // selectedCard = card;
    PlanModal = true;
  }


  function closePlanModal() {
    PlanModal = false;
  }
  ////////////////////////////////////// End Model functionalities  //////////////////////////////////


  function getDateNow(){
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so we add 1
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent default "Enter" behavior
      addComment(); // Call the function to add the comment
    }
  }






  
</script>


<!-- <Layout bind:globalUsername>
  <span slot="NavContentLeft">Hello, {globalUsername}</span>
    <div slot="NavContentCenter">
      {#if isAdmin}
        <a href="/Home page/Application" class:active={$page.url.pathname === '/Home%20page/Application'}>Application</a>
        <a href="/Home page/User Management" class:active={$page.url.pathname === '/Home%20page/User%20Management'}>User Management</a>
      {/if}
    </div>
    <div slot="NavContentRight" >Edit here</div>
  </Layout> -->
  
  <div class="container">
    <div class="header">
      <h2 class="head" >Task Management Board: {Global_App_Acronym}</h2>
      <div class="middle"></div>
      <div class="CreateApp">
        {#if yourPermits.includes('create')}
          <div class="CreateAppBtn" on:click={() => openCreateTaskModal()} >+ Create Task</div> 
        {/if}
       {#if yourPermits.includes('PM') }
          <div class="CreateAppBtn" style="margin-left: 20px;" on:click={() => openPlanModal()} >+ Create Plan</div> 
       {/if}
       
        
      </div>
    </div>
  </div>
  

   <!---------------------------------- Display kanban-board ------------------------------------>
  <div class="kanban-board">
    <!-- Backlog Column -->
    <div class="kanban-column">
      <h3>Open</h3>
      {#each kanbanBoard.open as card (card.taskID)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="kanban-card" on:click={() => openModal(card)}>
          <div class="color-bar" style="background-color: {card.color};"></div>
          <h4>{card.taskID}</h4>
          <p>{card.title}</p>
          <span class="owner-tag">{card.taskOwner}</span>
        </div>
      {/each}
    </div>
  
    <!-- To Do Column -->
    <div class="kanban-column">
      <h3>To Do</h3>
      {#each kanbanBoard.todo as card (card.taskID)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="kanban-card" on:click={() => openModal(card)}>
          <div class="color-bar" style="background-color: {card.color};"></div>
          <h4>{card.taskID}</h4>
          <p>{card.title}</p>
          <span class="owner-tag">{card.taskOwner}</span>
        </div>
      {/each}
    </div>
  
    <!-- Doing Column -->
    <div class="kanban-column">
      <h3>Doing</h3>
      {#each kanbanBoard.doing as card (card.taskID)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="kanban-card" on:click={() => openModal(card)}>
          <div class="color-bar" style="background-color: {card.color};"></div>
          <h4>{card.taskID}</h4>
          <p>{card.title}</p>
          <span class="owner-tag">{card.taskOwner}</span>
        </div>
      {/each}
    </div>
  
    <!-- Review Column -->
    <div class="kanban-column">
      <h3>Done</h3>
      {#each kanbanBoard.done as card (card.taskID)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="kanban-card" on:click={() => openModal(card)}>
          <div class="color-bar" style="background-color: {card.color};"></div>
          <h4>{card.taskID}</h4>
          <p>{card.title}</p>
          <span class="owner-tag">{card.taskOwner}</span>
        </div>
      {/each}
    </div>
  
    <!-- Done Column -->
    <div class="kanban-column">
      <h3>Closed</h3>
      {#each kanbanBoard.closed as card (card.taskID)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="kanban-card" on:click={() => openModal(card)}>
          <div class="color-bar" style="background-color: {card.color};"></div>
          <h4>{card.taskID}</h4>
          <p>{card.title}</p>
          <span class="owner-tag">{card.taskOwner}</span>
        </div>
      {/each}
    </div>
  </div>
  

  <!---------------------------------- Show task card modal ------------------------------------>
  {#if showModal}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal" on:click={closeModal}>
  <Toaster style="z-index: 12;" />
    <div class="modal-content" on:click|stopPropagation>
      <!-- Modal Header -->
      <!-- <button class="modal-close-btn" on:click={closeModal}>&times;</button> -->
      <div class="modal-header">{selectedCard.taskID}</div>
      
      <!-- Modal Body -->
      <div class="modal-body">
        <!-- Left Side (Task Details) -->
        <div class="modal-left">
          <div class="details-row">
            <strong>Task ID:</strong>
            <span>
                {selectedCard.taskID}
            </span>
          </div>

          <div class="details-row">
            <strong>Task Name:</strong>
            <span>
              {#if selectedCard.taskState === 'open'  && !isEditable && yourPermits.includes('create') } <!--for PL Edit task-->
                <input type="text" bind:value={selectedCard.title} /> 
              {:else if isEditable && yourPermits.includes('create')} <!--for PL insert Task in creating task modal-->
                <input type="text" bind:value={selectedCard.title} />
              {:else}
                {selectedCard.title} <!--for All View Task-->
              {/if}
            </span>
          </div>

          <div class="details-row">
            <strong>Task Description:</strong>
            <span>
              {#if selectedCard.taskState === 'open' && !isEditable && yourPermits.includes('create')}
                <textarea style="height: 200px; width: 100%;" bind:value={selectedCard.description}></textarea>
              {:else if isEditable}
                <textarea style="height: 200px; width: 100%;" bind:value={selectedCard.description}></textarea>
              {:else}
                <textarea style="height: 200px; width: 100%;" bind:value={selectedCard.description} disabled></textarea>
              {/if}
            </span>
          </div>

          <div class="details-row">
            <strong>Plan Name:</strong>
            <span>
              {#if selectedCard.taskState === 'open' && !isEditable && yourPermits.includes('create')} <!-- for PL to edit plan-->
                <select bind:value={selectedCard.planName} on:click={getPlan}>
                  <option value=''>No Plan</option>
                  {#each planList as planIndex }
                    <option value={planIndex.Plan_MVP_name}>{planIndex.Plan_MVP_name}</option>
                  {/each}
                </select>
              {:else if selectedCard.taskState === 'done' && !isEditable && yourPermits.includes('create')} <!-- for PL to reject and edit plan-->
                <select bind:value={selectedCard.planName} on:click={getPlan} on:change={editPlan(selectedCard.taskID,selectedCard.planName)}> <!-- need to disable btn-->
                  <option value=''>No Plan</option>
                  {#each planList as planIndex }
                    <option value={planIndex.Plan_MVP_name}>{planIndex.Plan_MVP_name}</option>
                  {/each}
                </select>
               {:else if selectedCard.taskState === 'open' && !isEditable && yourPermits.includes('open') } <!-- for PM to edit plan-->
                <select bind:value={selectedCard.planName} on:click={getPlan} >
                  <option value=''>No Plan</option>
                  {#each planList as planIndex }
                    <option value={planIndex.Plan_MVP_name}>{planIndex.Plan_MVP_name}</option>
                  {/each}
                </select>
              {:else if isEditable }
                <select bind:value={selectedCard.planName} on:click={getPlan} >
                  <option value=''>No Plan</option>
                  {#each planList as planIndex }
                    <option value={planIndex.Plan_MVP_name}>{planIndex.Plan_MVP_name}</option>
                  {/each}
                </select>
              {:else}
                {selectedCard.planName}
              {/if}
            </span>
          </div>

          <div class="details-row">
            <strong>Task State:</strong>
            <span>
                {selectedCard.taskState}
            </span>
          </div>

          <div class="details-row">
            <strong>Task Creator:</strong>
            <span>
                {selectedCard.taskCreator}
            </span>
          </div>

          <div class="details-row">
            <strong>Task Owner:</strong>
            <span>
                {selectedCard.taskOwner}
            </span>
          </div>

          <div class="details-row">
            <strong>Task Create Date:</strong>
            <span>
                {selectedCard.taskCreateDate}
            </span>
          </div>                                  
        </div>

        <!-- Right Side (Notes and Comments) -->
        <div class="modal-right">
          <!-- Notes Section -->
          <div class="notes-section">
              <p>{selectedCard.notes}</p>
          </div>

          <!-- Comments Section -->
          <div class="comments-section">
            <textarea rows="4" bind:value={comment} placeholder="Add a comment..." on:keydown={handleKeyDown}></textarea>
            <!-- <button class="modal-action-btn" on:click={addComment}>Add Comment</button> -->
          </div>
        </div>
      </div>
      
      <!-- Modal Footer (Action Buttons) -->
      <div class="modal-footer">
      {#if selectedCard.taskState === 'create' && yourPermits.includes('create')} <!-- PL Create task-->
        <button class="modal-action-btn takeon" on:click={submitNewTask} >Create Task</button>

      {:else if selectedCard.taskState === 'open' && yourPermits.includes('open')} <!-- PM release task-->
        <button class="modal-action-btn takeon" on:click={updateTask(selectedCard.taskID, 'todo')}>Release Task</button>

      {:else if selectedCard.taskState === 'todo' && yourPermits.includes('todo')}
        <button class="modal-action-btn takeon" on:click={updateTask(selectedCard.taskID, 'doing')}>Take On</button>

      {:else if selectedCard.taskState === 'doing' && yourPermits.includes('doing')}
        <button class="modal-action-btn takeon" on:click={updateTask(selectedCard.taskID, 'done')}>Request Approval</button>
        <button class="modal-action-btn approval" on:click={updateTask(selectedCard.taskID, 'todo')}>Give Up</button>
        
      {:else if selectedCard.taskState === 'done' && yourPermits.includes('done')}
        {#if !DisableApproveBtn}
          <button class="modal-action-btn takeon" on:click={() => updateTask(selectedCard.taskID, 'closed')}>Approve </button>
        {/if}       
        <button class="modal-action-btn approval" on:click={updateRejectedTask(selectedCard.taskID, 'doing')}>Reject </button>
      {/if}

      {#if selectedCard.taskState != 'create' && selectedCard.taskState != 'done' && selectedCard.taskState != 'closed'}
        <button class="modal-action-btn" on:click={() => saveChanges(null)}>Save Changes</button>
        {:else if selectedCard.taskState === 'done'}
         <button class="modal-action-btn" on:click={() => saveRejectedChanges(null)}>Save Changess</button>
      {/if}
        <button class="modal-close-btn" on:click={closeModal}>Cancel</button>
      </div>
    </div>
  </div>
{/if}


  <!---------------------------------- Show create plan modal ------------------------------------>
{#if PlanModal}

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal" on:click={closePlanModal}>
  <div class="modal-content-plan" on:click|stopPropagation>
    <Toaster style="z-index: 12;" />
    <!-- Modal Header -->
    <!-- <button class="modal-close-btn" on:click={closeModal}>&times;</button> -->
    <div class="modal-header">Create Plan</div>
    <!-- Modal Body -->
    <div class="modal-body-plan">
      <div class="modal-center">
        <div class="details-row">
          <strong>Application Name:</strong>
          <input type="text" bind:value={InsertplanList.applicationName} disabled />
        </div>
        <div class="details-row">
          <strong>Plan Name:</strong>
          <input type="text" bind:value={InsertplanList.planName} />
        </div>
        <div class="details-row">
          <strong>Start Date:</strong>
          <input type="date" bind:value={InsertplanList.startDate} />
        </div>
        <div class="details-row">
          <strong>End Date:</strong>
          <input type="date" bind:value={InsertplanList.endDate} />
        </div>
        <div class="details-row">
          <strong>Color:</strong>
          <input type="color" bind:value={InsertplanList.color} />
        </div>
      </div>
    </div>
        <div class="modal-footer">
      <button class="modal-action-btn" on:click={submitNewPlan}>Create Plan</button>
      <button class="modal-close-btn" on:click={closePlanModal}>Cancel</button>
    </div>
  </div>
</div>
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
  margin-top: 25px;
  align-items: stretch;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
}

.header {
  display: flex;
  justify-content: center;
  text-align:start;
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

/* kanban board */
  .kanban-board {
    display: flex;
    gap: 10px;
    padding-left: 10px;
    padding-right: 10px;
  }

  .kanban-column {
    background-color: #d7d3d3;
    padding: 10px;
    border-radius: 8px;
    width: 100%;
    height: auto;
    min-height: 570px;
    max-height: 570px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    overflow: auto;
  }

  .kanban-column h3 {
    text-align: top;
    margin-left: 20px;
    color: #333;
    font-size: 1.5em;
  }

  .kanban-card {
    background-color: #fff;
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    cursor: grab;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 60px;
    min-height: 60px;
    position: relative;
  }

  .kanban-card:hover {
  transform: translateY(-10px); 
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.7); 
}

.kanban-card .color-bar {
    /* width: 10px;
    height: 80px;
    margin-left: -12px;
    margin-top: -100px;
    position: sticky;
    border-radius: 6px 0 0 6px;  */
    color: white;
    padding: 2px ;
    margin-top: -5px;
    border-radius: 10px;
    font-size: 0.8em;
    display: inline-block;
    align-self: flex-start;
    position: sticky;
    z-index: 99;
    width: 40px;
    min-height: 5px;
  }

  .kanban-card h4 {
    margin: 0;
    font-size: 1.1em;
    color: #333;
  }

  .kanban-card p {
    margin: 5px 0 0;
    color: #777;
    font-size: 0.9em;
  }

    /* Task Owner Tag Styling */
  .kanban-card .owner-tag {
    background-color: #0095FF;
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 0.8em;
    display: inline-block;
    align-self: flex-end;
    position: sticky;
    z-index: 99;
  }


  /* Modal Styling */
  .modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  overflow: hidden; /* Ensure that modal content can't overflow out of the view */
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  max-width: 1000px;
  height: 90vh; /* Ensure the modal doesn't go beyond 90% of the viewport height */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-y: auto; /* Ensure the entire modal content is scrollable if needed */
}

.modal-content-plan{
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  max-width: 1000px;
  height: 60vh; /* Ensure the modal doesn't go beyond 90% of the viewport height */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-y: auto; /* Ensure the entire modal content is scrollable if needed */
}


.modal-header {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 20px;
  background-color: #000000;
  color: #fff;
  text-align: center;
}

.modal-body {
  display: flex;
  gap: 20px;
  flex: 3; /* Allow the body to expand to fill the available space */
  margin-bottom: 20px;
}

.modal-body-plan {
  display: flex;
  gap: 20px;
  flex: 3; /* Allow the body to expand to fill the available space */
  margin-bottom: 20px;
  max-height:300px;
}

.modal-center {
  width: 90%; /* Make sure modal-center covers the full width of the modal */
  height: 300px;
  display: grid;
  grid-template-columns: 150px 1fr; /* Define two columns: one for labels and one for inputs */
  gap: 10px 20px; /* Gap between rows and columns */
}

.modal-right {
  flex: 2;
  width: 300px;
}

.modal-left {
  display: grid;
  grid-template-columns: 100px 1fr; /* Label column and content column */
  gap: 5px; /* Spacing between rows */
  align-items: left; /* Vertically center the items */
}

.details-row {
  display: contents; /* Keep the items inline but let them respect the grid */
}

.details-row strong {
  justify-self: start; /* Align labels to the left */
}

.details-row span, .details-row select {
  justify-self: start; /* Align content to the left */
  padding-left: 1px;
}

/* Updated Notes Section */
.notes-section {
  width: 90%;
  height: 370px;
  overflow-y: auto; /* Allow vertical scrolling */
  overflow-x: hidden; /* Prevent horizontal scrolling */
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #f9f9f9;
}

.notes-section p {
  white-space: pre-line; /* This ensures newlines are respected in the string */
}

.comments-section {
  margin-top: 20px;
}

.comments-section textarea {
  width: 90%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  resize: none;
}

.modal-footer {
  display: flex;
  justify-content:center
}

.modal-close-btn, .modal-action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
}

.modal-close-btn {
  background-color: red;
  color: white;
}

.modal-action-btn {
  background-color: #4CAF50;
  color: white;
}

.modal-action-btn.takeon {
  background-color: #2196F3;
}

.modal-action-btn.approval {
  background-color: #FF9800;
}



  /* To handle responsiveness */
  @media (max-width: 768px) {
    .kanban-board {
      flex-direction: column;
      align-items: center;
    }
  }
</style>
