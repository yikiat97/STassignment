<script>
    import { handleError, handleNetworkError, handleUnauthorizedError, handleValidationError } from '../lib/errorHandler';
  import { toast, Toaster } from 'svelte-sonner';
</script>


<Toaster style="z-index: 12;" />
<slot></slot>