import React from 'react'
import './style.css'


function Login(){
    const apiURL=import.meta.env.VITE_API_URL
    return(
        <>
            <div class="form-container">
                <h2>Login</h2>
                <form action={`${apiURL}/login`} method="POST">
                    <div className="form-group">
                        <label for="username">Username:</label>
                        <input type="text" id="username" name="username" placeholder="Enter your username" required autocomplete="off"/>
                    </div>
                    <div className="form-group">
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" placeholder="Enter your password" required/>
                    </div>
                    <button id="loginButton"  type="submit">Login</button>
                </form>
                 <br/>
                <p>Don't have an account? signup <a href="/signup">here</a></p>
            </div>
        </>
    )
}

export default Login