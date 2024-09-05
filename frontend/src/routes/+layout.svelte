<script>
    
</script>

<style>
    @import '../lib/app.css';
    .NavContainer {
        background-color: black;
        color: white;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>

<nav class="NavContainer">
</nav>

<slot></slot> <!-- This will be filled by the main content of child pages -->
