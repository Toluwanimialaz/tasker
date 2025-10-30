import axios from "axios";
import {Store,persistor} from '../../store/store'
import { BASEURL,RENEW_TOKEN } from "../config/urlConfig";



export const RenewAccessToken=async()=>{
    let refreshToken = Store?.getState()?.auth?.refreshToken;

    if(refreshToken){
        const payload={
            token:refreshToken
        }
        try{
            const response=await axios.post(BASEURL+RENEW_TOKEN,payload);
            const responseData=response.data;
            console.log(responseData)
            if(response.data){
                let access_token=response?.data?.data?.accessToken;
                let accesToken_expiry=response.data?.data?.accessExpiry;
                return{
                    accessToken:access_token,
                    accessExpiry:accesToken_expiry
                }
            }
        }catch(error){
            persistor.pause();
            persistor.flush().then(() => {
              return persistor.purge();
            });
            location.reload();
        }
    }
    


}