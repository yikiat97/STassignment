<script>
    import {goto} from '$app/navigation'

    const navigate = (location) =>{
      goto(location)
    }
</script>

 <button class="loginSubmitBtn" on:click={() => navigate("/User Account Management")}> User Account Management </button>


