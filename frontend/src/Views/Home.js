import React, { Component } from 'react';
import {getAllCharges} from '../helpers/backend'

import styles from '../css/filters.css' 
import 'jquery/dist/jquery.min.js';
import Loader from '../Components/Loader'
import moment from 'moment'
 
//Datatable Modules
import "datatables.net-dt/js/dataTables.dataTables"
import "datatables.net-dt/css/jquery.dataTables.min.css"
import $ from 'jquery'; 

class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: false,
      data: [],
      filteredData: [],
      managers: [],
      last4s:[],
      manager: false,
      last4: false,
      status: false,
      start_date: false,
      end_date: false,
    };
  }

  handleInputChange = (event) => {
    const { value, name } = event.target;
    this.setState({
      [name]: value
    });
  }

  async componentDidMount() {
    this.setState({isLoading: true})
    $(document).ready(function () {
      $('#dataTable').DataTable();
    });

    const data = await getAllCharges();
    $('#dataTable').DataTable().destroy()
    const managers = [...new Set(data.map(item => item.name))];
    const last4s = [...new Set(data.map(item => item.last4.padStart(4, "0")))];

    this.setState({data, managers, last4s, filteredData: data, isLoading: false}, () => {
      $('#dataTable').DataTable({
        ordering:  false,
        "aLengthMenu": [[25, 50, 75, -1], [25, 50, 75, "All"]],
        "iDisplayLength": 25
      });
    });
  }

  filterData = () => {
    let { manager, last4, start_date, end_date, status, data } = this.state
    let filteredData = data
    $('#dataTable').DataTable().destroy()
    if( manager ){
      filteredData = filteredData.filter(x => x.name == manager );
    }
    if( last4 ){
      filteredData = filteredData.filter(x => parseInt(x.last4) == parseInt(last4) );
    }
    if( status ){
      if( status == 3 ){
        filteredData = filteredData.filter(x => x.status == 1 || x.status == 2 );
      }else{
        filteredData = filteredData.filter(x => x.status == status );
      }
    }
    if( start_date ){
      filteredData = filteredData.filter(x => x.created_at > start_date );
    }
    
    if( end_date ){
      var end_dateCheck = new Date(end_date);
      end_dateCheck.setDate(end_dateCheck.getDate() + 1);
      end_dateCheck.setHours(0,0,0,0);
      filteredData = filteredData.filter(x => new Date(x.created_at) < end_dateCheck );
    }


    this.setState({filteredData}, () => {
      $('#dataTable').DataTable({
        ordering:  false,
        "aLengthMenu": [[25, 50, 75, -1], [25, 50, 75, "All"]],
        "iDisplayLength": 25
      });
    })
  }

  render() {
    return (
      this.state.isLoading ? 
        <Loader/>
      :
        <div>
          <div class="" role="alert">
            {/* <svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"/></svg>
            <p>BankSMS is working alrigh!</p> */}
            <div>
              <h2 className="bg-blue-500 text-white text-sm font-bold px-4 py-3 text-center text-3xl font-extrabold text-gray-900">Recorded Data</h2>
            </div>
            <div id="settings">
              <table class="table-auto" >
                <tr>
                  <th colspan="3">Filters</th>
                </tr>
                <tr >
                  <td colspan="1" >
                    <div>
                      <label>Start Date</label>
                    </div>
                    <div>
                      <input onChange={this.handleInputChange} type="date" name="start_date"/>
                    </div>
                  </td>
                  
                  <td colspan="1" >
                    <div>
                      <label>End Date</label>
                    </div>
                    <div>
                      <input onChange={this.handleInputChange} type="date" name="end_date"/>
                    </div>
                  </td>
                  
                  <td colspan="1" >
                    <div>
                      <label>Status</label> 
                    </div>
                    <div>
                      <select onChange={this.handleInputChange} name='status'>
                        <option value="">All</option>
                        <option value={0}>Not Responded</option>
                        <option value={3}>Responded</option>
                        <option value={2}>Recognized</option>
                        <option value={1}>Not Recognized</option>
                      </select>
                    </div>
                  </td>

                </tr>
                <tr>
                  
                  <td colspan="1">
                    <div>
                      <label>Manager</label> 
                    </div>
                    <div>
                      <select onChange={this.handleInputChange} name='manager'>
                        <option value="">All</option>
                        {this.state.managers.map( (item) => {
                          return <option value={item}>{item}</option>
                        } )}
                      </select>
                    </div>
                  </td>

                  <td colspan="1">
                    <div>
                      <label>Last4</label> 
                    </div>
                    <div>
                      <select onChange={this.handleInputChange} name='last4'>
                        <option value=''>All</option>
                        {this.state.last4s.map( (item) => {
                          return <option value={item}>{item}</option>
                        } )}
                      </select>
                    </div>
                  </td>

                  <td colspan="1">
                    <button
                      onClick={ this.filterData }
                      class="px-4 mr-2 py-2 bg-green-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                    >
                      Apply Filter
                    </button>
                  </td>
                </tr>
              </table>
            </div>
            <div className='mt-5 w-full'>
              <table id="dataTable" class="table table-hover table-bordered cell-border">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Manager</th>
                    <th>Last4</th>
                    <th>Message</th>
                    <th>Comment</th>
                    <th>Attachments</th>
                  </tr>
                </thead>
                <tbody>
                {this.state.filteredData.map((result) => {
                  let status = "Not Responded"
                  if( result.status == 1 ){
                  status = "Not Recognized"

                  }
                  if( result.status == 2 ){
                    status = "Recognized"
                  }
                  return (
                      <tr>
                        <td>
                          {new Date(result.created_at)?.toDateString()}
                          </td>
                        <td>{status}</td>
                        <td>{result.name}</td>
                        <td>{result.last4.padStart(4, "0")}</td>
                        <td>{result.message}</td>
                        <td>{result.comment}</td>
                        <td>
                          {
                            result.files?.split("&*&")?.map( ele => { return <>
                              <a target={"_blank"} href={`https://banksms.blob.core.windows.net/images/${ele}`} rel="noreferrer">{ele}</a><br/>
                            </> })
                          }
                        </td>
                      </tr>
                    
                  )
                })}
                  
                  
                </tbody>
              </table>

            </div>


          </div>
        </div>
    );
  }
}

export default Home;