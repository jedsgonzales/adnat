import React from "react";
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, FormFeedback, CustomInput, Card, CardHeader, CardBody, CardFooter, Spinner } from "reactstrap";
import axios, { AxiosResponse, AxiosError } from "axios";
import { Link, Redirect } from "react-router-dom";
import { AdnatState, Organization, Shift, User } from "../types";
import { connect } from "react-redux";
import { AuthState } from "../types/auth-types";
import { authByToken, logoutUser } from "../actions/auth-actions";
import ReactTable from 'react-table';
import moment from "moment";
import { WithContext as ReactTags } from 'react-tag-input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrash, faEdit, faBan } from '@fortawesome/free-solid-svg-icons';
import { stat } from "fs";
import { number } from "prop-types";

interface ShiftWorkSpaceData {
  shift:Shift;
  original:Shift;
  breaks: Array<{ id:string, text:string }>
  editing?: boolean;
}

interface ShiftWorkSpace {
  [key:number] : ShiftWorkSpaceData;
}

interface IDashboardProps {
  auth: AuthState;
  logoutUser:Function;
  authByToken:Function;
}

interface IDashboardState {
  organization:Organization;
  workSpace: ShiftWorkSpace;
  users: {
    [id:number]: User;
  }
  user: User | null;
  date_range: { from:string, to:string }
  order: Array<number>;
  loading: boolean;
}

const KeyCodes = {
  COMMA: 188,
  ENTER: 13,
  TAB: 9,
  SPACE: 32,
};
 
const delimiters = [KeyCodes.COMMA, KeyCodes.ENTER, KeyCodes.SPACE, KeyCodes.TAB];
const now = moment(moment.now());

class Dashboard extends React.Component <IDashboardProps, IDashboardState> {

  constructor(props) {
    super(props);
    this.state = { 
      organization: null,
      workSpace: [],
      users: {},
      user: null,
      date_range: {
        from: moment(moment.now()).subtract(30, "days").format("YYYY-MM-DD"),
        to: moment(moment.now()).format("YYYY-MM-DD")
      },
      order: [],
      loading: false
    }
  }
  
  componentDidMount(){
    if(this.props.auth.user.organizations.length > 0){
      this.loadOrganizationShifts(this.props.auth.user.organizations[0]);
    }
  }

  preventSubmit = (e:React.FormEvent) => {
    e.preventDefault();
  }

  loadOrganizationShifts = async (organization:Organization) => {
    this.setState({ organization: organization, loading: true});

    try {
      return await axios({
      method: 'GET',
      url: `/api/organizations/${organization.id}/shifts`,
      headers: { 
        'Content-Type':     'application/json',
        'Authorization':    `${this.props.auth.token}`
          }
      }).then( (resp: AxiosResponse) => {
        let workSpace:ShiftWorkSpace = {};
        let order:Array<number> = [0];

        const emptyShift:Shift = {
          id: 0,
          shift_date: now.format("YYYY-MM-DD"),
          start_time_val: now.subtract(2, 'hours').format("HH:mm"),
          end_time_val: now.format("HH:mm"),
          breaks: [],
          total_worked: 0,
          total_breaks: 0,
          shift_cost: 0
        }

        workSpace[0] = {
          shift: { ...emptyShift },
          original: { ...emptyShift },
          breaks: [],
          editing: true
         };

        let users:{ [id:number]: User } = {};

        resp.data.forEach((shiftInfo:Shift) => {
          if(users[shiftInfo.user.id] === undefined) {
            users[shiftInfo.user.id] = shiftInfo.user;
          }

          order.push(shiftInfo.id);

          workSpace[shiftInfo.id] = { shift: { ...shiftInfo }, 
            original: { ...shiftInfo }, editing: false, 
            breaks: shiftInfo.breaks.map(b => ({ id: b.toString(), text: b.toString() })) 
          }
        });

        this.setState({workSpace: workSpace, users: users, order: order, loading: false});

      }).catch( (error:AxiosError) => {
        setTimeout( () => this.loadOrganizationShifts(organization), 2000 );
      });
    } catch(error) {
      setTimeout( () => this.loadOrganizationShifts(organization), 2000 );
    }
  }

