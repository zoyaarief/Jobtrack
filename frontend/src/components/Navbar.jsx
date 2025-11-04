import { Navbar, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FiBriefcase } from "react-icons/fi";

export default function Topbar() {
   return (
      <Navbar
         expand='md'
         bg='body-tertiary'
         className='border-bottom sticky-top'
      >
         <Container>
            <Navbar.Brand
               as={Link}
               to='/'
               className='d-flex align-items-center gap-2 fw-semibold'
            >
               <FiBriefcase /> JobTrack
            </Navbar.Brand>
         </Container>
      </Navbar>
   );
}
