<script>
  import { goto } from '$app/navigation';

  function navigateToAbout() {
    goto('/builder'); // Navigates to the /about page
  }
</script>

<button on:click={navigateToAbout}>Go to About Page</button>