  deleteShift = async (keyId:number) => {
    this.setState({...this.state, loading: true});

    const { organization } = this.state;

    let shift:Shift = this.state.workSpace[keyId].shift;

    shift.breaks = this.state.workSpace[keyId].breaks.map( b => ( parseInt(b.id) ))

    try {
      return await axios({
        method: 'DELETE',
        url: `/api/shifts/${keyId}`,
        headers: { 
          'Content-Type':   'application/json',
          'Authorization':  `${this.props.auth.token}`  
        }
      }).then( (resp: AxiosResponse) => {
        //new entry, reload
        this.loadOrganizationShifts(this.state.organization);
        
      }).catch( (error:AxiosError) => {
        if(error.response.data.message){
          alert(error.response.data.message);
        } else {
          alert('Server error. Try again later.');
        }

        this.setState({ loading: false });
      });

    } catch(error) {
      alert('Handling error!');
      this.setState({ loading: false });
    }
  }

  saveShift = async (keyId:number) => {
    this.setState({...this.state, loading: true});

    const { organization } = this.state;
    const workSpaceData:ShiftWorkSpaceData = this.state.workSpace[keyId];

    let shift:Shift = this.state.workSpace[keyId].shift;

    shift.breaks = this.state.workSpace[keyId].breaks.map( b => ( parseInt(b.id) ))

    try {
      return await axios({
        method: keyId === 0 ? 'post' : 'patch',
        url: keyId === 0 ? `/api/users/${this.props.auth.user.id}/organizations/${organization.id}/shifts` 
          : `/api/users/${workSpaceData.shift.user.id}/organizations/${organization.id}/shifts/${keyId}`,
        data: shift,
        headers: { 
          'Content-Type':   'application/json',
          'Authorization':  `${this.props.auth.token}`  
        }
      }).then( (resp: AxiosResponse) => {
        this.loadOrganizationShifts(this.state.organization);
        
      }).catch( (error:AxiosError) => {
        if(error.response.data.message){
          alert(error.response.data.message);
        } else {
          alert('Server error. Try again later.');
        }

        this.setState({ loading: false });
      });

    } catch(error) {
      alert('Handling error!');
      this.setState({ loading: false });
    }
        
  }

  loading = () => (
    <div className="animated fadeIn pt-1 text-center">
      <Spinner style={{ width: '3rem', height: '3rem' }} type="grow" />
    </div>)

  renderUser = (cellInfo) => {
    const shift:Shift = cellInfo.original.shift;

    if(shift.id === 0){
      return <div className="form-control">--</div>
    } else {
      return <div className="form-control">{shift.user.name}</div>
    }
  }

  renderShiftDate = (cellInfo) => {
    const shift:Shift = cellInfo.original.shift;

    if(cellInfo.original.editing){
      return <Input type="date"
        onChange={(e) => {
          const { workSpace } = this.state;

          this.setState({
            workSpace: { ...workSpace,
              [shift.id]: {
                ...workSpace[shift.id],
                shift: {
                  ...workSpace[shift.id].shift,
                  shift_date: e.target.value
                }
              } 
            }
          });
        }}
        value={shift.shift_date} />
    } else {
      return <div className="form-control">{shift.shift_date}</div>
    }
  }

  renderTimeCol = (cellInfo) => {
    const shift:Shift = cellInfo.original.shift;

    if(cellInfo.original.editing){
      return <Input type="time"
        onChange={(e) => {
          const { workSpace } = this.state;

          this.setState({
            workSpace: { ...workSpace,
              [shift.id]: {
                ...workSpace[shift.id],
                shift: {
                  ...workSpace[shift.id].shift,
                  [cellInfo.column.id]: e.target.value
                }
              } 
            }
          });
        }}
        value={shift[cellInfo.column.id]} />
    } else {
      return <div className="form-control">{shift[cellInfo.column.id]}</div>
    }
  }

  renderReadOnlyCol = (cellInfo) => {
    const shift:Shift = cellInfo.original.shift;

    if(cellInfo.original.editing){
      return <div className="form-control">--</div>
    } else {
      return <div className="form-control">{shift[cellInfo.column.id]}</div>
    }
  }

  renderTimeInHours = (cellInfo) => {
    const shift:Shift = cellInfo.original.shift;

    if(cellInfo.original.editing){
      return <div className="form-control">--</div>
    } else {
      return <div className="form-control">{shift[cellInfo.column.id] / 60}</div>
    }
  }
  
