import React, { useContext } from 'react';
import { Users } from 'lucide-react';
import { AuthContext } from '../AuthContext';

export default function Navbar({ currentPage, navigate }) {
  const { user } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigate('home')}>TaskEasy</div>
      <ul className="nav-links">
        <li>
          <button 
            onClick={() => navigate('home')}
            className={currentPage === 'home' ? 'active' : ''}
          >
            Home
          </button>
        </li>
        
        {user ? (
          <>
            <li>
              <button 
                onClick={() => navigate('groups')}
                className={currentPage === 'groups' ? 'active' : ''}
              >
                <Users className="icon" size={18} />
                Groups
              </button>
            </li>
            {user.currentGroupId && (
              <li>
                <button 
                  onClick={() => navigate('group-tasks')}
                  className={currentPage === 'group-tasks' ? 'active' : ''}
                >
                  Tasks
                </button>
              </li>
            )}
          </>
        ) : (
          <>
            <li>
              <button 
                onClick={() => navigate('login')}
                className={currentPage === 'login' ? 'active' : ''}
              >
                Login
              </button>
            </li>
            <li>
              <button 
                onClick={() => navigate('signup')}
                className={currentPage === 'signup' ? 'active' : ''}
              >
                Sign Up
              </button>
            </li>
          </>
        )}
        
        <li>
          <button 
            onClick={() => navigate('pricing')}
            className={currentPage === 'pricing' ? 'active' : ''}
          >
            Pricing
          </button>
        </li>
        <li>
          <button 
            onClick={() => navigate('about')}
            className={currentPage === 'about' ? 'active' : ''}
          >
            About
          </button>
        </li>
      </ul>
    </nav>
  );
}
