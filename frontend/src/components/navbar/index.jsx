import React from 'react'

function Navbar(props){
    const apiURL=import.meta.env.VITE_API_URL
    return(
        <div>
            <div className='container'>
                <ul className="nav nav-pills nav-fill bg-light">
                    <li className="nav-item">
                        {props.name?(<a className="nav-link active" href="#">{props.name}</a>):(<a className="nav-link active" href="#">User</a>)}
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#"></a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#"></a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#"></a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#"></a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#"></a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#"></a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#"></a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#"></a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#"></a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#"></a>
                    </li>
                    <li className="nav-item">
                        <form action={`${apiURL}/logout?_method=DELETE`}  method="POST">
                            <button type="submit">Log out</button>
                        </form>
                    </li>
                </ul>
            </div>
        </div>
    )
}export default Navbar