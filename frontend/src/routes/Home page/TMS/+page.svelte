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

    let isAdmin = false;
    let globalUsername;

    onMount(async () => {
        const App_Name_URL = $page.url.searchParams.get('App_Acronym');
        console.log(App_Name_URL)
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
        console.error('Access denied:', error.response.data.message);
        handleError(error.response.data);
    }
});

let kanbanBoard = {
    open: [
      { id: 1, title: 'Task 1', description: 'Backlog Task', color: '#FF6F61', owner: 'John limmmm' },
      { id: 2, title: 'Task 2', description: 'Backlog Task', color: '#FF6F61', owner: 'Jane' },
    ],
    todo: [
      { id: 3, title: 'Task 3', description: 'To Do Task', color: '#FFDA77', owner: 'Alice' },
    ],
    doing: [
      { id: 4, title: 'Task 4', description: 'Doing Task', color: '#1ABC9C', owner: 'Bob' },
    ],
    review: [
      { id: 5, title: 'Task 5', description: 'In Review Task', color: '#9B59B6', owner: 'Charlie' },
    ],
    done: [
      { id: 6, title: 'Task 6', description: 'Done Task', color: '#2ECC71', owner: 'Emily' },
    ]
  };

  let PlanModal = false;
  let showModal = false;
  let selectedCard =  {
    taskID: '',
    title: '',
    description: '',
    planName: '', // This will be a dropdown in the modal
    taskState: 'In Progress',
    taskCreator: '',
    taskOwner: '',
    taskCreateDate: '',
    notes: ''
  };



  let comment = '';
  let newNotes = selectedCard.notes; // To hold notes dynamically

  // Logic for buttons (conditionally rendered)
  let taskState = selectedCard.taskState;

  function addComment() {
  if (comment.trim()) {
    // Append the new comment to the existing notes, adding a new line
    selectedCard.notes += `\n${comment}`;
    
    // Clear the comment input after adding
    comment = '';
  }
}

  // Function to handle card click
  function openModal(card) {
    // selectedCard = card;
    showModal = true;
    selectedCard = {
    taskID: 'T001',
    title: 'Application_1',
    description: 'Implement login feature',
    planName: 'MVP Plan', // This will be a dropdown in the modal
    taskState: 'In Progress',
    taskCreator: 'John Doe',
    taskOwner: 'Jane Doe',
    taskCreateDate: '2024-01-15',
    notes: 'This is the first note.'
  };
 

  }

  // Function to close modal
  function closeModal() {
    showModal = false;
    selectedCard = null;
  }

  function openPlanModal(card) {
    // selectedCard = card;
    PlanModal = true;

  }

  function closePlanModal() {
    PlanModal = false;
   
  }
  
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
      <h1 class="head" >Task Management Board</h1>
      <div class="middle"></div>
      <div class="CreateApp">
        <div class="CreateAppBtn" on:click={() => openPlanModal()} >+ Create Plan</div> 
      </div>
    </div>
  </div>
  
   <!---------------------------------- Display kanban-board ------------------------------------>
  <div class="kanban-board">
    <!-- Backlog Column -->
    <div class="kanban-column">
      <h3>Open</h3>
      {#each kanbanBoard.open as card (card.id)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="kanban-card" on:click={() => openModal(card)}>
          <div class="color-bar" style="background-color: {card.color};"></div>
          <h4>{card.title}</h4>
          <p>{card.description}</p>
          <span class="owner-tag">{card.owner}</span>
        </div>
      {/each}
    </div>
  
    <!-- To Do Column -->
    <div class="kanban-column">
      <h3>To Do</h3>
      {#each kanbanBoard.todo as card (card.id)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="kanban-card" on:click={() => openModal(card)}>
          <div class="color-bar" style="background-color: {card.color};"></div>
          <h4>{card.title}</h4>
          <p>{card.description}</p>
          <span class="owner-tag">{card.owner}</span>
        </div>
      {/each}
    </div>
  
    <!-- Doing Column -->
    <div class="kanban-column">
      <h3>Doing</h3>
      {#each kanbanBoard.doing as card (card.id)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="kanban-card" on:click={() => openModal(card)}>
          <div class="color-bar" style="background-color: {card.color};"></div>
          <h4>{card.title}</h4>
          <p>{card.description}</p>
          <span class="owner-tag">{card.owner}</span>
        </div>
      {/each}
    </div>
  
    <!-- Review Column -->
    <div class="kanban-column">
      <h3>Review</h3>
      {#each kanbanBoard.review as card (card.id)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="kanban-card" on:click={() => openModal(card)}>
          <div class="color-bar" style="background-color: {card.color};"></div>
          <h4>{card.title}</h4>
          <p>{card.description}</p>
          <span class="owner-tag">{card.owner}</span>
        </div>
      {/each}
    </div>
  
    <!-- Done Column -->
    <div class="kanban-column">
      <h3>Done</h3>
      {#each kanbanBoard.done as card (card.id)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="kanban-card" on:click={() => openModal(card)}>
          <div class="color-bar" style="background-color: {card.color};"></div>
          <h4>{card.title}</h4>
          <p>{card.description}</p>
          <span class="owner-tag">{card.owner}</span>
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
    <div class="modal-content" on:click|stopPropagation>
      <!-- Modal Header -->
      <!-- <button class="modal-close-btn" on:click={closeModal}>&times;</button> -->
      <div class="modal-header">{selectedCard.title}</div>
      
      <!-- Modal Body -->
      <div class="modal-body">
        <!-- Left Side (Task Details) -->
        <div class="modal-left">
          <div class="details-row">
            <strong>Task ID:</strong> <span>{selectedCard.taskID}</span>
          </div>
          <div class="details-row">
            <strong>Task Name:</strong> <span>{selectedCard.title}</span>
          </div>
          <div class="details-row">
            <strong>Plan Name:</strong>
            <span>
              <select>
                <option>{selectedCard.planName}</option>
                <option>Plan 2</option>
                <option>Plan 3</option>
              </select>
            </span>
          </div>
          <div class="details-row">
            <strong>Task State:</strong> <span>{selectedCard.taskState}</span>
          </div>
          <div class="details-row">
            <strong>Task Creator:</strong> <span>{selectedCard.taskCreator}</span>
          </div>
          <div class="details-row">
            <strong>Task Owner:</strong> <span>{selectedCard.taskOwner}</span>
          </div>
          <div class="details-row">
            <strong>Task Create Date:</strong> <span>{selectedCard.taskCreateDate}</span>
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
            <textarea rows="4" bind:value={comment} placeholder="Add a comment..."></textarea>
            <button class="modal-action-btn" on:click={addComment}>Add Comment</button>
          </div>
        </div>
      </div>
      
      <!-- Modal Footer (Action Buttons) -->
      <div class="modal-footer">
        {#if taskState === 'In Progress'}
          <button class="modal-action-btn takeon">Take On</button>
          <button class="modal-action-btn approval">Request Approval</button>
        {:else if taskState === 'Completed'}
          <button class="modal-action-btn">Approve</button>
        {/if}
        <button class="modal-close-btn" on:click={closeModal}>Cancel</button>
      </div>
    </div>
  </div>
{/if}


{#if PlanModal}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal" on:click={closePlanModal}>
  <div class="modal-content" on:click|stopPropagation>
    <!-- Modal Header -->
    <!-- <button class="modal-close-btn" on:click={closeModal}>&times;</button> -->
    <div class="modal-header">data here</div>
    
    <!-- Modal Body -->
    <div class="modal-body">
      
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

/* kanban board */
  .kanban-board {
    display: flex;
    gap: 20px;
    padding: 20px;
  }

  .kanban-column {
    background-color: #d7d3d3;
    padding: 10px;
    border-radius: 8px;
    width: 2000px;
    height: auto;
    min-height: 870px;
    max-height: 870px;
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
  }

  .kanban-card:hover {
  transform: translateY(-10px); 
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.7); 
}

.kanban-card .color-bar {
    width: 10px;
    height: 90px;
    margin-left: -12px;
    margin-top: -10px;
    position: absolute;
    border-radius: 6px 0 0 6px; /* Rounded left edge */

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
    margin-top: 10px;
    align-self: flex-end;
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
  height: 70vh; /* Ensure the modal doesn't go beyond 90% of the viewport height */
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

.modal-right {
  flex: 2;
  width: 500px;
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
  height: 350px;
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
