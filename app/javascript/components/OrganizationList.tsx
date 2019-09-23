import React from "react";
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, FormFeedback, CustomInput, Card, CardHeader, CardBody, CardFooter, Spinner } from "reactstrap";
import axios, { AxiosResponse, AxiosError } from "axios";
import { Link } from "react-router-dom";
import { AdnatState, Organization } from "../types";
import { connect } from "react-redux";
import { AuthState } from "../types/auth-types";
import { authByToken, logoutUser } from "../actions/auth-actions";
import ReactTable from 'react-table';

interface OrgWorkSpaceData {
  organization: Organization;
  member: boolean;
  editing?: boolean;
}

interface OrgWorkSpace {
  [key:number] : OrgWorkSpaceData
}

interface IOrganizationListProps {
  auth: AuthState;
  logoutUser:Function;
  authByToken:Function;
}

interface IOrganizationListState {
  workSpace: OrgWorkSpace,
  loading: boolean;
}

class OrganizationList extends React.Component <IOrganizationListProps, IOrganizationListState> {

  constructor(props) {
    super(props);
    this.state = { 
      workSpace: [],
      loading: false
    }
  }
  
  componentDidMount(){
    this.loadOrganizationList();
  }

  preventSubmit = (e:React.FormEvent) => {
    e.preventDefault();
  }

  loadOrganizationList = async () => {
    this.setState({...this.state, loading: true});

    try {
      return await axios({
      method: 'GET',
      url: "/api/organizations",
      headers: { 
        'Content-Type':     'application/json',
        'Authorization':    `${this.props.auth.token}`
          }
      }).then( (resp: AxiosResponse) => {
        let workSpace = {};

        workSpace[0] = { 
          organization: {
            id: 0,
            name: '',
            hourly_rate: 10
          },
          member: true,
          editing: true
         };

        resp.data.forEach((orgInfo:OrgWorkSpaceData) => {
          workSpace[orgInfo.organization.id] = { ...orgInfo, editing: false };
        });

        this.setState({workSpace: workSpace, loading: false});

      }).catch( (error:AxiosError) => {
        setTimeout( () => this.loadOrganizationList(), 2000 );
      });
    } catch(error) {
      setTimeout( () => this.loadOrganizationList(), 2000 );
    }
  }

  membershipAction = async (orgId:number, action:string) => {
    this.setState({...this.state, loading: true});

    try {
      const act:string = action === 'join' ? 'join' : 'leave';

      return await axios({
      method: 'GET',
      url: `/api/users/${this.props.auth.user.id}/organizations/${orgId}/${act}`,
      headers: { 
        'Content-Type':     'application/json',
        'Authorization':    `${this.props.auth.token}`
          }
      }).then( (resp: AxiosResponse) => {
        //reload user info after joining
        this.props.authByToken(this.props.auth.token);
        this.setState({ loading: false });
        this.loadOrganizationList();

      }).catch( (error:AxiosError) => {
        if(error.response.data.message){
          alert(error.response.data.message);
        } else {
          alert('Server error. Try again later.');
        }
      });
    } catch(error) {
      alert('Handling error: ' + error);
    }
  }