  renderBreaks = (cellInfo) => {
    const shift:Shift = cellInfo.original.shift;

    if(cellInfo.original.editing){
      return <ReactTags 
              inputFieldPosition="bottom"
              classNames={{
                tagInputField: 'form-control',
                tag: 'btn btn-primary'
              }}
              placeholder="Add Minutes"
              tags={cellInfo.original.breaks}
              suggestions={[]}
              delimiters={delimiters}
              handleDelete={(i:number) => {
                const { workSpace } = this.state;

                let newBreaks:Array<{id:string, text:string}> = cellInfo.original.breaks.filter((tag:{id:string, text:string}, index:number) => index !== i);

                this.setState({
                  workSpace: { ...workSpace,
                    [shift.id]: {
                      ...workSpace[shift.id],
                      shift: {
                        ...workSpace[shift.id].shift,
                        breaks: newBreaks.map( b => parseInt(b.id) )
                      },
                      breaks: newBreaks
                    } 
                  }
                });
              }}
              handleAddition={(tag:{id:string, text:string}) => {
                const { workSpace } = this.state;

                let parsedValue:number = parseInt(tag.text);
                if(!isNaN(parsedValue) && parsedValue > 0){
                  let newBreaks:Array<{id:string, text:string}> = [ { id: parsedValue.toString(), text: parsedValue.toString() }, ...cellInfo.original.breaks ];

                  this.setState({
                    workSpace: { ...workSpace,
                      [shift.id]: {
                        ...workSpace[shift.id],
                        shift: {
                          ...workSpace[shift.id].shift,
                          breaks: newBreaks.map( b => parseInt(b.id) )
                        },
                        breaks: newBreaks
                      } 
                    }
                  });
                }
              }}  />
    } else {
      return <div className="form-control">{shift.breaks.join(', ')}</div>
    }
  }

  renderCancelBtn = (shift:Shift) => {
    if(shift.id !== 0){
      return <Button color="info" onClick={(e) => {
        //revert to original
        let workSpaceData:ShiftWorkSpaceData = { ...this.state.workSpace[shift.id] };

        workSpaceData.shift = { ...workSpaceData.original };
        workSpaceData.breaks = workSpaceData.shift.breaks.map(b => ({ id: b.toString(), text: b.toString() }));
        workSpaceData.editing = false

        this.setState({ workSpace: { ...this.state.workSpace, [shift.id]: workSpaceData } });
      }}><FontAwesomeIcon icon={faBan} /></Button>
    } else {
      return ''
    }
  }

  renderTrashBtn = (shift:Shift) => {
    if(shift.id !== 0){
      return <Button color="danger" onClick={(e) => {
        this.deleteShift(shift.id);
      }}><FontAwesomeIcon icon={faTrash} /></Button>
    } else {
      return ''
    }
  }

  renderActionCell = (cellInfo) => {
    const shift:Shift = cellInfo.original.shift;
    if(cellInfo.original.editing){
      return (<div><Button color="info" onClick={(e) => {
          //create
          this.saveShift(shift.id);
        }}><FontAwesomeIcon icon={faSave} /></Button>
        { this.renderCancelBtn(shift) }
      </div>)
      
    } else {
      return (<div>
        <Button color="primary" onClick={(e) => {
          const { workSpace } = this.state;

          this.setState({
            workSpace: { ...workSpace,
              [shift.id]: {
                ...workSpace[shift.id],
                editing: true
              } 
            }
          });
        }}><FontAwesomeIcon icon={faEdit} /></Button>
        {this.renderTrashBtn(shift)}
      </div>)
    }
  }

