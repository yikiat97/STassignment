<script>
	export let showModal; // boolean
  import { handleError, handleNetworkError, handleUnauthorizedError, handleValidationError } from './errorHandler';
  import { toast, Toaster } from 'svelte-sonner';

	let dialog; // HTMLDialogElement

	$: if (dialog && showModal) dialog.showModal();

</script>




<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="ModalContainer" on:click|stopPropagation>
		<slot name="header" />
	
		<slot />

		<!-- svelte-ignore a11y-autofocus -->
		<div class="input-container">
		<slot name="button" />
		<button class="modelCloseBtn" on:click={() => dialog.close()}>CANCEL</button>
		</div>
	</div><Toaster />
</dialog>

<style>
	.ModalContainer{
		text-align: center;
		width: 650px;
		/* height: 180px; */
	}
	dialog {
		/* max-width: 900px; */
		border-radius: 0.2em;
		border: none;
		padding: 0;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.1);
		/* background: transparent */
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	button {
		display: block;
	}

	.modelCloseBtn{
  cursor: pointer;
  padding: 5px 10px;

  border: none;
  color: white;
  background-color: black;
  width: 150px;
  height: 35px;
}

.input-container {
    display: flex;
    align-items: center; /* This centers the items vertically */
    justify-content: center;
    gap: 10px; /* Adds space between the label and the input */
}

.input-container label {
    margin-right: 5px; /* Optional: add more space between the label and the input */
    white-space: nowrap; /* Keeps the label text on one line */
}

.input-container input {
    flex-grow: 1; /* Allows the input to take up any remaining space */
}

</style>
