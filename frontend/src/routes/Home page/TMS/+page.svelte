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
    backlog: [
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

    // State to control modal visibility and the selected card
  let showModal = false;
  let selectedCard = null;

  // Function to handle card click
  function openModal(card) {
    selectedCard = card;
    showModal = true;
  }

  // Function to close modal
  function closeModal() {
    showModal = false;
    selectedCard = null;
  }
  
</script>

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
  }

  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    max-width: 600px;
    width: 100%;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    position: relative;
  }

  .modal-header {
    font-size: 1.5em;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .modal-body {
    margin-bottom: 20px;
  }

  .modal-close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 1.5em;
    cursor: pointer;
  }

  /* To handle responsiveness */
  @media (max-width: 768px) {
    .kanban-board {
      flex-direction: column;
      align-items: center;
    }
  }
</style>

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
      <div class="CreateAppBtn" on:click={() => (showModal = true)} >+ Create Plan</div> 
    </div>
  </div>
</div>

<div class="kanban-board">
  <!-- Backlog Column -->
  <div class="kanban-column">
    <h3>Backlog</h3>
    {#each kanbanBoard.backlog as card (card.id)}
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

<!-- Modal for displaying card details -->
{#if showModal}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal" on:click={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <button class="modal-close-btn" on:click={closeModal}>&times;</button>
      <div class="modal-header">{selectedCard.title}</div>
      <div class="modal-body">{selectedCard.description}</div>
    </div>
  </div>
{/if}