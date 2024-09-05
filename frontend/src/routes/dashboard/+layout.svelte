<script>
    import {goto} from '$app/navigation'

    const navigate = (location) =>{
      goto(location)
    }
 




</script>



<style>
</style>


<div class="dashboardContainer">
    <div>
    <h2>What do you want to do today:</h2>

        <button class="loginSubmitBtn" on:click={() => navigate("/User Management")}> User Management </button>
        <button class="loginSubmitBtn" on:click={() => navigate("/Task Management")}> Task Management </button>
         <slot/>
        
    </div>
   
</div>









