<script>

    import { page } from "$app/stores";
    
    // Reactive statement to update headerName when page.route.id changes
    $: headerName = $page.route.id ? $page.route.id.split('/')[1].toLocaleUpperCase()+" PAGE" : "ERROR PAGE";
</script>

<nav class="NavContainer">
    <div class="headerName">{headerName}</div>
</nav>

<slot></slot>

<style>
    @import '../lib/app.css';
    .NavContainer{
        justify-content: center;
        text-align: center;
        background-color: black;
        color: white;
        height: 50px;
        font-size: 25px
    }

    .headerName{
        padding-top: 13px;
    }
    
</style>