  saveOrganization = async (orgId:number) => {
    this.setState({...this.state, loading: true});

    const organizationData:Organization = this.state.workSpace[orgId].organization;

    try {
      return await axios({
        method: orgId === 0 ? 'post' : 'patch',
        url: orgId === 0 ? `/api/users/${this.props.auth.user.id}/organizations` : `/api/users/${this.props.auth.user.id}/organizations/${orgId}`,
        data: {
          name: organizationData.name,
          rate: organizationData.hourly_rate
        },
        headers: { 
          'Content-Type':   'application/json',
          'Authorization':  `${this.props.auth.token}`  
        }
      }).then( (resp: AxiosResponse) => {
        //dispatch a reload for user data
        this.props.authByToken(this.props.auth.token);

        if(orgId !== 0){
          //just edit
          const { workSpace } = this.state;

          this.setState({
            workSpace: { ...workSpace,
              [orgId]: {
                ...workSpace[orgId],
                editing: false
              } 
            }
          });
        } else {
          //new entry, reload
          this.loadOrganizationList();
        }
        
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

  renderOrgName = (cellInfo) => {
    if(cellInfo.original.editing){
      return <Input type="text"
        onChange={(e) => {
          const { workSpace } = this.state;

          this.setState({
            workSpace: { ...workSpace,
              [cellInfo.original.organization.id]: {
                ...workSpace[cellInfo.original.organization.id],
                organization: {
                  ...workSpace[cellInfo.original.organization.id].organization,
                  name: e.target.value
                }
              } 
            }
          });
        }}
        value={cellInfo.original.organization.name} />
    } else {
      return <div>{cellInfo.original.organization.name}</div>
    }
  }

  renderOrgRate = (cellInfo) => {
    if(cellInfo.original.editing){
      return <Input type="text"
        onChange={(e) => {
          const { workSpace } = this.state;
          const { organization } = workSpace[cellInfo.original.organization.id];

          let rate:number = parseFloat(e.target.value);
          let data:Organization = { ...organization, hourly_rate: isNaN(rate)  ? 0: rate };

          this.setState({
            workSpace: { ...workSpace,
              [cellInfo.original.organization.id]: {
                ...workSpace[cellInfo.original.organization.id],
                organization: data
              } 
            }
          });
        }}
        value={cellInfo.original.organization.hourly_rate} />
    } else {
      return <div>{cellInfo.original.organization.hourly_rate}</div>
    }
  }

  renderMemberActionBtn = (isMember:boolean, orgId:number) => {
    if(!isMember){
      return <Button color="success" onClick={(e) => {
        this.membershipAction(orgId, 'join');
      }}>Join</Button>
    } else {
      return <Button color="danger" onClick={(e) => {
        this.membershipAction(orgId, 'leave');
      }}>Leave</Button>
    }
  }

  actionCancelBtnCol = (original:OrgWorkSpaceData) => {
    if(original.editing && original.organization.id !== 0){
      return <Button 
      color="warning"
      onClick={(e) => {
        const orgId:number = original.organization.id;
        const { workSpace } = this.state;

        this.setState({
          workSpace: { ...workSpace,
            [orgId]: {
              ...workSpace[orgId],
              editing: false
            } 
          }
        });
      }}>Cancel</Button>
    }
  }

  actionBtnCol = (cellInfo) => {
    if(cellInfo.original.editing){
      return (
        <div><Button color="primary"
      disabled={cellInfo.original.organization.name.trim() === '' || cellInfo.original.organization.hourly_rate <= 0}
      onClick={(e) => {
        this.saveOrganization(cellInfo.original.organization.id);
      }}>{cellInfo.original.organization.id === 0 ? 'Create And Join' : 'Save'}</Button>{' '}
      {this.actionCancelBtnCol(cellInfo.original)}
      </div>
      )
    } else {
      return (
        <div>
          <Button color="primary" onClick={(e) => {
            this.setState({
              workSpace: { ...this.state.workSpace, 
                [cellInfo.original.organization.id]: {
                  ...this.state.workSpace[cellInfo.original.organization.id],
                  editing: true
                } }
            });
          }}>Edit</Button>{' '}
          {this.renderMemberActionBtn(cellInfo.original.member, cellInfo.original.organization.id)}
        </div>
      );
    }
  }

  renderOrgMembershipNotice = () => {
    if(this.props.auth.user.organizations && this.props.auth.user.organizations.length === 0){
      return <p>You aren't member of any organizations. Join an existing one or create a new one.</p>
    } else {
      return <p><Link to="/" className="btn btn-primary">Dashboard</Link></p>
    }
  }

  renderTable = () => {
    const columns = [
      {
        Header: () => <strong>Organization</strong>,
        Accessor: 'name',
        sortable: false,
        Cell: this.renderOrgName
      },
      {
        Header: () => <strong>Hourly Rate</strong>,
        sortable: false,
        Accessor: 'hourly_rate',
        Cell: this.renderOrgRate
      },
      {
        Header: () => <div></div>,
        Cell: this.actionBtnCol,
        sortable: false
      }
    ]

    const { workSpace } = this.state;
    const data = Object.values(workSpace);

    return (
      <Container>
        <Row>
          <Col>
            <h1>Adnat System: Organizations</h1>
          </Col>
        </Row>
        <Row>
          <Col>
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
              </CardHeader>
              <CardBody>
                {this.renderOrgMembershipNotice()}
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
        </Row>
      </Container>
    );
  }

  render(){
    if(this.state.loading){
      return this.loading();
    } else {
      return this.renderTable();
    }
  }
}

const mapStateToProps = (state:AdnatState) => ({
  auth: state.auth
})

export default connect(
  mapStateToProps, 
  { logoutUser,
    authByToken })(OrganizationList);