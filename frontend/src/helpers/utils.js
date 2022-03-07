// import { BASE_URL } from '../constants/defaultValues';
import axios from "axios"

export async function apiCall(
    type = "GET", 
    appendUrl, 
    data = {}
  ){
    const BASE_URL= "/"
  
    let reqHeaders = {}

    try{
      
      switch(type){
        case "GET":
            return await axios.get( BASE_URL + appendUrl, {headers: reqHeaders })
            break;
        case "DELETE":
            return await axios.delete( BASE_URL + appendUrl, {headers: reqHeaders }, data)
            break;
        case "POST":
            return await axios.post( BASE_URL + appendUrl, data, {headers: reqHeaders } )
            break;
        case "PUT":
          return await axios.put( BASE_URL + appendUrl, data, {headers: reqHeaders } )
          break;
        default:
            console.log("apiCallError this type not handled here", type);
      }

    }catch(error){
      console.error("apiCall Failed", appendUrl, data);
      return false;
    }
  }