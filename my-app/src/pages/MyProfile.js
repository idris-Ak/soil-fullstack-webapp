import React, { useState, useEffect } from 'react';
import {Card, Button, Row, Col, Alert, Modal, Form} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function MyProfile({currentUser, updateCurrentUser, logoutUser}) {
  //Get current user from local storage 
  const currentUserEmail = localStorage.getItem('currentUserEmail');
  const [userDetails, setUserDetails] = useState({name:'', email:'', dateJoined:''});
  //State for new user details upon editing their profile
  const [editDetails, setEditDetails] = useState({name:'', email:'', newPassword:'', confirmNewPassword:''});
  //State for displaying the profile edit page
  const[showEditPage, setEditPage] = useState(false);
  const[showAlert, setAlert] = useState(false);
  //State for the alert messages 
  const[alertContent, setAlertContent] = useState('');
  const[alertContentDanger, setAlertContentDanger] = useState('');
  const[showAlertDanger, setAlertDanger] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    //Fetch all users from localStorage and find the current user by email
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUser = users.find(user => user.email === currentUserEmail);
    if (currentUser) {
      //If currentUser exists, set userDetails to currentUser details
      setUserDetails(currentUser);
      setEditDetails({ ...currentUser, newPassword: '', confirmNewPassword: '' });
    } else {
      navigate("/Login");
    }
  }, [currentUserEmail, navigate]);

  const handleSaveChanges = () => {
    //Handle password changes when user is editing their profile
    if (editDetails.newPassword && editDetails.newPassword !== editDetails.confirmNewPassword) {
      setAlertContentDanger("New passwords do not match.");
      setAlertDanger(true);
      setTimeout(() => {
        setAlertDanger(false);
        }, 2500);
      return;
    }

    if (editDetails.newPassword && !isPasswordStrong(editDetails.newPassword)) {
      //Check if new password is strong or not
      setAlertContentDanger("Password does not meet the strong criteria.");
      setAlertDanger(true);
      setTimeout(() => {
        setAlertDanger(false);
        }, 2500);
      return;
    }

    //Verify if the new email is already registered or not 
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const emailTaken = users.some(user => user.email === editDetails.email && user.email !== currentUserEmail);

    if (editDetails.email !== currentUserEmail && emailTaken) {
      setAlertContentDanger("The email given is already registered.");
      setAlertDanger(true);
      setTimeout(() => {
        setAlertDanger(false);
      }, 2500);
      return;
    }


  //Find the index of the current user in the users array and update the current user
    const userIndex = users.findIndex(user => user.email === currentUserEmail);
    if (userIndex !== -1) {
      const updatedUser = {
        ...currentUser,
        name: editDetails.name,
        email: editDetails.email,
        password: editDetails.newPassword ? editDetails.newPassword : currentUser.password,
        confirmPassword: editDetails.confirmNewPassword ? editDetails.confirmNewPassword : currentUser.confirmPassword,
        dateJoined: currentUser.dateJoined
      };
      users[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
      //Update the currentUserEmail if email was changed
      if (currentUserEmail !== editDetails.email) {
        localStorage.setItem('currentUserEmail', updatedUser.email);
      }
      updateCurrentUser(updatedUser);
      setUserDetails(updatedUser);
      //Update local state to reflect changes
      setAlertContent('Profile Successfully Updated!');
      setAlert(true);
      setTimeout(() => {
        setAlert(false);
      }, 2000);
      setEditPage(false);
    }
     };

     const handleDeleteProfile = () => {
      //Remove the current user logged in from local storage 
      let users = JSON.parse(localStorage.getItem('users')) || [];
      users = users.filter(user => user.email !== currentUserEmail);
      localStorage.setItem('users', JSON.stringify(users));
      setAlertContent('Profile Successfully Deleted!');
      setShowDeleteConfirm(false);
      setAlert(true);
      setTimeout(() => {
        //This function will logout the user after the profile is successfully deleted
        logoutUser();
        setAlert(false);
        //Navigate back to login page after successful deletion
        navigate('/Login');
      }, 2500);
    };

  //Handle the change of user details if edited
  const handleChange = (event) => {
    const { name, value } = event.target;
    setEditDetails(prevDetails => ({ ...prevDetails, [name]: value }));
  };

  //OpenAI (2024) ChatGPT [Large language model], accessed 20 March 2024. (*Link could not be generated successfully*)
  const isPasswordStrong = (password) => {
    const re = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*()_+\\-={}[\\]\\\\|;:'\",<.>/?~`])(?=.{8,})");
    return re.test(password);
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{minHeight:'85vh'}}>
         <Card style={{ width: '60rem', background: 'rgba(249, 249, 249, 0.9)', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)' }}>
          {/* Unsplash (2024) organic-foods, accessed 20 March 2024. https://source.unsplash.com/1600x900/?organic-foods */}
          <Card.Img variant="top" src="https://source.unsplash.com/1600x900/?organic-foods" style={{ objectFit: 'cover', height: '200px', opacity: '0.8' }} />
         <Card.Body className = "pb-4">
         {showAlert && alertContent &&(<Alert variant="success">{alertContent}</Alert>)}
            <Card.Title className="text-center mb-4" style={{ fontSize: '2.5rem', fontWeight: '700', color: '#34515e', fontFamily: 'Lato, sans-serif'}}>Profile Details</Card.Title>
            <hr />
            <div style={{lineHeight: '2', fontFamily: 'Lato, sans-serif', color: '#52634f', fontSize:'30px'}}>
              <div className="mb-4" ><strong>Name:</strong> <span style={{ fontWeight: '400' }}>{userDetails.name}</span></div>
              <hr style={{borderTop: '1px solid #e2e2e2'}} />
              <div className="mb-4"><strong>Email:</strong> <span style={{ fontWeight: '400' }}>{userDetails.email}</span></div>
              <hr style={{borderTop: '1px solid #e2e2e2'}} />
              <div className="mb-4"><strong>Date Joined:</strong> <span style={{ fontWeight: '400' }}>{userDetails.dateJoined}</span></div>
              <hr style={{borderTop: '1px solid #e2e2e2'}} />
            </div>
            <Row className="mt-5">
            <Col className="d-flex justify-content-start">
            <Button variant ="outline-success" onClick={() => setEditPage(true)} style={{fontSize: '20px', fontFamily: 'Lato, sans-serif'}}>
              {/*<a href="https://www.flaticon.com/free-icons/compose" title="compose icons">Compose icons created by hqrloveq - Flaticon</a>*/}
              Edit Profile <img src="/draw.png" alt="EditProfile" className="d-inline-block align-center" style={{ width: '24px', height: '24px', borderRadius: '100%' }} /> </Button>
            </Col>
            <Col className="d-flex justify-content-end">
            <Button variant="outline-danger"  onClick={() => setShowDeleteConfirm(true)} style={{fontSize: '20px', fontFamily: 'Lato, sans-serif'}}>
              {/*<a href="https://www.flaticon.com/free-icons/trash-can" title="trash can icons">Trash can icons created by kliwir art - Flaticon</a>*/}
              Delete Profile <img src="/bin.png" alt="DeleteProfile" className="d-inline-block align-center" style={{ width: '24px', height: '24px', borderRadius: '100%' }} /> </Button>            </Col>
            </Row>
              </Card.Body>
         </Card>
         <Modal show={showEditPage} onHide={() => setEditPage(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
          {showAlertDanger && alertContentDanger && <Alert variant="danger">{alertContentDanger}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={editDetails.name} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={editDetails.email} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control type="password" name="newPassword" value={editDetails.newPassword} onChange={handleChange} placeholder="New Password" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control type="password" name="confirmNewPassword" value={editDetails.confirmNewPassword} onChange={handleChange} placeholder="Confirm New Password" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="secondary" onClick={() => setEditPage(false)}>Close</Button>
          <Button variant="primary" onClick={handleSaveChanges}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete your profile? This action cannot be undone.</Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteProfile}>Delete Profile</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default MyProfile;
