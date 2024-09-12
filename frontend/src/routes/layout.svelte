
 <main>
  <nav class="NavContainer">
    <div class="NavContentLeft"><slot name="NavContentLeft" /></div>
    <div class="NavContentCenter"><slot name="NavContentCenter" /></div>
    <div class="NavContentRight"><slot name="NavContentRight" /></div>
  </nav>

  <!-- Default slot for the main content -->
  <slot></slot>
</main>

<style>
.NavContainer {
    background-color: black;
    color: white;
    height: 80px;
    display: flex; /* Make the container a flexbox */
    justify-content: space-between; /* Space out the items to left, center, and right */
    align-items: center; /* Vertically center the items */
    font-size: large;
    width: 100%; /* Ensure the container takes the full width */
}

.NavContentLeft {
    flex: 1; /* Make it flexible */
    text-align: left; /* Align the content to the left */
    padding-left: 150px;
}

.NavContentCenter {
    flex: 1; /* Center element takes up equal space */
    text-align: center; /* Center content horizontally */
}

.NavContentRight {
    flex: 1; /* Make it flexible */
    text-align: right; /* Align the content to the right */
    padding-right: 150px;
}

</style>