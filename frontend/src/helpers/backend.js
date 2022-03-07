import { apiCall } from "./utils";

export async function getCharge(id){
  let charge = await apiCall("GET", `charge/${id}`)
  if( charge.data.data ){
    return charge.data.data[0]
  }else{
    return false
  }
}

export async function updateCharge(data){
  try{
    await apiCall("POST", `charge`, data)
  }catch(e){
    return false
  }
}