import React, { Component } from 'react';

class ConfirmDialog extends Component {
  render() {
    return (
      this.props.show ? 
        <div
          class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
          id="my-modal"
        >
          <div class="flex h-screen">
            <div class="m-auto relative p-5 border w-96 shadow-lg rounded-md bg-white"> 
              <div class="mt-3 text-center">
                <div
                  class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100"
                > 
                  <svg fill="none" viewBox="0 0 24 24" class="w-8 h-8 text-green-600" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">Confirmation!</h3>
                <div class="mt-2 px-7 py-3">
                  <p class="text-sm text-gray-500">
                    {this.props.body}
                  </p>
                </div>
                <div class="items-center px-4 py-3">
                  <button
                    onClick={ this.props.confirm }
                    class="px-4 mr-2 py-2 bg-green-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={ this.props.cancel }
                    class="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      :
        <></>
      
    );
  }
}

export default ConfirmDialog;
