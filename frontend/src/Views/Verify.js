import React, { Component } from 'react';
import {getCharge, updateCharge} from '../helpers/backend'
import Loader from '../Components/Loader'
import ConfirmDialog from '../Components/ConfirmDialog'

class Verify extends Component {

  state = {
    isLoading: false,
    action : true,
    ConfirmDialog: false,
    charge: {
      id: false,
      message: "Charge Not Found",
      status: 0,
      comment: "",
      images: []
    },
  }

  async componentDidMount(){
    this.setState({isLoading: true})
    const charge = await getCharge(this.props.match.params.id);
    this.setState({isLoading: false, charge: charge})
  }

  submitCharge = async () => {
    this.setState({isLoading: true, ConfirmDialog:false})
    // let data = {
    //   id: this.state.charge.id,
    //   status: this.state.action ? 2 : 1,
    //   comment: this.state.charge.comment ? this.state.charge.comment : "" ,
    //   images: this.state.images,
    // }

    var form = new FormData()
    form.append('id', this.state.charge.id )
    form.append('status', this.state.action ? 2 : 1 )
    form.append('comment', this.state.charge.comment ? this.state.charge.comment : ""  )
    // form.append('images',  this.state.images  )
    if(this.state.images){
      Array.from(this.state.images).forEach(image => {
        form.append("images", image);
      });
    }
    

    await updateCharge(form);
    const charge = await getCharge(this.state.charge.id);
    this.setState({isLoading: false, charge: charge})
  }

  fileSelectedHandler = (e) => {
    this.setState({ images: e.target.files })
  }

  render() {
    return (
        this.state.isLoading ? 
          <Loader/>
        :
        <div class="flex h-screen">
          <div class="m-auto w-full max-w-lg">
            <div role="alert">
              <div class="bg-blue-500 text-white font-bold rounded-t px-4 py-2">
                Bank's Message
              </div>
              <div class="border border-t-0 border-blue-400 rounded-b bg-blue-100 px-4 py-3 text-blue-700">
                <p>{this.state.charge.message}</p>
              </div>
            </div>
            { this.state.charge.status ? 
              <div class="bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md" role="alert">
                <div class="mt-3 text-center">
                  <div
                    class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100"
                  >
                    <svg
                      class="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <h3 class="text-lg leading-6 font-medium text-gray-900">Successful!</h3>
                  <div class="mt-2 px-7 py-3">
                    <p class="text-sm text-gray-500">
                      Response has been saved.
                    </p>
                  </div>
                </div>
              </div>
            :
            <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <ConfirmDialog
                body = {this.state.action ? "I recognize this charge!" : "I don't recognize this charge!"}
                show = {this.state.ConfirmDialog}
                confirm = { () => this.submitCharge() }
                cancel = { () => {this.setState({ConfirmDialog:false})} }
              />
              {/* <div class="mb-4">
                <div class="form-check">
                  <input 
                    class="form-check-input appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer" 
                    type="checkbox" 
                    checked={this.state.action} 
                    onClick={() => this.setState({action: true})}
                  ></input>
                  <label onClick={() => this.setState({action: true})} class="form-check-label inline-block text-gray-800" for="flexCheckDefault">
                    I recognize this charge!
                  </label>
                </div>
                <div class="form-check">
                  <input 
                    class="form-check-input appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer" 
                    type="checkbox" 
                    checked={!this.state.action} 
                    onClick={() => this.setState({action: false})} 
                  />
                  <label onClick={() => this.setState({action: false})} class="form-check-label inline-block text-gray-800" for="flexCheckDefault">
                    I don't recognize this charge!
                  </label>
                </div>
              </div> */}
              <div class="mb-6">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                  Attachments
                </label>
                <input type="file" accept="image/*" onChange={this.fileSelectedHandler} name="images[]" multiple class="h-full w-full" />
              </div>
              <div class="mb-6">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                  Comment
                </label>
                <textarea
                  class="
                    form-control
                    block
                    w-full
                    px-3
                    py-1.5
                    text-base
                    font-normal
                    text-gray-700
                    bg-white bg-clip-padding
                    border border-solid border-gray-300
                    rounded
                    transition
                    ease-in-out
                    m-0
                    focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
                  "
                  id="exampleFormControlTextarea1"
                  rows="3"
                  placeholder="Add a Comment"
                  onChange = {e =>  {
                    let {charge} = this.state
                    charge.comment = e.target.value
                    this.setState({charge}) 
                  }}
                  value = {  this.state.charge.comment  }
                ></textarea>
                {/* <p class="text-red-500 text-xs italic">Please choose a password.</p> */}
              </div>
              <div class="flex items-center justify-between">
                <button onClick={() => this.setState({action: true, ConfirmDialog:true} , () => console.log(this.state) )} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                  Mark as Recognized
                </button>

                <button onClick={() => this.setState({action: false, ConfirmDialog:true} , () => console.log(this.state)  )} class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                  Mark as Not Recognized
                </button>
              </div>
            </form>
            }
          </div>
        </div>
    );
  }
}

export default Verify;