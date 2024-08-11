import React from 'react'
import "./style.css"


function Signup(){
    const apiURL=import.meta.env.VITE_API_URL
    return(
        <>
            <div class="form-container">
                <h2>SignUp</h2>
                <form action={`${apiURL}/signup`} method="post">
                    <div className="form-group">
                        <label for="username">Username:</label>
                        <input type="text" id="username" name="username" placeholder="Enter your username" required autocomplete="off"/>
                    </div>
                    <div className="form-group">
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" placeholder="Enter your password" required/>
                    </div>
                    <button id="signupButton" type="submit">Sign Up</button>
                </form>
                 <br/>
                 
                <p>Already have an account? Login <a href="/login">here</a></p>
            </div>
        </>
    )
}

export default Signup