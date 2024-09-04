<script>
    import {goto} from '$app/navigation'
    import axios from 'axios'

 
    let username ='';
    let password ='';
    let email = '';
    const ApiUrl = import.meta.env.VITE_API_URL+':'+import.meta.env.VITE_PORT+'/api';


    const login = async() =>{
        console.log("login")
        try {
          console.log(ApiUrl)
          
          const response = await axios.post(ApiUrl+'/login', {
            email: email,
            password: password,
            username: username,
          }, {
          withCredentials: true})

          const { token, user } = response.data;

          console.log('Token:', token);
          console.log('User:', user);
          goto('/dashboard')

        } catch (error) {
          console.error('Login failed:', error.message);
        }

        
    }

</script>


<div class="loginFormContainer">
    <div>
    <h1>Login Page</h1>
    <form class="loginForm" on:submit|preventDefault={login}>
      <label>Username:
        <input type="text" bind:value={username}/> <br> 
      </label>

      <label>Password:
        <input type="password" bind:value={password}/> <br>
      </label>
      
      <label>Email:
        <input type="Email" bind:value={email} />
      </label>

        <button class="loginSubmitBtn" type="submit"> Submit </button>
        
    </form>
    </div>
</div>


<style>

/* Center the form elements inside the form */
.loginFormContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  margin-top: 10%;
}

.loginFormContainer h1{
  text-align: center;
  margin-bottom: 30px;
}


.loginForm input {
  margin-bottom: 20px;
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
  /* margin-left: auto;
  margin-right: auto; */
}

.loginFormContainer > div {
  justify-content: center;
  padding: 20px;
  background-color: white; /* Background for the form */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  border-radius: 8px; /* Rounded corners */
  width: 450px; /* Fixed width for the form */
}



/* CSS */
.loginSubmitBtn {
  appearance: button;
  backface-visibility: hidden;
  background-color: #405cf5;
  border-radius: 6px;
  border-width: 0;
  box-shadow: rgba(50, 50, 93, .1) 0 0 0 1px inset,rgba(50, 50, 93, .1) 0 2px 5px 0,rgba(0, 0, 0, .07) 0 1px 1px 0;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  font-family: -apple-system,system-ui,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif;
  font-size: 100%;
  height: 44px;
  line-height: 1.15;
  margin: 12px 0 0;
  outline: none;
  overflow: hidden;
  padding: 0 25px;
  position: relative;
  text-align: center;
  text-transform: none;
  transform: translateZ(0);
  transition: all .2s,box-shadow .08s ease-in;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  width: 30%;
  float: right;
  margin-top: 30px;
}

.loginSubmitBtn:disabled {
  cursor: default;
}

.loginSubmitBtn:focus {
  box-shadow: rgba(50, 50, 93, .1) 0 0 0 1px inset, rgba(50, 50, 93, .2) 0 6px 15px 0, rgba(0, 0, 0, .1) 0 2px 2px 0, rgba(50, 151, 211, .3) 0 0 0 4px;
}

 
</style>

