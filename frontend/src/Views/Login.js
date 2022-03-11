import React, { Component } from 'react';

class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      email : '',
      password: ''
    };
  }
  handleInputChange = (event) => {
    const { value, name } = event.target;
    this.setState({
      [name]: value
    });
  }
  onSubmit = (event) => {
    event.preventDefault();
    fetch('/authenticate', {
      method: 'POST',
      body: JSON.stringify(this.state),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (res.status === 200) {
        this.props.history.push('/');
      } else {
        const error = new Error(res.error);
        throw error;
      }
    })
    .catch(err => {
      console.error(err);
      alert('Error logging in please try again');
    });
  
  }


  render() {
    return (
      <div className="flex h-screen">
        <div className="m-auto">
        <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
            </div>
            <form onSubmit={this.onSubmit}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label className="sr-only">Email address</label>
                  <input onChange={this.handleInputChange} id="email-address" name="email" type="email"  required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Email address"/>
                </div>
                <div>
                  <label className="sr-only">Password</label>
                  <input onChange={this.handleInputChange} id="password" name="password" type="password" required 
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Password"/>
                </div>
              </div>
              <div>
                <button
                  type='submit'
                  className="w-full  flex justify-center py-2 px-4  bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
        </div>
      </div>
    );
  }
}

export default Login;