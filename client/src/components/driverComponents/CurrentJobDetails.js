import React, { useContext, useEffect, useState } from "react";
import UserProvider from '../../utils/UserContext';
import API from "../../utils/API";
import DriverJobView from "./DriverJobView";
import { format, formatDistanceToNowStrict, add } from "date-fns";

function CurrentJobDetails(props) {

    // Setting up our state
    const [ jobInfo, setJobInfo ] = useState({});
    const [ ready, setReady ] = useState(false);
    const [location, setLocation] = useState({});
    const [ userStart, setUserStart ] = useState("");
    const [ breakTime, setBreakTime ] = useState("");
    const [ latestPing, setLatestPing ] = useState("");
    const [ onJob, setOnJob ] = useState(false);

    // Use Context gets information about the User from the provider
    const userData = useContext(UserProvider.context);

    useEffect(() => {

        // When the page loads we get the user's current location and save it to state
        navigator.geolocation.getCurrentPosition(result => {
            setLocation(result.coords)
        })

        // When the page loads we use the user context to search for the information of their assigned job
        // Once we get the job infomation back we save it to save and set the page as ready to load
        const getPageInfo = async (jobId, id) => { 

            const result = await API.getNamefromID(id);
            const userStartTime = result.data[0].startTime;
            const userPingTime = result.data[0].pingTime;
            await setUserStart(userStartTime);
            await setLatestPing(userPingTime);

            try {
                const userStartTimeInt = await parseInt(userStartTime)
                const valueToSubtract = await add(userStartTimeInt, { hours: 6 })
                let goodDate = await format(valueToSubtract, "T")
                const goodDateInt = parseInt(goodDate)
                await setBreakTime(goodDateInt);
                await console.log(formatDistanceToNowStrict(parseInt(breakTime), { addSuffix: true, includeSeconds: true }))
            }
            catch {
                console.log("Loading")
            }
                
            const jobDetails = await API.viewJobByID(jobId);
            await setJobInfo(jobDetails.data[0]);
            await setOnJob(jobDetails.data[0].inProgress)
            await setReady(true);
        }

        // setInterval(getPageInfo, 20000)
        getPageInfo(userData.assignedJob, userData.id)
    }, [userData.assignedJob, userData.id, userStart])

    const pingLocation = async (id, location) => {
        const userLat = location.latitude;
        const userLng = location.longitude;
        await API.pingLocation(id, userLat, userLng)
    }

    // When click the Start Job button, we are setting our location to the database
    const startJobHandler = async (id, location, jobId) => {
        await setOnJob(true);
        const userLat = location.latitude;
        const userLng = location.longitude;
        await API.jobToInProgress(jobId)
        await API.startJob(id, userLat, userLng, jobId)
    }

    const endJobHandler = async (id) => {
        setOnJob(false)
        await API.jobToOutOfProgress(id)
        await API.endJob(id)
    }

    return(
        <React.Fragment>
            <div className="row">
            <button onClick={() => props.handlePageChange("")} className="backBtn">Back</button>
                {(userData.assignedJob === null) ? 
                // if user has no job assigned the code directly underneath is render as a error message
                <div className="row">
                    <div className="col-2"></div>
                    <div className="col-8 tAlert">
                        <h1>You do not currently have an Assigned Job <strong>{userData.firstname}</strong></h1>
                    </div>
                    <div className="col-2"></div>
                </div>
                // If user has a job assigned the code underneath here is rendered
                : (ready)
                    ? <React.Fragment>
                        <div className="col-12 heading">
                            <h1>Controls</h1>
                            <div className="jobBtnBar">
                                {(onJob === true) ? <p></p> : <button className="backBtn jobBtn" onClick={() => startJobHandler(userData.id, location, userData.assignedJob)}>Start Job</button>}
                                <button className="backBtn jobBtn">Take a Break</button>
                                <button className="backBtn jobBtn" onClick={() => pingLocation(userData.id, location)}>Ping Location</button>
                            </div>
                            <div className="row">
                                <div className="col-6 col-sm-6 col-md-4">
                                    <h6>You started Driving:</h6>
                                    {(userData.startTime === null) ? <p>Loading...</p> : <h3>{(formatDistanceToNowStrict(parseInt(userStart), { addSuffix: true, includeSeconds: true }))}</h3>}
                                </div>
                                <div className="col-6 col-sm-6 col-md-4">
                                    <h6>You are due for a Break in :</h6>
                                    {(userData.startTime === null) ? <p>Loading...</p> : <h3>{(formatDistanceToNowStrict(parseInt(breakTime), { addSuffix: true, includeSeconds: true }))}</h3>}
                                </div>
                                <div className="col-12 col-sm-12 col-md-4">
                                    <h6>You last pinged:</h6>
                                    {(userData.startTime === null) ? <p>Loading...</p> : <h3>{(formatDistanceToNowStrict(parseInt(latestPing), { addSuffix: true, includeSeconds: true }))}</h3>}
                                </div>
                            </div>
                        </div>
                        <DriverJobView jobInfo={jobInfo}/>
                        {(onJob === true) ? <button className="backBtn completeBtn" onClick={() => endJobHandler(userData.assignedJob)}>End Job</button> : <p></p>}
                    </React.Fragment>
                    // If the user has a job but hasnt loading the information
                    : <div>Loading</div>
                }
            </div>
        </React.Fragment>

        
    )
}

export default CurrentJobDetails