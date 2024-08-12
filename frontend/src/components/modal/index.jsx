import React,{useState} from "react"
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './style.css'

function Modal(props){


    return(
        <div>
            <button type="button" onClick={()=>props.handleOpen()} className="btn btn-primary" data-toggle="modal" data-target="#exampleModal" data-whatever="@mdo">Add task</button>

           {props.modals && (
               <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">New Task</h5>
                                <button type="button" id='dater' className="close" onClick={()=>props.handleClose()} aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={(event)=>props.handleSubmit(event)}>
                                    <div className="form-group">
                                        <label htmlFor="task" className="col-form-label">Task Name</label>
                                        <input onChange={(event)=>props.handleTask(event)} name="task" type="text" className="form-control" id="task" required/>
                                    </div>
                                    <div className="form-group">
                                        <label>Select Date</label><br/>
                                        <DatePicker
                                            id="dater"
                                            selected={props.date}
                                            onChange={(event)=>props.handleChange(event)}
                                            showTimeSelect
                                            dateFormat="Pp"
                                            className="form-control"
                                        />
                                    </div>
                                    <button className="btn btn-danger" type="submit">Submit</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
           )}
        </div>
    )
}

export default Modal