  renderTable = () => {
    const columns = [
      {
        Header: () => <strong>Name</strong>,
        accessor: 'user.name',
        sortable: false,
        Cell: this.renderUser,
        minWidth: 150
      },
      {
        Header: () => <strong>Shift Date</strong>,
        sortable: false,
        accessor: 'shift_date',
        Cell: this.renderShiftDate,
        maxWidth: 200
      },
      {
        Header: () => <strong>Start Time</strong>,
        sortable: false,
        accessor: 'start_time_val',
        Cell: this.renderTimeCol,
        maxWidth: 200
      },
      {
        Header: () => <strong>End Time</strong>,
        sortable: false,
        accessor: 'end_time_val',
        Cell: this.renderTimeCol,
        maxWidth: 200
      },
      {
        Header: () => <strong>Breaks (in minutes)</strong>,
        sortable: false,
        accessor: 'breaks',
        Cell: this.renderBreaks,
        minWidth: 200
      },
      {
        Header: () => <strong>Hours Worked</strong>,
        sortable: false,
        accessor: 'total_worked',
        Cell: this.renderTimeInHours,
        maxWidth: 120
      },
      {
        Header: () => <strong>Shift Cost</strong>,
        sortable: false,
        accessor: 'shift_cost',
        Cell: this.renderReadOnlyCol,
        maxWidth: 100
      },
      {
        Header: () => <strong>Action</strong>,
        sortable: false,
        Cell: this.renderActionCell,
        maxWidth: 100
      }
    ]

    const { workSpace } = this.state;

    let data = [];

    this.state.order.forEach( (id:number) => {
      const d:ShiftWorkSpaceData = workSpace[id];
      
      if(d.shift.shift_date >= this.state.date_range.from && d.shift.shift_date <= this.state.date_range.to){
        data.push(d);
      }
    });

    if(this.state.user !== null){
      data = data.filter((d:ShiftWorkSpaceData) => (d.shift.id == 0 || d.shift.user.id === this.state.user.id) );
    }
    
    return (
      <Container fluid>
        <Row>
          <Col md={1}></Col>
          <Col md={10}>
            <h1>Adnat System: {this.state.organization === null ? 'Organization' : this.state.organization.name} Shifts</h1>
            <Card>
              <CardHeader>
                <Row>
                  <Col md={6}>
                    Logged In As {this.props.auth.user.name}
                  </Col>
                  <Col md={6} style={{
                    textAlign: 'right'
                  }}>
                    <Button onClick={(e) => {
                      this.props.logoutUser();
                    }}>Logout</Button>
                  </Col>
                </Row>
                <Row style={{
                  textAlign: "right"
                }}>
                  <Col md={6}>
                  <Form inline onSubmit={e => {
                    e.preventDefault();
                  }}>
                    <FormGroup>
                      <Label for="orgSelect">Select Organization</Label>{' '}{' '}
                      <Input type="select" id="orgSelect" value={this.state.organization !== null ? this.state.organization.id : '0'} onChange={(e) => {

                        for(let i:number = 0; i < this.props.auth.user.organizations.length; i++){
                          if(this.props.auth.user.organizations[i].id.toString() === e.target.value){

                            this.setState({ organization: this.props.auth.user.organizations[i] });

                            if(this.state.organization.id !== this.props.auth.user.organizations[i].id){
                              this.loadOrganizationShifts( this.props.auth.user.organizations[i] );
                            }
                            break;
                          }
                        }
                      }}>
                        {this.props.auth.user.organizations.map( (org:Organization) =>
                          <option key={"organization-" + org.id } value={org.id}>{org.name}</option>
                        )}
                      </Input>{' '}
                      <Link to="/organization-list" className="btn btn-primary">Add Or Join Organization</Link>
                    </FormGroup>

                  </Form>
                  </Col>
                  <Col md={6}>
                  <Form inline onSubmit={e => {
                    e.preventDefault();
                  }}>
                    <FormGroup>
                      <Input type="select" id="userSelect" value={this.state.user !== null ? this.state.user.id : '0'} onChange={(e) => {

                        if(e.target.value === "0"){
                          this.setState({user: null});
                        } else {
                          this.setState({user: this.state.users[e.target.value]});
                        }
                        
                      }}>
                        <option key="user-0" value="0">Filter By User</option>
                        {Object.values(this.state.users).map( (user:User) =>
                          <option key={"user-" + user.id } value={user.id}>{user.name}</option>
                        )}
                      </Input>
                    </FormGroup>
                    <FormGroup>
                      <Label>&nbsp;&nbsp;&nbsp;&nbsp;</Label>{' '}{' '}
                      <Input type="date" value={this.state.date_range.from} placeholder="Start Date" onChange={(e) => {
                        this.setState({ date_range: { ...this.state.date_range, from: e.target.value } });
                      }} />
                      <Label for="orgSelect">To</Label>{' '}{' '}
                      <Input type="date" value={this.state.date_range.to} placeholder="Start Date" onChange={(e) => {
                        this.setState({ date_range: { ...this.state.date_range, to: e.target.value } });
                      }} />
                    </FormGroup>
                  </Form>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <ReactTable
                  columns={columns} 
                  data={ data }
                  pageSize={data.length + 1}
                  showPagination={false}
                  resolveData={data => data.map(row => row)} />
              </CardBody>
              <CardFooter>
              </CardFooter>
            </Card>
          </Col>
          <Col md={1}></Col>
        </Row>
      </Container>
      
    );
  }

  render(){
    if(this.props.auth.user.organizations.length > 0){
      if(this.state.loading){
        return this.loading();
      } else {
        return this.renderTable();
      }
    } else {
      return <Redirect to="/organization-list" />
    }
  }
}

const mapStateToProps = (state:AdnatState) => ({
  auth: state.auth
})

export default connect(
  mapStateToProps, 
  { logoutUser,
    authByToken })(Dashboard);