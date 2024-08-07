import React from 'react';
import './style.css'


function GoogleButton(props){
    return(
        <div class="wrap">
            <a href='api/auth/google'>
                <div class="g-sign-in-button">
                    <div class="content-wrapper">
                        <div class="logo-wrapper">
                            <img src="https://developers.google.com/identity/images/g-logo.png"/>
                        </div>
                        <span class="text-container">
                            <span>Sign in with Google</span>
                        </span>
                    </div>
                </div>
            </a>
        </div>
    )
}

export default GoogleButton